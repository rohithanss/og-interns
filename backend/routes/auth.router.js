const express = require('express');
const UserModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const router = express.Router();

// POST /auth/login


router.post('/login', async  (req, res) => {
  console.log(req.body)
  const { email, password } = req.body;
  // Placeholder login logic
  // 


  let user = await UserModel.findOne({email, password});
  if(!user){
    res.status(401).send({messagge:"unauthorised"})
  }
  var token = await jwt.sign({userId: user._id, role: user.role || 'USER' }, 'hans');


  res.send({message:"login ", token});
});

// POST /signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  // Placeholder signup logic
  await UserModel.create(req.body);
  res.send(`Signup attempt for: ${name}, email: ${email}`);
});

// POST /forget-password
router.post('/forget-password', (req, res) => {
  const { email } = req.body;
  // Placeholder password reset logic
  res.send(`Password reset link sent to: ${email}`);
});

module.exports = router;