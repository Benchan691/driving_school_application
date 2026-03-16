const jwt = require('jsonwebtoken');

const generateAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    issuer: process.env.JWT_ISSUER || 'driving-school-api',
    audience: process.env.JWT_AUDIENCE || 'driving-school-client',
    algorithm: 'HS256'
  });
};

const generateRefreshToken = (payload) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not configured');
  }
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'driving-school-api',
    audience: process.env.JWT_AUDIENCE || 'driving-school-client',
    algorithm: 'HS256'
  });
};

const verifyAccessToken = (token) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }
    
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || 'driving-school-api',
      audience: process.env.JWT_AUDIENCE || 'driving-school-client',
      algorithms: ['HS256']
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Access token not active');
    }
    throw new Error('Invalid access token');
  }
};

const verifyRefreshToken = (token) => {
  try {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: process.env.JWT_ISSUER || 'driving-school-api',
      audience: process.env.JWT_AUDIENCE || 'driving-school-client',
      algorithms: ['HS256']
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Refresh token not active');
    }
    throw new Error('Invalid refresh token');
  }
};

const generateTokens = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    user_type: user.user_type,
    iat: Math.floor(Date.now() / 1000),
    jti: require('crypto').randomBytes(16).toString('hex') // JWT ID for token tracking
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
};

// Token blacklist management (for logout)
const tokenBlacklist = new Set();

const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// Clear expired tokens from blacklist periodically
const cleanupBlacklist = () => {
  // This would be implemented with a proper storage solution in production
  // For now, we'll just clear the Set periodically
  if (tokenBlacklist.size > 1000) {
    tokenBlacklist.clear();
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
  blacklistToken,
  isTokenBlacklisted,
  cleanupBlacklist
};


