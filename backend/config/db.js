// connect mongodb using mongoose
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const uri = process.env.MONGODB_URI;
// const uri = 'mongodb://localhost:27017/mydatabase';
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
// Connect to MongoDB
mongoose.connect(uri, options)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
  