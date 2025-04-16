const mongoose = require('mongoose');


const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    required: true,
  },
  status: {
    
    type: String,
    enum: ['PENDING', "COMPLETED", "IN_PROGRESS", "CANCELLED"],
    default: "PENDING",
    required: true,
  },
  userId: {
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref : 'User'
  },



    
}, {
  timestamps: true,
  versionKey: false,
})


const TodoModel = mongoose.model('todo', todoSchema);

module.exports = TodoModel;