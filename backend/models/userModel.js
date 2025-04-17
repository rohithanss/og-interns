const mongoose = require('mongoose');
const {mongooseWriteBufferPlugin} = require('../mongoose-kafka-plugin');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type:String,
    enum : ['USER', 'ADMIN'],
    default:'USER'
  }
    
}, {
  timestamps: true,
  versionKey: false,
})

userSchema.index({ email: 1 });

// userSchema.plugin(mongooseWriteBufferPlugin, {
//   redis: {
//     host: 'localhost',
//     port: 6379,
//     keyPrefix: 'app:users:'
//   },
//   kafka: {
//     clientId: 'user-service',
//     brokers: ['localhost:9092'],
//     topic: 'mongodb-user-ops'
//   },
//   buffer: {
//     maxSize: 1000,        // Flush after 1000 operations
//     flushInterval: 5000   // Or after 5 seconds
//   }
// });

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;