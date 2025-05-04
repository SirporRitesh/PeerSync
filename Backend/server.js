// server.js (ESM-compliant)
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import http from 'http';
import { Server } from 'socket.io';
import './models/Channel.js';
import dotenv from 'dotenv';
import User from './models/User.js';
import Workspace from './models/Workspace.js';
import { Router } from 'express';
import authRoutes from './routes/auth.js';
import channelRoutes from './routes/channel.js';
import messageRoutes from './routes/message.js'; // Import message routes
import Message from './models/Message.js'; // Import Message model
import Channel from './models/Channel.js'; // Import Channel model

dotenv.config();

const app = express();
const server = http.createServer(app);

// Global request logger (tracks all incoming routes)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Socket.IO CORS
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Express CORS
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(' MongoDB connection error:', err));

// JWT middleware
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization Header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      clockTolerance: 5,
    });
    console.log(' Decoded Token:', decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    console.log(' Authenticated User ID:', req.user._id);
    next();
  } catch (err) {
    console.error(' Token Verification Error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Workspace route
const workspaceRouter = Router();
workspaceRouter.get('/', authenticateUser, async (req, res) => {
  try {
    const workspaces = await Workspace.find({ 'members.userId': req.user._id })
      .populate('channels')
      .populate('members.userId', 'email');
    res.status(200).json(workspaces);
  } catch (err) {
    console.error('❌ Error fetching workspaces:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

workspaceRouter.get('/:workspaceId', authenticateUser, async (req, res) => {
  const { workspaceId } = req.params;
  console.log('Fetching workspace with ID:', workspaceId);
  try {
    const workspace = await Workspace.findById(workspaceId)
      .populate('channels')
      .populate('members.userId', 'email');
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    console.log('Workspace details:', workspace);
    res.status(200).json(workspace);
  } catch (err) {
    console.error('❌ Error fetching workspace:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.use('/api/workspace', workspaceRouter);
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes); // Register the message routes

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinChannel', (channelId) => {
    socket.join(channelId);
    console.log(`➡️ User ${socket.id} joined channel ${channelId}`);
  });

  socket.on('sendMessage', async (message) => {
    try {
      const channel = await Channel.findById(message.channelId).populate('workspace');
      if (!channel) {
        console.error('Channel not found');
        return;
      }

      const workspace = await Workspace.findById(channel.workspace).populate('members.userId');
      if (!workspace) {
        console.error('Workspace not found');
        return;
      }

      // Check if the sender is a member of the workspace
      const isMember = workspace.members.some(
        (member) => member.userId._id.toString() === message.sender
      );
      if (!isMember) {
        console.error('Sender is not a member of the workspace');
        return;
      }

      // Create and save the new message
      const newMessage = new Message({
        content: message.content,
        sender: message.sender,
        channel: message.channelId,
      });

      const savedMessage = await newMessage.save();

      // Populate the sender field before broadcasting
      const populatedMessage = await Message.findById(savedMessage._id).populate('sender', 'email');
      console.log('Broadcasting message:', populatedMessage);

      io.to(message.channelId).emit('message', populatedMessage);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Catch-all for unmatched routes
app.use((req, res, next) => {
  console.warn(`Unmatched route: [${req.method}] ${req.originalUrl}`);
  res.status(404).send('Route not found');
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error(' Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(' Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
