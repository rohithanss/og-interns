// app.js

const express = require('express');
const app = express();
const port = 3000;
const authRouter  = require('./routes/auth.router.js');
const todoRouter  = require('./routes/todo.router.js');
const baseRouter = require('./routes/base.router.js');
const authenticate = require('./middlewares/authenticate.js');
require('./config/db.js');
// Middleware to parse JSON request bodies
app.use(express.json());

// GET method
app.use((a,b,c)=>{
  // authenticate here;
  c();
})
app.use('/auth', authRouter);
app.use('/todo',authenticate,  todoRouter)
app.use(baseRouter )
// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
