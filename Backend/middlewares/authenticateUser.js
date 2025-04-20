// middlewares/authenticateUser.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authenticateUser = async (req, res, next) => {
  try {
    console.log('Authorization Header:', req.headers.authorization); // Removed "fault"

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('User not found for ID:', decoded.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    req.user.id = user._id; // Added for consistency with authMiddleware.js
    console.log('Authenticated User:', user);
    next();
  } catch (err) {
    console.error('Error in authenticateUser middleware:', err.message);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export default authenticateUser;