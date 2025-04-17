// Import any necessary modules or dependencies
// For example, you might need to import the 'jsonwebtoken' module

const jwt = require("jsonwebtoken");

// Define the token authentication middleware function
const authorization = (permittedRoles)=>{

  return (req, res, next) => {
    // Get the token from the request headers or query parameters
   
    try {
      // permittedRoles = ['admin']
      let user = req.user;
      // role === 'admin';
      if(!permittedRoles.includes(user.role)){
        return res.status(403).json({ message: 'Forbidden' });
      }
  
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
  
} 

// mongoose methods: 1. findByID2. findOne3. findOneAndUpdate4. update5. updateMany6. findByIdAndUpdate

// Export the middleware function
module.exports = authorization;