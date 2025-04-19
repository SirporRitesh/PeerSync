// routes/message.js
const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Channel = require("../models/Channel");
const { verifyToken } = require("../middlewares/authMiddleware");

// Send a Message in a Channel
router.post("/", verifyToken, async (req, res) => {
  try {
    const { channelId, content } = req.body;

    if (!channelId || !content) {
      return res.status(400).json({ message: "Channel ID and message content are required" });
    }

    // Check if channel exists and user is part of it
    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    if (!channel.members.includes(req.user.id)) {
      return res.status(403).json({ message: "You are not a member of this channel" });
    }

    // Create the message
    const newMessage = new Message({
      content,
      sender: req.user.id,
      channel: channelId,
    });

    // Save the message
    const savedMessage = await newMessage.save();

    // Add message to channel
    channel.messages.push(savedMessage._id);
    await channel.save();

    res.status(201).json({
      message: "Message sent successfully",
      message: savedMessage,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all messages in a Channel
router.get("/:channelId", verifyToken, async (req, res) => {
  try {
    const { channelId } = req.params;

    // Check if channel exists
    const channel = await Channel.findById(channelId).populate("messages");
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check if user is part of the channel
    if (!channel.members.includes(req.user.id)) {
      return res.status(403).json({ message: "You are not a member of this channel" });
    }

    res.status(200).json(channel.messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
