const express = require('express');
const { getParams, getParamsBase, getData, getDataPost, getDataMiddleware } = require('../controllers/base.controller.js');

const router = express.Router();
router.get('/get-params',getParamsBase)
router.get('/get-params/:ele/:userID/:companyid', getParams);
router.get('/get-data', getDataMiddleware , getData);
router.post('/get-data-post', getDataPost);

module.exports = router;

