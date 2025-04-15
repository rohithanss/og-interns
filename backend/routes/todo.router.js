const express = require("express");
const TodoModel = require("../models/todoModel")
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
    let doc = await TodoModel.find({userId:user.userId })
    res.send({
      message:"Todo created", 
      todos: doc

    })
  }catch(err)
  {
    res.send('Error hans')
  }
})
module.exports =
  router
