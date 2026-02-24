const jwt = require('jsonwebtoken');

// 1. Verify Token Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Format: "Bearer <token>"
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Invalid token format.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user payload to request
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// 2. Role Check Middleware
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles.includes(requiredRole)) {
      return res.status(403).json({ 
        message: `Access denied. Requires ${requiredRole} role.` 
      });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };