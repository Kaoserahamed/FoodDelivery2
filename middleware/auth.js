const jwt = require('jsonwebtoken');

// Verify JWT Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    req.userRole = decoded.userRole; // Fixed: was decoded.role, should be decoded.userRole
    console.log('✅ Token verified - userId:', req.userId, 'role:', req.userRole); // Debug log
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};

// Check if user is restaurant owner
const isRestaurant = (req, res, next) => {
  console.log('🔍 Checking restaurant role - Current role:', req.userRole); // Debug log
  if (req.userRole !== 'restaurant') {
    return res.status(403).json({ message: 'Restaurant access required', currentRole: req.userRole });
  }
  next();
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Check if user is customer
const isCustomer = (req, res, next) => {
  if (req.userRole !== 'customer') {
    return res.status(403).json({ message: 'Customer access required' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isRestaurant,
  isCustomer
};