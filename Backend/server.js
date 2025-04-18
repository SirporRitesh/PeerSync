// ----------------------
// File: server.js
// ----------------------

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authenticateUser = require('../Backend/middlewares/authenticateUser');

const app = express();

// Middleware
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const workspaceRoutes = require('./routes/workspaceRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/workspace', workspaceRoutes);

// Connect to DB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(5000, () => console.log('Server running on port 5000'));
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Additional route
const router = express.Router();
router.post('/invite', authenticateUser, async (req, res) => {
  try {
    // Add your logic here
    res.status(200).send({ message: 'Invite processed successfully' });
  } catch (error) {
    res.status(500).send({ error: 'An error occurred' });
  }
});
app.use('/api', router);
