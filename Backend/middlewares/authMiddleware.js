// middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    console.log('Authorization Header:', req.headers.authorization);

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authorization token required' });
    }

    let decoded; // Declare the variable
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        clockTolerance: 10, // Allow a 10-second skew
      });
      console.log('Decoded Token:', decoded);
      console.log('Token Expiration Time:', new Date(decoded.exp * 1000)); // Log expiration time
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        console.error('Token has expired:', err.message);
        return res.status(403).json({ message: 'Token has expired' });
      }
      console.error('JWT Verification Error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    console.log('Authenticated User:', user);
    next();
  } catch (err) {
    console.error('Error in verifyToken middleware:', err.message);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};