const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'come_to_eat_super_secret_jwt_key_2026';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
}

// Allows Manager Admin only
function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
    }
  });
}

// Allows Kitchen Employee only
function requireEmployee(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'employee') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied: Employee operational access required.' });
    }
  });
}

// Allows both Admin and Employee (staff operations)
function requireStaff(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'employee')) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied: Staff credentials required.' });
    }
  });
}

function optionalToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Ignore invalid optional token
    }
  }
  next();
}

module.exports = {
  JWT_SECRET,
  generateToken,
  verifyToken,
  requireAdmin,
  requireEmployee,
  requireStaff,
  optionalToken
};
