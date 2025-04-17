// Import any necessary modules or dependencies
// For example, you might need to import the 'jsonwebtoken' module

const jwt = require("jsonwebtoken");

// Define the token authentication middleware function
const authenticate = (req, res, next) => {
  // Get the token from the request headers or query parameters
  const token = (req.headers.authorization?.split(" ")[1]) || req.query.token;

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    
    const decoded = jwt.verify(token, 'hans');
    req.user = decoded; // {userId: ''}
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};


// mongoose methods: 1. findByID2. findOne3. findOneAndUpdate4. update5. updateMany6. findByIdAndUpdate

// Export the middleware function
module.exports = authenticate;