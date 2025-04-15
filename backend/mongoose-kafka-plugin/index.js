// mongoose-write-buffer/index.js
const Redis = require('ioredis');
const { Kafka } = require('kafkajs');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const debug = require('debug')('mongoose-write-buffer');

class MongooseWriteBuffer {
  constructor(options = {}) {
    this.options = {
      redis: {
        host: 'localhost',
        port: 6379,
        keyPrefix: 'mongo-buffer:',
        ...options.redis
      },
      kafka: {
        clientId: 'mongoose-write-buffer',
        brokers: ['localhost:9092'],
        topic: 'mongodb-operations',
        ...options.kafka
      },
      buffer: {
        maxSize: 1000,
        flushInterval: 5000, // ms
        ...options.buffer
      },
      models: options.models || 'all', // 'all' or array of model names
      redisExpiry: options.redisExpiry || 86400, // 24 hours by default
      enabled: options.enabled !== false,
      disableFindBuffering: options.disableFindBuffering || false
    };

    this.operationsBuffer = [];
    this.redis = new Redis(this.options.redis);
    
    this.kafka = new Kafka(this.options.kafka);
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: `mongoose-write-buffer-${uuidv4().slice(0, 8)}` });
    
    this.flushInterval = null;
    this.connected = false;
    this.redisKeys = new Set();
    
    // Statistics for monitoring
    this.stats = {
      bufferedOperations: 0,
      flushes: 0,
      kafkaMessages: 0,
      redisHits: 0,
      redisMisses: 0,
      mongoQueries: 0
    };
  }

  async connect() {
    if (this.connected) return;
    
    debug('Connecting to Kafka and setting up consumer...');
    await this.producer.connect();
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.options.kafka.topic, fromBeginning: false });
    
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const operation = JSON.parse(message.value.toString());
        this.handleKafkaMessage(operation);
      }
    });
    
    this.connected = true;
    this.startFlushInterval();
    debug('Mongoose write buffer initialized and connected');
  }

  async handleKafkaMessage(operation) {
    try {
      // Store operation in Redis for read-after-write consistency
      const key = this.getRedisKey(operation);
      this.redisKeys.add(key);
      
      if (operation.type === 'delete') {
        await this.redis.del(key);
      } else {
        await this.redis.set(
          key, 
          JSON.stringify(operation.data),
          'EX',
          this.options.redisExpiry
        );
      }
      
      this.stats.kafkaMessages++;
    } catch (error) {
      debug('Error handling Kafka message:', error);
    }
  }

  getRedisKey(operation) {
    const { model, query, data, type } = operation;
    
    if (type === 'create') {
      // For creates, use the _id of the document
      return `${this.options.redis.keyPrefix}${model}:${data._id}`;
    } else if (type === 'update' || type === 'delete') {
      // For updates and deletes, stringify the query to make a key
      // This is simplified and might need more robust handling in production
      if (query._id) {
        return `${this.options.redis.keyPrefix}${model}:${query._id}`;
      } else {
        // For non-_id queries, create a hash of the query
        // In production, you might want a more robust solution
        const queryStr = JSON.stringify(query);
        return `${this.options.redis.keyPrefix}${model}:query:${Buffer.from(queryStr).toString('base64')}`;
      }
    }
  }

  async disconnect() {
    debug('Disconnecting mongoose write buffer...');
    
    // Flush any remaining operations
    await this.flush();
    
    // Clear the flush interval
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Disconnect from Kafka and Redis
    await this.consumer.disconnect();
    await this.producer.disconnect();
    this.redis.disconnect();
    
    this.connected = false;
    debug('Mongoose write buffer disconnected');
  }

  startFlushInterval() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    this.flushInterval = setInterval(() => {
      if (this.operationsBuffer.length > 0) {
        debug(`Auto-flushing ${this.operationsBuffer.length} operations after interval`);
        this.flush().catch(err => {
          debug('Error during auto-flush:', err);
        });
      }
    }, this.options.buffer.flushInterval);
  }

  async bufferOperation(operation) {
    if (!this.connected) {
      await this.connect();
    }
    
    // Add the operation to our buffer
    this.operationsBuffer.push(operation);
    this.stats.bufferedOperations++;
    
    // Also send to Kafka for real-time read consistency
    await this.producer.send({
      topic: this.options.kafka.topic,
      messages: [
        { 
          key: `${operation.model}-${operation.type}`, 
          value: JSON.stringify(operation) 
        }
      ]
    });
    
    // If buffer exceeds max size, flush it
    if (this.operationsBuffer.length >= this.options.buffer.maxSize) {
      debug(`Flushing buffer after reaching max size of ${this.options.buffer.maxSize}`);
      await this.flush();
    }
    
    return operation;
  }

  async flush() {
    if (this.operationsBuffer.length === 0) {
      return;
    }
    
    debug(`Flushing ${this.operationsBuffer.length} operations to MongoDB`);
    
    // Group operations by model for bulk operations
    const operationsByModel = {};
    
    this.operationsBuffer.forEach(op => {
      if (!operationsByModel[op.model]) {
        operationsByModel[op.model] = [];
      }
      operationsByModel[op.model].push(op);
    });
    
    // Process each model's operations
    const promises = Object.entries(operationsByModel).map(async ([modelName, operations]) => {
      try {
        const model = mongoose.model(modelName);
        
        // Group operations by type (create, update, delete)
        const creates = [];
        const updates = [];
        const deletes = [];
        
        operations.forEach(op => {
          if (op.type === 'create') {
            creates.push({ insertOne: { document: op.data } });
          } else if (op.type === 'update') {
            updates.push({ 
              updateOne: { 
                filter: op.query, 
                update: op.data,
                upsert: op.options?.upsert || false
              } 
            });
          } else if (op.type === 'delete') {
            deletes.push({ deleteOne: { filter: op.query } });
          }
        });
        
        // Execute bulk operations
        const bulkOps = [...creates, ...updates, ...deletes];
        if (bulkOps.length > 0) {
          await model.bulkWrite(bulkOps, { ordered: false });
        }
        
        debug(`Successfully flushed ${bulkOps.length} operations for model ${modelName}`);
      } catch (error) {
        debug(`Error flushing operations for model ${modelName}:`, error);
        throw error;
      }
    });
    
    await Promise.all(promises);
    this.stats.flushes++;
    this.operationsBuffer = [];
  }

  async findWithBuffer(model, query, options = {}) {
    if (!this.connected) {
      await this.connect();
    }

    this.stats.mongoQueries++;
    const modelName = model.modelName;
    const isIdQuery = query._id;
    
    // First check if we're dealing with a simple _id query
    if (isIdQuery && !this.options.disableFindBuffering) {
      const redisKey = `${this.options.redis.keyPrefix}${modelName}:${query._id}`;
      
      // Check Redis first for any buffered changes
      const bufferedData = await this.redis.get(redisKey);
      
      if (bufferedData) {
        this.stats.redisHits++;
        debug(`Redis hit for ${modelName}:${query._id}`);
        return JSON.parse(bufferedData);
      }
      
      this.stats.redisMisses++;
    }
    
    // If not found in Redis or not a simple query, fetch from MongoDB
    // For more complex queries, you'd need to merge database results with buffered operations
    return null; // Return null to indicate the caller should proceed with the original query
  }

  // Gets statistics about buffer performance and state
  getStats() {
    return {
      ...this.stats,
      currentBufferSize: this.operationsBuffer.length,
      redisKeyCount: this.redisKeys.size
    };
  }

  // Reset all statistics
  resetStats() {
    Object.keys(this.stats).forEach(key => {
      this.stats[key] = 0;
    });
  }
}

