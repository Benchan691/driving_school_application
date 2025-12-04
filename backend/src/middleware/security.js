const rateLimit = require('express-rate-limit');
const { isTokenBlacklisted } = require('../utils/jwt');

// Helper function to get real client IP (considering proxies)
const getClientIP = (req) => {
  // Check x-forwarded-for header first (for proxies/load balancers)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  // Check x-real-ip header (nginx)
  const realIP = req.headers['x-real-ip'];
  if (realIP) {
    return realIP;
  }
  
  // Fallback to req.ip (Express default)
  return req.ip || req.connection.remoteAddress || 'unknown';
};

// Security logging middleware
const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Attach real client IP to request for use in other middleware
  req.clientIP = getClientIP(req);
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /eval\(/i, // Code injection
    /exec\(/i, // Command injection
  ];
  
  const checkSuspiciousInput = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            console.warn(`🚨 Suspicious input detected at ${currentPath}: ${value.substring(0, 100)}`);
            console.warn(`   IP: ${req.clientIP}, User-Agent: ${req.get('User-Agent')}`);
            break;
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        checkSuspiciousInput(value, currentPath);
      }
    }
  };
  
  if (req.body) checkSuspiciousInput(req.body, 'body');
  if (req.query) checkSuspiciousInput(req.query, 'query');
  if (req.params) checkSuspiciousInput(req.params, 'params');
  
  // Log response time for performance monitoring
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    if (duration > 5000) { // Log slow requests
      console.warn(`🐌 Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};

// IP whitelist/blacklist middleware
const ipFilter = (req, res, next) => {
  const clientIP = req.clientIP || getClientIP(req);
  
  // Block known malicious IPs (in production, this would be from a database)
  const blockedIPs = [
    // Add known malicious IPs here
  ];
  
  if (blockedIPs.includes(clientIP)) {
    console.warn(`🚫 Blocked request from blacklisted IP: ${clientIP}`);
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
  
  next();
};

// Enhanced authentication middleware with token blacklist check
const enhancedAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token && isTokenBlacklisted(token)) {
      console.warn(`🚫 Blacklisted token used: ${req.ip}`);
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked'
      });
    }
    
    next();
  } catch (error) {
    next();
  }
};

// Request sanitization middleware
const requestSanitizer = (req, res, next) => {
  // Validate x-forwarded-for header format (security check)
  // But DO NOT delete it - we need it for proper IP tracking
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // Check if it contains only valid IP addresses and commas
    const ipPattern = /^[\d\.:a-fA-F,\s]+$/;
    if (!ipPattern.test(forwardedFor)) {
      console.warn(`🚨 Suspicious x-forwarded-for header: ${forwardedFor.substring(0, 50)}`);
      // Don't block, but log for monitoring
    }
  }
  
  // Sanitize user agent (limit length to prevent DoS)
  if (req.get('User-Agent')) {
    req.headers['user-agent'] = req.get('User-Agent').substring(0, 200);
  }
  
  // Limit query parameters (prevent parameter pollution)
  if (Object.keys(req.query).length > 20) {
    return res.status(400).json({
      success: false,
      message: 'Too many query parameters'
    });
  }
  
  next();
};

// File upload security middleware
const fileUploadSecurity = (req, res, next) => {
  // Check for file uploads
  if (req.files) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    for (const file of Object.values(req.files)) {
      if (Array.isArray(file)) {
        for (const f of file) {
          if (!allowedTypes.includes(f.mimetype)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid file type'
            });
          }
          if (f.size > maxSize) {
            return res.status(400).json({
              success: false,
              message: 'File too large'
            });
          }
        }
      } else {
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid file type'
          });
        }
        if (file.size > maxSize) {
          return res.status(400).json({
            success: false,
            message: 'File too large'
          });
        }
      }
    }
  }
  
  next();
};

// API key validation middleware (for external integrations)
const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required'
    });
  }
  
  // In production, validate against database
  const validApiKeys = process.env.VALID_API_KEYS ? 
    process.env.VALID_API_KEYS.split(',') : [];
  
  if (!validApiKeys.includes(apiKey)) {
    console.warn(`🚫 Invalid API key used: ${apiKey.substring(0, 8)}...`);
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }
  
  next();
};

// Redis-based brute force protection middleware
// This is more secure than session-based as it can't be bypassed by clearing cookies
const bruteForceProtection = async (req, res, next) => {
  try {
    // Get Redis client from app (will be attached in app.js)
    const redisClient = req.app.get('redis');
    
    // If Redis is not available, fall back to basic rate limiting
    if (!redisClient) {
      console.warn('⚠️ Redis not available for brute force protection, using basic session fallback');
      return fallbackBruteForceProtection(req, res, next);
    }
    
    // Use IP address for tracking (more secure than session)
    const clientIP = req.clientIP || getClientIP(req);
    const key = `bruteforce:${clientIP}`;
    const blockKey = `bruteforce:blocked:${clientIP}`;
    
    // Check if IP is currently blocked
    const isBlocked = await redisClient.get(blockKey);
    if (isBlocked) {
      const ttl = await redisClient.ttl(blockKey);
      console.warn(`🚫 Blocked brute force attempt from ${clientIP}`);
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. Please try again in ${Math.ceil(ttl / 60)} minutes.`
      });
    }
    
    // Get current attempt count
    const attempts = parseInt(await redisClient.get(key) || '0');
    
    // Block after 5 failed attempts
    if (attempts >= 5) {
      // Block for 15 minutes
      await redisClient.setEx(blockKey, 15 * 60, 'blocked');
      await redisClient.del(key); // Clear attempt counter
      console.warn(`🚫 IP ${clientIP} blocked for 15 minutes after ${attempts} failed attempts`);
      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Your IP has been temporarily blocked. Please try again in 15 minutes.'
      });
    }
    
    // Track failed attempts
    res.on('finish', async () => {
      if (res.statusCode === 401 || res.statusCode === 403) {
        try {
          const currentAttempts = await redisClient.incr(key);
          // Set expiry on first attempt (15 minute window)
          if (currentAttempts === 1) {
            await redisClient.expire(key, 15 * 60);
          }
          console.warn(`⚠️ Failed auth attempt from ${clientIP}: ${currentAttempts}/5`);
        } catch (redisError) {
          console.error('Redis error in brute force tracking:', redisError);
        }
      } else if (res.statusCode === 200 || res.statusCode === 201) {
        // Clear attempts on successful auth
        try {
          await redisClient.del(key);
        } catch (redisError) {
          console.error('Redis error clearing attempts:', redisError);
        }
      }
    });
    
    next();
  } catch (error) {
    console.error('Brute force protection error:', error);
    // Don't block request on error, but log it
    next();
  }
};

