import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Workspace from './Workspace.js'; // Import Workspace model

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true }, // New
  lastName: { type: String, required: true, trim: true },  // New
  username: { type: String, required: true, unique: true, trim: true, lowercase: true }, // New
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
}, { timestamps: true }); // Added timestamps

// Static method for signup
userSchema.statics.signup = async function (userData) {
  const { firstName, lastName, username, email, password, workspaceName } = userData;

  // Validate required fields explicitly
  if (!firstName || !lastName || !username || !email || !password || !workspaceName) {
    throw new Error('All fields (firstName, lastName, username, email, password, workspaceName) are required.');
  }

  const existingUserByEmail = await this.findOne({ email });
  if (existingUserByEmail) {
    throw new Error('Email already exists');
  }
  const existingUserByUsername = await this.findOne({ username });
  if (existingUserByUsername) {
    throw new Error('Username already taken');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new this({
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword,
  });
  const savedUser = await newUser.save();

  // --- Create Initial Workspace ---
  const newWorkspace = new Workspace({
    name: workspaceName,
    description: `${firstName}'s initial workspace`, // Default description
    createdBy: savedUser._id,
    inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(), // Generate invite code
    members: [{ userId: savedUser._id, role: 'Admin' }],
    channels: [], // Start with no channels or create a default 'general' channel
  });
  const savedWorkspace = await newWorkspace.save();

  const token = jwt.sign(
    { userId: savedUser._id, username: savedUser.username }, // Add username to JWT
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    message: 'User and initial workspace created successfully',
    token,
    user: {
      id: savedUser._id,
      username: savedUser.username,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
    },
  };
};

// Static method for login
userSchema.statics.login = async function (email, password) {
  const sanitizedEmail = email.trim().toLowerCase();
  const user = await this.findOne({ email: sanitizedEmail });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user._id, username: user.username }, // Add username to JWT
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
  };
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;