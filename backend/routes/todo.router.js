const express = require("express");
const TodoModel = require("../models/todoModel");
const UserModel = require("../models/userModel");
const  mongoose = require("mongoose");
const router = express.Router()


router.post('/create',async (req,res,x)=>{
  try{

    let body = req.body;
    let user = req.user;
    // delete req.user;
    let doc = await TodoModel.create({...body, userId:user.userId })
    res.send({
      message:"Todo created", 
      createdDoc: doc

    })
  }catch(err)
  {
    res.send('Error hans')
  }
})

router.get('/all',async (req,res,x)=>{
  try{

    // let body = req.body;
    let user = req.user;
    // delete req.user;
    let doc = await TodoModel.find({
      userId: user.userId,
      // priority: req.query.priority
    }).populate('userId').select({
      // priority: 0,
      createdAt: 0,
      updatedAt: 0
    })


    // let doc2 = await TodoModel.updateMany({
    //   userId: user.userId,
    //   priority: req.query.priority
    // }, {
    //   priority : 'low'
    // })

    let doc3 = await TodoModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.userId)
        }
      },
      {
        $lookup: {
          from: "users",
          localField:"userId", 
          foreignField: "_id", 
          as: "user2" // 
        }
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0
        }
      }
   
    ])
  //   {
  //     $lookup:
  //       {
  //         from: "User",
  //         localField:"userId", // 
  //         foreignField: "_id", // 
  //         as: "user2" // 
  //       }
  //  }

    // doc = JSON.parse(JSON.stringify(doc))
    // for(let ele of doc){

    //   let user = await UserModel.findById(ele.userId);
    //   ele['user'] = JSON.parse(JSON.stringify((user)));
    //   // let user = await UserModel.findOne({_id: todo.userId, priority: 'low'});

    // }
  
    res.send({
      message:"Todo created", 
      todos: doc,
      doc3

    })
  }catch(err)
  {
    res.send('Error hans')
  }
})
module.exports =
  router
