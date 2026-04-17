const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('Authorization');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Expect Bearer token format
  if (!token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  const tokenString = token.split(' ')[1];

  // Verify token
  try {
    const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
    
    // Cross-reference DB dynamically to enforce bans instantly
    const User = require('../models/User');
    const userDoc = await User.findById(decoded.user.id);
    
    if (!userDoc) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    if (!userDoc.isActive) {
      return res.status(403).json({ message: 'Account is suspended' });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
