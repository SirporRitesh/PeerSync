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
    const io = req.io; // Get io instance from request object

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
      sender: req.user.id, // Use authenticated user ID
      channel: channelId,
    });
    const savedMessage = await newMessage.save();

    // Add message reference to channel (if your schema requires it)
    if (channel) {
      channel.messages.push(savedMessage._id);
      await channel.save();
    }

    // Populate sender details for broadcasting
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('sender', 'username _id'); // Changed from email to username and _id

    // *** EMIT THE MESSAGE VIA SOCKET.IO ***
    if (populatedMessage) {
      console.log(`[API POST /messages] Broadcasting to channel ${channelId}:`, JSON.stringify(populatedMessage, null, 2));
      io.to(channelId).emit('message', populatedMessage);
    } else {
      console.error(`[API POST /messages] Failed to populate message after saving.`);
    }

    // Send response back to the original HTTP request
    res.status(201).json({
      message: 'Message sent successfully',
      message: populatedMessage, // Send populated message back in HTTP response too
    });

  } catch (err) {
    console.error('Error in POST /api/messages:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all messages in a Channel (via channel details)
router.get('/:channelId', verifyToken, async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId).populate({
      path: 'messages',
      populate: { path: 'sender', select: 'username _id' }, // Changed from email to username and _id
      options: { sort: { createdAt: 1 } }, // Optional sorting
    });

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    if (!channel.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not a member of this channel' });
    }

    // Log the fetched messages
    console.log(`[API GET /channels/:channelId] Sending messages via channel details:`, JSON.stringify(channel?.messages, null, 2));

    // Return the channel object or just the messages
    res.status(200).json(channel.messages); // If just sending messages
    // or res.status(200).json(channel); // If sending the whole channel object
  } catch (err) {
    console.error('Error fetching channel details:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get messages in a Channel with sorting
router.get('/:channelId/messages', verifyToken, async (req, res) => {
  try {
    const { channelId } = req.params;

    const messages = await Message.find({ channel: channelId })
      .populate('sender', 'username _id') // Changed from email to username and _id
      .sort({ createdAt: 1 }); // Sort messages by creation time

    // Log the fetched messages
    console.log(`[API GET /messages/:channelId/messages] Sending messages for channel ${channelId}:`, JSON.stringify(messages, null, 2));

    if (!messages) {
      return res.status(404).json([]); // Send empty array if no messages
    }
    res.status(200).json(messages);
  } catch (err) {
    console.error(`Error fetching messages for channel ${channelId}:`, err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;