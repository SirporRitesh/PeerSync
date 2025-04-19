// ----------------------
// File: server.js
// ----------------------

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const workspaceRoutes = require('./routes/workspaceRoutes');
app.use('/api/workspace', workspaceRoutes);

// Connect to DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch((err) => console.error('MongoDB connection error:', err));