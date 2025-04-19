const express = require('express');
const router = express.Router(); // Initialize the router
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User'); // Ensure this is the correct path to your User model
const Workspace = require('../models/WorkSpace'); // Ensure this is the correct path to your Workspace model

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user; // Attach the user to the request object
    next();
  } catch (err) {
    console.error('Error in authenticateUser middleware:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Invite a user to a workspace (Admin only)
router.post('/invite', authenticateUser, async (req, res) => {
  const { workspaceId, inviteCode } = req.body;

  try {
    console.log('Invite request:', { workspaceId, inviteCode });

    const userId = req.user._id; // Authenticated user
    console.log('Authenticated user ID:', userId);

    const workspace = await Workspace.findOne({ _id: workspaceId, inviteCode });
    console.log('Workspace found:', workspace);

    if (!workspace) {
      return res.status(400).json({ message: 'Invalid invite code or workspace not found' });
    }

    if (workspace.members.some(member => member.userId.toString() === userId.toString())) {
      return res.status(400).json({ message: 'You are already a member of this workspace' });
    }

    workspace.members.push({ userId, role: 'Member' });
    await workspace.save();

    res.status(200).json({ message: 'You have successfully joined the workspace' });
  } catch (err) {
    console.error('Error inviting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for user to join a workspace via invite code
router.post('/join', authenticateUser, async (req, res) => {
  const { inviteCode } = req.body;

  try {
    const userId = req.user._id; // Authenticated user
    const workspace = await Workspace.findOne({ inviteCode });

    if (!workspace) {
      return res.status(400).json({ message: 'Invalid invite code or workspace not found' });
    }

    // Check if user is already a member
    if (workspace.members.some(member => member.userId.toString() === userId.toString())) {
      return res.status(400).json({ message: 'You are already a member of this workspace' });
    }

    // Add user as a member with default role
    workspace.members.push({ userId, role: 'Member' });
    await workspace.save();

    res.status(200).json({ message: 'Successfully joined workspace' });
  } catch (err) {
    console.error('Error joining workspace:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; // Export the router
