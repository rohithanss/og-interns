const UserModel = require('../models/userModel.js');

const getParams = (req, res) => {
  const query = req.params
  let {ele, userID, companyid} = query.ele;
  
  let data = [1,2,3,4].filter(item => item == ele);
  res.json({data, userID, companyid});
}

const getParamsBase = async (req, res) => {
  let query = req.query;
  let existingDoc = await UserModel.find();
  // if(existingDoc!=null) {
  //   return res.status(400).json({error: 'Email already exists'});
  // }
  let doc = await UserModel.create(query)
  res.json({message: 'Hello World!', doc, existingDoc});
}

const getData = (req, res, next) => {
  // let data = db.find()
  const query = req.query

  let {ele, userID, companyid} = query;
  let data = [1,2,3,4].filter(item => item == ele);
  if(data.length==0) return next();
  res.json({data, userID, companyid});
}
const getDataMiddleware = (req, res, next) => {
  // let data = db.find()
  const query = req.query
  let {ele, userID, companyid} = query;
  if([1,2,3,4].includes(ele)){
    next();
  }else{
    res.status(400).json({error: 'Invalid element'});
  }
}

// const validateEleId(id){

// }

const getDataPost = (req, res) => {
  const query = req.body;
  let ele = query.ele;
  let data = [1,2,3,4].filter(item => item == ele);
  res.send(data);
}
module.exports = {
  getParams,
  getParamsBase,
  getData,
  getDataPost,
  getDataMiddleware
}