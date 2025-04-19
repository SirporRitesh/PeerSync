const express = require('express');
const router = express.Router();
const User = require('../models/User');  // Import the User model

// Signup route
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Call the signup method from User.js
    const result = await User.signup(email, password);
    res.status(201).json(result);  // Send the result (success message + token)
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: err.message });  // Send error if any occurs
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await User.login(email, password);
    res.json(result);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
