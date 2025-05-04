// routes/message.js
import express from 'express';
import Message from '../models/Message.js';
import Channel from '../models/Channel.js';
import Workspace from '../models/Workspace.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// Send a Message in a Channel
router.post('/', verifyToken, async (req, res) => {
  try {
    const { channelId, content } = req.body;

    if (!channelId || !content.trim()) {
      return res.status(400).json({ message: 'Channel ID and message content are required' });
    }

    const channel = await Channel.findById(channelId).populate('workspace');
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const workspace = await Workspace.findById(channel.workspace).populate('members.userId');
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if the user is a member of the workspace
    const isMember = workspace.members.some(
      (member) => member.userId._id.toString() === req.user.id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this workspace' });
    }

    const newMessage = new Message({
      content,
      sender: req.user.id,
      channel: channelId,
    });

    const savedMessage = await newMessage.save();

    // Ensure the `messages` array exists in the channel
    if (!channel.messages) {
      channel.messages = [];
    }

    channel.messages.push(savedMessage._id);
    await channel.save();

    const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'email');
    res.status(201).json({
      message: 'Message sent successfully',
      message: populatedMessage,
    });
  } catch (err) {
    console.error('Error in POST /api/messages:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all messages in a Channel
router.get('/:channelId', verifyToken, async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId).populate({
      path: 'messages',
      populate: { path: 'sender', select: 'email' }, // Populate sender email
    });
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (!channel.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not a member of this channel' });
    }

    console.log('Fetched messages for channel:', channel.messages);
    res.status(200).json(channel.messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get messages in a Channel with sorting
router.get('/:channelId/messages', verifyToken, async (req, res) => {
  try {
    const { channelId } = req.params;

    const messages = await Message.find({ channel: channelId })
      .populate('sender', 'email') // Populate sender details
      .sort({ createdAt: 1 }); // Sort messages by creation time

    if (!messages) {
      return res.status(404).json({ message: 'No messages found' });
    }

    res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;