/**
 * Mongoose plugin function
 */
function mongooseWriteBufferPlugin(schema, options = {}) {
  const bufferInstance = options.instance || new MongooseWriteBuffer(options);
  
  // Make sure we're connected
  if (!bufferInstance.connected) {
    bufferInstance.connect().catch(err => {
      debug('Error connecting buffer instance:', err);
    });
  }
  
  // Store the original methods
  const originalSave = schema.methods.save;
  const originalRemove = schema.methods.remove;
  const originalFindOneAndUpdate = schema.statics.findOneAndUpdate;
  const originalUpdateOne = schema.statics.updateOne;
  const originalUpdateMany = schema.statics.updateMany;
  const originalDeleteOne = schema.statics.deleteOne;
  const originalDeleteMany = schema.statics.deleteMany;
  const originalFind = schema.statics.find;
  const originalFindOne = schema.statics.findOne;
  const originalFindById = schema.statics.findById;
  const originalCreate = schema.statics.create;
  
  // Override the save method
  schema.methods.save = async function(options = {}) {
    const modelName = this.constructor.modelName;
    
    // Check if this model should be buffered
    if (!shouldBufferModel(modelName, bufferInstance.options.models)) {
      return originalSave.call(this, options);
    }
    
    if (!bufferInstance.options.enabled) {
      return originalSave.call(this, options);
    }
    
    // Handle new documents
    if (this.isNew) {
      // Buffer the create operation
      await bufferInstance.bufferOperation({
        model: modelName,
        type: 'create',
        data: this.toObject(),
        timestamp: Date.now()
      });
      
      // We still need to call the original save for proper mongoose internals
      // In a full implementation, you'd handle this more elegantly
      return originalSave.call(this, options);
    } else {
      // Handle updates to existing documents
      const updateData = this.getChanges();
      if (Object.keys(updateData).length === 0) {
        // No changes, just return the document
        return this;
      }
      
      // Buffer the update operation
      await bufferInstance.bufferOperation({
        model: modelName,
        type: 'update',
        query: { _id: this._id },
        data: { $set: updateData },
        options: { upsert: false },
        timestamp: Date.now()
      });
      
      // Still call original save for proper mongoose behavior
      return originalSave.call(this, options);
    }
  };
  
  // Override remove method
  schema.methods.remove = async function(options = {}) {
    const modelName = this.constructor.modelName;
    
    if (!shouldBufferModel(modelName, bufferInstance.options.models) || 
        !bufferInstance.options.enabled) {
      return originalRemove.call(this, options);
    }
    
    // Buffer the delete operation
    await bufferInstance.bufferOperation({
      model: modelName,
      type: 'delete',
      query: { _id: this._id },
      timestamp: Date.now()
    });
    
    return originalRemove.call(this, options);
  };
  
  // Override static methods for model
  schema.statics.findOneAndUpdate = async function(filter, update, options = {}) {
    const modelName = this.modelName;
    
    if (!shouldBufferModel(modelName, bufferInstance.options.models) || 
        !bufferInstance.options.enabled) {
      return originalFindOneAndUpdate.call(this, filter, update, options);
    }
    
    // Buffer the update operation
    await bufferInstance.bufferOperation({
      model: modelName,
      type: 'update',
      query: filter,
      data: update,
      options: { upsert: options.upsert || false },
      timestamp: Date.now()
    });
    
    return originalFindOneAndUpdate.call(this, filter, update, options);
  };
  
  // Similar overrides for updateOne, updateMany, etc.
  schema.statics.updateOne = async function(filter, update, options = {}) {
    const modelName = this.modelName;
    
    if (!shouldBufferModel(modelName, bufferInstance.options.models) || 
        !bufferInstance.options.enabled) {
      return originalUpdateOne.call(this, filter, update, options);
    }
    
    await bufferInstance.bufferOperation({
      model: modelName,
      type: 'update',
      query: filter,
      data: update,
      options: { upsert: options.upsert || false },
      timestamp: Date.now()
    });
    
    return originalUpdateOne.call(this, filter, update, options);
  };
  
  schema.statics.create = async function(docs, options = {}) {
    const modelName = this.modelName;
    
    if (!shouldBufferModel(modelName, bufferInstance.options.models) || 
        !bufferInstance.options.enabled) {
      return originalCreate.call(this, docs, options);
    }
    
    // Handle array of docs or single doc
    const docArray = Array.isArray(docs) ? docs : [docs];
    
    // Buffer each document creation
    const bufferPromises = docArray.map(doc => 
      bufferInstance.bufferOperation({
        model: modelName,
        type: 'create',
        data: doc,
        timestamp: Date.now()
      })
    );
    
    await Promise.all(bufferPromises);
    
    return originalCreate.call(this, docs, options);
  };
  
  // Override find-related methods to check buffered operations
  schema.statics.find = async function(query, projection, options) {
    const modelName = this.modelName;
    
    if (!shouldBufferModel(modelName, bufferInstance.options.models) || 
        !bufferInstance.options.enabled ||
        bufferInstance.options.disableFindBuffering) {
      return originalFind.call(this, query, projection, options);
    }
    
    // Check if this is a simple _id query where we can use our Redis buffer
    const bufferedData = await bufferInstance.findWithBuffer(this, query, options);
    if (bufferedData) {
      // If we found data in the buffer, return it as a model instance
      return this.hydrate(bufferedData);
    }
    
    // Otherwise, fall back to the original MongoDB query
    return originalFind.call(this, query, projection, options);
  };
  
  schema.statics.findOne = async function(query, projection, options) {
    const modelName = this.modelName;
    
    if (!shouldBufferModel(modelName, bufferInstance.options.models) || 
        !bufferInstance.options.enabled ||
        bufferInstance.options.disableFindBuffering) {
      return originalFindOne.call(this, query, projection, options);
    }
    
    const bufferedData = await bufferInstance.findWithBuffer(this, query, options);
    if (bufferedData) {
      return this.hydrate(bufferedData);
    }
    
    return originalFindOne.call(this, query, projection, options);
  };
  
  schema.statics.findById = async function(id, projection, options) {
    const modelName = this.modelName;
    
    if (!shouldBufferModel(modelName, bufferInstance.options.models) || 
        !bufferInstance.options.enabled ||
        bufferInstance.options.disableFindBuffering) {
      return originalFindById.call(this, id, projection, options);
    }
    
    const bufferedData = await bufferInstance.findWithBuffer(this, { _id: id }, options);
    if (bufferedData) {
      return this.hydrate(bufferedData);
    }
    
    return originalFindById.call(this, id, projection, options);
  };
  
  // Add the buffer instance to the model for direct access
  schema.statics.getWriteBuffer = function() {
    return bufferInstance;
  };
  
  // Force flush the buffer
  schema.statics.flushBuffer = async function() {
    return bufferInstance.flush();
  };
}

// Helper to check if a model should be buffered
function shouldBufferModel(modelName, configModels) {
  if (configModels === 'all') {
    return true;
  }
  
  if (Array.isArray(configModels)) {
    return configModels.includes(modelName);
  }
  
  return false;
}

// Helper to get changes from a mongoose document
mongoose.Document.prototype.getChanges = function() {
  const modified = {};
  
  if (!this.isModified()) {
    return modified;
  }
  
  this.modifiedPaths().forEach(path => {
    modified[path] = this.get(path);
  });
  
  return modified;
};

module.exports = {
  MongooseWriteBuffer,
  mongooseWriteBufferPlugin
};
