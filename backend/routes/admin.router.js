
const express = require('express');
const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const authorization = require('../middlewares/authorisation');
const TodoModel = require('../models/todoModel');
const RedisService = require('../services/redis.service');
const router = express.Router();

router.get('/users', async (req, res) => {

  let allUsers = await UserModel.find().select({
    password: 0
  });
  res.send({allUsers});
});

router.get('/all-todos', async (req, res) => {
  
  // let allTodos = await TodoModel.find().populate('userId')
  let counts = await TodoModel.aggregate([
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 }
      }
    }
    
    
  ])

  let allTodos = await TodoModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField:"userId", 
        foreignField: "_id", 
        as: "userId" // alias for the joined data
      }
    },
    {
      $unwind: "$userId" // Unwind the array to get individual user documents
    },
    {
      $project : {
        username : "$userId.name",
        useremail: "$userId.email",
        title: "$title",
        priority: "$priority",
        status: "$status",
        status2 : 'status'
      }
    }
    
  ])
  res.send({allTodos,counts});
})

router.get('/all-todo', async (req, res) => {
  
  // let allTodos = await TodoModel.find({$and: [{priority: 'low'}, {title: "second todo "}]}).populate('userId')
  
  // check if cached
  let cachedTodos = await new RedisService('allTodo').get();
  if(cachedTodos) return res.send({allTodos: (cachedTodos)});


  let allTodos = await TodoModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField:"userId", 
        foreignField: "_id", 
        as: "userId" // alias for the joined data
      }
    },
    {
      $unwind: "$userId" // Unwind the array to get individual user documents
    },
    {
      $project : {
        username : "$userId.name",
        useremail: "$userId.email",
        title: "$title",
        priority: "$priority",
        status: "$status",
        status2 : 'status'
      }
    }
    
  ])

  // save in redis;
  await new RedisService('allTodo').set(allTodos);
  res.send({allTodos});
})
module.exports = router;

// authorization()