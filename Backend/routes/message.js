// routes/message.js
import express from 'express';
import Message from '../models/Message.js';
import Channel from '../models/Channel.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Send a Message in a Channel
router.post('/', verifyToken, async (req, res) => {
  try {
    const { channelId, content } = req.body;

    if (!channelId || !content) {
      return res.status(400).json({ message: 'Channel ID and message content are required' });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    if (!channel.members.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are not a member of this channel' });
    }

    const newMessage = new Message({
      content,
      sender: req.user.id,
      channel: channelId,
    });

    const savedMessage = await newMessage.save();

    channel.messages.push(savedMessage._id);
    await channel.save();

    // Populate sender email for the response
    const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'email');

    res.status(201).json({
      message: 'Message sent successfully',
      message: populatedMessage,
    });
  } catch (err) {
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

    res.status(200).json(channel.messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;