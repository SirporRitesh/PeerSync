// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import channelRoutes from './routes/channel.js';
import workspaceRoutes from './routes/workspaceRoutes.js';
import messageRoutes from './routes/message.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup with updated CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000', // Explicitly allow your frontend origin
    methods: ['GET', 'POST'],
    credentials: true, // Allow credentials
  },
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Explicitly allow your frontend origin
  methods: ['GET', 'POST'],
  credentials: true, // Allow credentials
})); // Updated CORS configuration for API routes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/messages', messageRoutes); // Added message routes

// Socket.IO event handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinChannel', (channelId) => {
    socket.join(channelId);
    console.log(`User ${socket.id} joined channel ${channelId}`);
  });

  socket.on('sendMessage', async (message) => {
    io.to(message.channel).emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Connect to DB and start server
try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  httpServer.listen(5000, () => console.log('Server running on port 5000')); // Use httpServer instead of app.listen
} catch (err) {
  console.error('Error connecting to MongoDB:', err.message);
}