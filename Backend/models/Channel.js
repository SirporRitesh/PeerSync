// routes/channel.js
const express = require("express");
const router = express.Router();
const Workspace = require("../models/WorkSpace");
const Channel = require("../models/Channel");
const { verifyToken } = require("../middlewares/authMiddleware");

// Create a Channel
router.post("/", verifyToken, async (req, res) => {
  try {
    const { workspaceId, name } = req.body;

    // Validate inputs
    if (!workspaceId || !name) {
      return res.status(400).json({ message: "Workspace ID and Channel name are required" });
    }

    // Check if workspace exists and user is part of it
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    if (!workspace.members.includes(req.user.id)) {
      return res.status(403).json({ message: "You are not a member of this workspace" });
    }

    // Create channel
    const newChannel = new Channel({
      name,
      workspace: workspaceId,
      members: [req.user.id], // Add the user as the first member
    });

    // Save the channel
    const savedChannel = await newChannel.save();

    // Add channel to workspace
    workspace.channels.push(savedChannel._id);
    await workspace.save();

    res.status(201).json({
      message: "Channel created successfully",
      channel: savedChannel,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
