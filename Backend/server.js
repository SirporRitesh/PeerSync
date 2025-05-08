// server.js (ESM-compliant)
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken'; // Import jwt for token verification
import authRoutes from './routes/auth.js';
import channelRoutes from './routes/channel.js';
import messageRoutes from './routes/message.js';
import workspaceRoutes from './routes/workspaceRoutes.js'; // Correct import
import connectDB from './config/db.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware to make io instance available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Connect to MongoDB
connectDB();

// --- Register API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/workspace', workspaceRoutes); // Ensure this uses the correct router

// --- Socket.IO Online Status ---
const onlineUsers = new Map(); // userId -> { socketId, username }

// Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId; // Attach userId to socket object
    socket.username = decoded.username; // Attach username
    next();
  } catch (err) {
    console.error('Socket Auth Error:', err.message);
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}, userId: ${socket.userId}, username: ${socket.username}`);
  onlineUsers.set(socket.userId, { socketId: socket.id, username: socket.username });

  // Notify all clients about the updated online users list
  io.emit('onlineUsersUpdate', Array.from(onlineUsers.keys())); // Send array of online user IDs

  socket.on('joinChannel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel ${channelId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}, userId: ${socket.userId}`);
    onlineUsers.delete(socket.userId);
    io.emit('onlineUsersUpdate', Array.from(onlineUsers.keys())); // Notify clients about updated online users
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});