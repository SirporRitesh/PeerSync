import express from 'express';
import User from '../models/User.js'; // Use ESM import
import Workspace from '../models/Workspace.js'; // Import Workspace model
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    // Destructure all required fields from req.body
    const { firstName, lastName, username, email, password, workspaceName } = req.body;
    const result = await User.signup({ firstName, lastName, username, email, password, workspaceName });
    res.status(201).json(result);
  } catch (err) {
    console.error('Signup error:', err.message, err.stack);
    res.status(400).json({ message: err.message });
  }
});

// Login route
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

// Get user info route
router.get('/user', verifyToken, async (req, res) => {
  try {
    const user = req.user; // req.user is set by verifyToken middleware
    res.status(200).json({
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  } catch (err) {
    console.error('Error fetching user info:', err.message);
    res.status(500).json({ message: 'Failed to fetch user info' });
  }
});

export default router;