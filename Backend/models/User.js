import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Workspace from './Workspace.js';
import Channel from './Channel.js';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
}, { timestamps: true });

userSchema.statics.signup = async function (userData) {
  const { firstName, lastName, username, email, password, workspaceName } = userData;

  // Validate core user fields
  if (!firstName || !lastName || !username || !email || !password) {
    throw new Error('First name, last name, username, email, and password are required.');
  }

  const existingUserByEmail = await this.findOne({ email });
  const existingUserByUsername = await this.findOne({ username });

  if (existingUserByEmail) {
    throw new Error('Email already exists');
  }
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

  let workspace = null;

  // Create Initial Workspace ONLY IF workspaceName is provided
  if (workspaceName) {
    const WorkspaceModel = mongoose.model('Workspace');
    workspace = new WorkspaceModel({
      name: workspaceName,
      description: `${firstName}'s initial workspace`,
      createdBy: savedUser._id,
      inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      members: [{ userId: savedUser._id, role: 'Admin' }],
      channels: [],
    });

    const savedWorkspace = await workspace.save();

    // Create default "general" channel with correct workspace reference
    const ChannelModel = mongoose.model('Channel');
    const generalChannel = new ChannelModel({
      name: 'general',
      description: 'Default general channel',
      workspace: savedWorkspace._id,  // Set workspace reference correctly
      createdBy: savedUser._id,
      members: [savedUser._id]  // Add creator as first member
    });

    const savedChannel = await generalChannel.save();
    savedWorkspace.channels.push(savedChannel._id);
    await savedWorkspace.save();

    workspace = savedWorkspace;
  }

  const token = jwt.sign(
    { userId: savedUser._id, username: savedUser.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    message: 'User created successfully.',
    token,
    user: {
      id: savedUser._id,
      username: savedUser.username,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email
    },
    workspace: workspace ? {
      id: workspace._id,
      name: workspace.name,
      inviteCode: workspace.inviteCode
    } : null
  };
};

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
    { userId: user._id, username: user.username },
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
      email: user.email
    }
  };
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;