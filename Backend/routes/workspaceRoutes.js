// routes/workspaceRoutes.js
import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import authenticateUser from '../middlewares/authenticateUser.js';

const router = express.Router();

// Utility to generate a random invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

// Fetch all workspaces for the authenticated user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const workspaces = await Workspace.find({ 'members.userId': req.user._id })
      .populate('channels')
      .populate('members.userId', 'email');
    res.status(200).json(workspaces); // Returns an array of workspaces
  } catch (err) {
    console.error('Error fetching workspaces:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new workspace
router.post('/', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      console.log('req.user is undefined');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    const workspace = new Workspace({
      name,
      description,
      createdBy: req.user._id,
      inviteCode: generateInviteCode(),
      members: [{ userId: req.user._id, role: 'Admin' }],
      channels: [],
    });

    const savedWorkspace = await workspace.save();
    console.log('Workspace created:', savedWorkspace);
    res.status(201).json({ message: 'Workspace created', workspace: savedWorkspace });
  } catch (err) {
    console.error('Error creating workspace:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Fetch workspace details
router.get('/:id', authenticateUser, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid workspace ID' });
  }
  try {

    console.log('Fetching workspace with ID:', req.params.id); // Log workspace ID
    const workspace = await Workspace.findById(req.params.id)
      .populate('channels')
      .populate('members.userId', 'email');
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    res.status(200).json(workspace);
  } catch (err) {
    console.error('Error fetching workspace:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get channels
router.get('/:id/channels', authenticateUser, async (req, res) => {
  try {
    const workspace = await Workspace.findOne({ _id: req.params.id }).populate('channels');
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    if (!workspace.members.some(member => member.userId.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'You are not a member of this workspace' });
    }
    res.status(200).json(workspace.channels);
  } catch (err) {
    console.error('Error fetching channels:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Invite user
router.post('/invite', authenticateUser, async (req, res) => {
  const { workspaceId, inviteCode } = req.body;

  try {
    console.log('Invite request:', { workspaceId, inviteCode });
    const userId = req.user._id;
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

// Join workspace
router.post('/join', authenticateUser, async (req, res) => {
  const { inviteCode } = req.body;

  try {
    const userId = req.user._id;
    const workspace = await Workspace.findOne({ inviteCode });

    if (!workspace) {
      return res.status(400).json({ message: 'Invalid invite code or workspace not found' });
    }

    if (workspace.members.some(member => member.userId.toString() === userId.toString())) {
      return res.status(400).json({ message: 'You are already a member of this workspace' });
    }

    workspace.members.push({ userId, role: 'Member' });
    await workspace.save();

    res.status(200).json({ message: 'Successfully joined workspace' });
  } catch (err) {
    console.error('Error joining workspace:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;