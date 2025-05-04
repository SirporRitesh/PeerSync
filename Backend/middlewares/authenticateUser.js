// middlewares/authenticateUser.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract the token
    console.log('Authorization Header:', req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      clockTolerance: 5, // Allow a 5-second skew
    }); // Verify the token
    console.log('Decoded Token:', decoded);
    const user = await User.findById(decoded.userId); // Find the user in the database
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user; // Attach the user to the request object
    next();
  } catch (err) {
    console.error('Error in authenticateUser middleware:', err.message);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export default authenticateUser;