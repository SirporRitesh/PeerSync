// routes/channel.js
import express from 'express';
import mongoose from 'mongoose';
import Workspace from '../models/Workspace.js';
import Channel from '../models/Channel.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/channels/:id - Get channel details by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    console.log(`Fetching channel with ID: ${req.params.id}`); // Log channel ID
    const channel = await Channel.findById(req.params.id).populate('members', 'email');
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    res.status(200).json(channel);
  } catch (err) {
    console.error('Error fetching channel:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create a Channel (POST route)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { workspaceId, name } = req.body;

    // Log the incoming request
    console.log('Received POST /api/channels request:', req.body);

    // Validate inputs
    if (!workspaceId || !name) {
      console.log('Missing required fields:', { workspaceId, name });
      return res.status(400).json({ message: 'Workspace ID and Channel name are required' });
    }

    // Log the workspaceId and its type
    console.log('Attempting to find workspace with ID:', workspaceId, 'Type:', typeof workspaceId);

    // Ensure workspaceId is a valid ObjectID
    let validWorkspaceId;
    try {
      validWorkspaceId = new mongoose.Types.ObjectId(workspaceId);
      console.log('Valid Workspace ID:', validWorkspaceId);
    } catch (err) {
      console.log('Invalid workspaceId format:', workspaceId, 'Error:', err.message);
      return res.status(400).json({ message: 'Invalid workspaceId format' });
    }

    // Test Mongoose connection and query directly
    console.log('Mongoose connection state:', mongoose.connection.readyState); // 1 = connected
    const testQuery = Workspace.findById(validWorkspaceId);
    console.log('Test query created:', testQuery);

    // Execute the query
    const workspace = await Workspace.findById(validWorkspaceId); // Removed .exec()
    if (!workspace) {
      console.log('Workspace not found for ID:', validWorkspaceId);
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Log the workspace and members for debugging
    console.log('Workspace found:', workspace);
    console.log('Workspace members:', workspace.members);
    console.log('req.user.id:', req.user.id);

    // Check if user is part of the workspace
    const isMember = workspace.members.some(member => member.userId.toString() === req.user.id.toString());
    if (!isMember) {
      console.log('User is not a member of this workspace');
      return res.status(403).json({ message: 'You are not a member of this workspace' });
    }

    // Create channel
    const newChannel = new Channel({
      name,
      workspace: workspaceId,
      members: [req.user.id],
    });

    // Save the channel
    const savedChannel = await newChannel.save();

    // Add channel to workspace
    workspace.channels.push(savedChannel._id);
    await workspace.save();

    console.log('Channel created:', savedChannel);
    res.status(201).json({
      message: 'Channel created successfully',
      channel: savedChannel,
    });
  } catch (err) {
    console.error('Error creating channel:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
