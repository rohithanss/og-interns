# mongoose-write-buffer

A high-performance Mongoose plugin that optimizes MongoDB write operations using Kafka and Redis.

## Features

- **Write Buffering**: Buffers write operations (create, update, delete) to reduce MongoDB load
- **Batch Processing**: Performs bulk writes to MongoDB based on configurable thresholds
- **Real-time Read Consistency**: Uses Redis and Kafka to ensure reads reflect the most recent writes
- **Configurable**: Apply to all models or specific models only
- **Automatic Recovery**: Uses Kafka for operation durability and recovery
- **Performance Monitoring**: Built-in statistics for tracking performance

## Installation

```bash
npm install mongoose-write-buffer
```

## Prerequisites

- Redis server
- Kafka broker
- MongoDB (with mongoose)

## Basic Usage

```javascript
const mongoose = require('mongoose');
const { mongooseWriteBufferPlugin } = require('mongoose-write-buffer');

// Apply globally to all models
mongoose.plugin(mongooseWriteBufferPlugin, {
  redis: {
    host: 'localhost',
    port: 6379
  },
  kafka: {
    clientId: 'my-app',
    brokers: ['localhost:9092'],
    topic: 'mongodb-ops'
  },
  buffer: {
    maxSize: 1000,        // Flush after 1000 operations
    flushInterval: 5000   // Or after 5 seconds
  }
});

// OR, apply to specific models only
const userSchema = new mongoose.Schema({
  name: String,
  email: String
});

userSchema.plugin(mongooseWriteBufferPlugin, {
  models: ['User'],  // Only buffer the User model
  buffer: {
    maxSize: 500,
    flushInterval: 3000
  }
});

const User = mongoose.model('User', userSchema);
```

## Advanced Configuration

```javascript
const { MongooseWriteBuffer, mongooseWriteBufferPlugin } = require('mongoose-write-buffer');

// Create a shared buffer instance for fine-grained control
const bufferInstance = new MongooseWriteBuffer({
  redis: {
    host: 'redis-server',
    port: 6379,
    keyPrefix: 'app:buffer:',
    // Any other ioredis options
  },
  kafka: {
    clientId: 'app-service',
    brokers: ['kafka-broker:9092'],
    topic: 'mongodb-operations',
    // Any other kafkajs options
  },
  buffer: {
    maxSize: 2000,        // Number of operations before auto-flush
    flushInterval: 10000  // Milliseconds between auto-flushes
  },
  models: ['User', 'Post', 'Comment'],  // Only buffer these models
  redisExpiry: 3600,                    // Redis key TTL in seconds
  disableFindBuffering: false           // Set to true to disable read-after-write
});

// Apply to schemas with the shared instance
userSchema.plugin(mongooseWriteBufferPlugin, {
  instance: bufferInstance
});

postSchema.plugin(mongooseWriteBufferPlugin, {
  instance: bufferInstance
});

// Manually flush buffer when needed
await User.flushBuffer();

// Get performance statistics
const stats = User.getWriteBuffer().getStats();
console.log(stats);
```

## How It Works

### Write Operations

1. When you perform a write operation (create/update/delete), it's added to an in-memory buffer
2. A copy is also sent to Kafka for durability and published to Redis for read consistency
3. When the buffer reaches `maxSize` or `flushInterval` passes, operations are grouped and executed as bulk writes in MongoDB
4. Operations are grouped by model and operation type for maximum efficiency

### Read Operations

1. When you query a document, the plugin first checks Redis to see if there's a buffered version
2. If found in Redis, the buffered version is returned (ensuring read-after-write consistency)
3. If not found in Redis, the plugin falls back to the original MongoDB query

## Performance Considerations

- **Memory Usage**: The buffer is kept in memory, so set appropriate buffer sizes
- **Durability**: Operations are sent to Kafka immediately for durability
- **Consistency**: The plugin ensures read-your-writes consistency
- **Redis Expiry**: Buffered documents in Redis expire after `redisExpiry` seconds
- **Scaling**: For high-throughput applications, consider deploying multiple instances with the same Kafka topic

## Monitoring

The plugin provides statistics to monitor its performance:

```javascript
const stats = User.getWriteBuffer().getStats();
console.log(stats);

// {
//   bufferedOperations: 1245,   // Total operations buffered
//   flushes: 5,                 // Number of buffer flushes
//   kafkaMessages: 1245,        // Messages sent to Kafka
//   redisHits: 89,              // Redis cache hits
//   redisMisses: 34,            // Redis cache misses
//   mongoQueries: 123,          // MongoDB queries processed
//   currentBufferSize: 245,     // Current operations in buffer
//   redisKeyCount: 987          // Number of keys in Redis
// }
```

## License

MIT
