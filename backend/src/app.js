const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('./config/passport');
const { initDatabase } = require('./database/init');
const redis = require('redis');
const  RedisStore = require('connect-redis').default;
require('dotenv').config();

const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const instructorRoutes = require('./routes/instructors');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const adminBookingRoutes = require('./routes/admin.bookings');
const adminUserRoutes = require('./routes/admin.users');
const adminPaymentRoutes = require('./routes/admin.payments');
const paymentRoutes = require('./routes/payments');

const errorHandler = require('./middleware/errorHandler');
const { 
  securityLogger, 
  ipFilter, 
  enhancedAuth, 
  requestSanitizer, 
  fileUploadSecurity, 
  bruteForceProtection, 
  queryProtection 
} = require('./middleware/security');

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Redis client
let redisClient;
const initRedis = async () => {
  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://redis:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('Too many Redis reconnection attempts');
            return new Error('Too many retries');
          }
          return retries * 100; // Exponential backoff
        }
      }
    });

    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    redisClient.on('connect', () => console.log('✅ Redis connected'));
    redisClient.on('reconnecting', () => console.log('🔄 Redis reconnecting...'));

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('⚠️ Redis not available, falling back to memory store:', error.message);
    return null;
  }
};

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting removed for better user experience

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://localhost:3000',
      'http://localhost',
      'https://thetruthdrivingschool.ca',
      'http://thetruthdrivingschool.ca',
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

app.use(cors(corsOptions));

// Enhanced body parsing middleware with security limits
app.use(express.json({ 
  limit: '1mb', // Reduced from 10mb for security
  verify: (req, res, buf) => {
    // Check for potential JSON injection
    if (buf && buf.length > 0) {
      const str = buf.toString();
      if (str.includes('__proto__') || str.includes('constructor')) {
        throw new Error('Potentially malicious JSON detected');
      }
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb',
  parameterLimit: 50 // Limit number of parameters
}));

// Note: Session middleware will be initialized after Redis is ready
// See startServer() function below

// Security middleware for request logging and monitoring
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production logging with security considerations
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400, // Only log errors in production
    stream: {
      write: (message) => {
        // Log security-relevant events
        if (message.includes('401') || message.includes('403') || message.includes('429')) {
          console.warn(`Security event: ${message.trim()}`);
        }
      }
    }
  }));
}

// Request ID middleware for tracking
app.use((req, res, next) => {
  req.id = require('crypto').randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});

// Request size and timeout middleware
app.use((req, res, next) => {
  // Set request timeout
  req.setTimeout(30000, () => {
    res.status(408).json({
      success: false,
      message: 'Request timeout'
    });
  });
  
  // Check request size
  const contentLength = parseInt(req.get('content-length') || '0');
  if (contentLength > 1024 * 1024) { // 1MB limit
    return res.status(413).json({
      success: false,
      message: 'Request entity too large'
    });
  }
  
  next();
});

// Apply comprehensive security middleware
app.use(securityLogger);
app.use(ipFilter);
app.use(requestSanitizer);
app.use(queryProtection);
app.use(fileUploadSecurity);
app.use(enhancedAuth);

// Serve static files from the backend pictures directory with security
app.use('/pictures', express.static(path.join(__dirname, '../pictures'), {
  setHeaders: (res, path) => {
    // Add security headers for static files
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('X-Content-Type-Options', 'nosniff');
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Driving School API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes with security middleware
app.use('/api/auth', bruteForceProtection, authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/instructors', instructorRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    // Initialize Redis
    const redis = await initRedis();
    
    // Attach Redis client to app for use in middleware (e.g., brute force protection)
    if (redis) {
      app.set('redis', redis);
      console.log('✅ Redis client attached to app');
    }
    
    // Configure session middleware with Redis or fallback to memory
    const sessionConfig = {
      secret: process.env.SESSION_SECRET || 'your-session-secret-here',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    };

    // Use Redis store if available, otherwise use default memory store
    if (redis) {
      sessionConfig.store = new RedisStore({ 
        client: redis,
        prefix: 'driving_school:sess:'
      });
      console.log('📦 Using Redis for session storage');
    } else {
      console.log('📦 Using memory store for sessions (not recommended for production)');
    }

    app.use(session(sessionConfig));

    // Passport middleware (must be after session)
    app.use(passport.initialize());
    app.use(passport.session());

    // Initialize database
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚗 Driving School API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

