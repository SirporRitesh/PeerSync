import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Static method for signup
userSchema.statics.signup = async function (email, password) {
  const existingUser = await this.findOne({ email });
  if (existingUser) {
    throw new Error('Email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new this({ email, password: hashedPassword });
  const savedUser = await newUser.save();

  const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return { message: 'User created successfully', token };
};

// Static method for login
userSchema.statics.login = async function (email, password) {
  // Normalize email to lowercase and trim whitespace
  const sanitizedEmail = email.trim().toLowerCase();

  // Find the user by email
  const user = await this.findOne({ email: sanitizedEmail });
  if (!user) {
    throw new Error('Invalid credentials'); // Throw error if user not found
  }

  // Validate the password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials'); // Throw error if password is incorrect
  }

  // Generate a unique JWT token using the user's _id
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  return { message: 'Login successful', token }; // Return success message and token
};

const User = mongoose.model('User', userSchema, 'users');

export default User;
