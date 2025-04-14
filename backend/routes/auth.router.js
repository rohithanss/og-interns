const express = require('express');
const router = express.Router();

// POST /auth/login

router.get('/user', (req, res) => {
  // const { email, password } = req.body;
  // Placeholder login logic
  res.send(`Login attempt with email: `);
});


router.post('/login', (req, res) => {
  const { email, password } = req.body;
  // Placeholder login logic
  res.send(`Login attempt with email: ${email}`);
});

// POST /signup
router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  // Placeholder signup logic
  res.send(`Signup attempt for: ${name}, email: ${email}`);
});

// POST /forget-password
router.post('/forget-password', (req, res) => {
  const { email } = req.body;
  // Placeholder password reset logic
  res.send(`Password reset link sent to: ${email}`);
});

module.exports = router;