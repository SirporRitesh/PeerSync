import express from 'express';
import User from '../models/User.js'; // Use ESM import

const router = express.Router();

// Define your routes here
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await User.signup(email, password);
    res.status(201).json(result);
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Read email and password from req.body

    // Use the User model's login method to authenticate the user
    const result = await User.login(email, password);

    // Return the result (message and token)
    res.status(200).json(result);
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(400).json({ message: err.message }); // Handle errors
  }
});

export default router;