// Fallback brute force protection (when Redis is unavailable)
const fallbackBruteForceProtection = (req, res, next) => {
  // Initialize session if not available
  if (!req.session) {
    req.session = {};
  }
  
  const attempts = req.session.bruteForceAttempts || 0;
  const lastAttempt = req.session.lastBruteForceAttempt || 0;
  const now = Date.now();
  
  // Reset attempts after 15 minutes
  if (now - lastAttempt > 15 * 60 * 1000) {
    req.session.bruteForceAttempts = 0;
  }
  
  // Block after 5 failed attempts
  if (attempts >= 5) {
    return res.status(429).json({
      success: false,
      message: 'Too many failed attempts. Please try again later.'
    });
  }
  
  // Increment attempts on failed auth
  res.on('finish', () => {
    if (res.statusCode === 401 || res.statusCode === 403) {
      req.session.bruteForceAttempts = (req.session.bruteForceAttempts || 0) + 1;
      req.session.lastBruteForceAttempt = now;
    }
  });
  
  next();
};

// Database query protection middleware
const queryProtection = (req, res, next) => {
  // Check for potential SQL injection patterns
  const sqlPatterns = [
    /union.*select/i,
    /drop.*table/i,
    /delete.*from/i,
    /insert.*into/i,
    /update.*set/i,
    /alter.*table/i,
    /create.*table/i,
    /exec.*\(/i,
    /execute.*\(/i
  ];
  
  const checkForSQLInjection = (obj, path = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(value)) {
            console.warn(`🚨 Potential SQL injection detected at ${currentPath}: ${value.substring(0, 100)}`);
            return res.status(400).json({
              success: false,
              message: 'Invalid input detected'
            });
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        const result = checkForSQLInjection(value, currentPath);
        if (result) return result;
      }
    }
    return null;
  };
  
  if (req.body) {
    const result = checkForSQLInjection(req.body, 'body');
    if (result) return result;
  }
  if (req.query) {
    const result = checkForSQLInjection(req.query, 'query');
    if (result) return result;
  }
  if (req.params) {
    const result = checkForSQLInjection(req.params, 'params');
    if (result) return result;
  }
  
  next();
};

module.exports = {
  getClientIP,
  securityLogger,
  ipFilter,
  enhancedAuth,
  requestSanitizer,
  fileUploadSecurity,
  apiKeyAuth,
  bruteForceProtection,
  queryProtection
};
