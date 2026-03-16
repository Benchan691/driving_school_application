const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token format
    if (!/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    const decoded = verifyAccessToken(token);
    
    // Get user from database with additional security checks
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    // Check if user is still active
    if (user.user_type === 'inactive' || user.deleted_at) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive or deleted'
      });
    }

    // Add security context to request
    req.user = user;
    req.userId = user.id;
    req.userType = user.user_type;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Enhanced role checking with logging
    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    if (!roles.includes(req.user.user_type)) {
      console.warn(`Unauthorized access attempt: User ${req.user.id} (${req.user.user_type}) tried to access ${req.method} ${req.path}`);
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Enhanced admin-only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.user_type !== 'admin') {
    console.warn(`Admin access denied: User ${req.user.id} (${req.user.user_type}) tried to access admin endpoint ${req.method} ${req.path}`);
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Verify token format
      if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token)) {
        const decoded = verifyAccessToken(token);
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password', 'password_reset_token', 'password_reset_expires'] }
        });
        if (user && user.user_type !== 'inactive' && !user.deleted_at) {
          req.user = user;
          req.userId = user.id;
          req.userType = user.user_type;
        }
      }
    }
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Rate limiting for authentication endpoints
const authRateLimit = (req, res, next) => {
  // This will be implemented with express-rate-limit in app.js
  next();
};

// Session security middleware
const sessionSecurity = (req, res, next) => {
  // Clear sensitive data from response
  if (req.user) {
    delete req.user.password;
    delete req.user.password_reset_token;
    delete req.user.password_reset_expires;
  }
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  optionalAuth,
  authRateLimit,
  sessionSecurity
};


