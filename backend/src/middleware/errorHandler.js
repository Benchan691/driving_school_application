const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Enhanced error logging with security context
  const logError = (error, req) => {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.userId,
      timestamp: new Date().toISOString(),
      requestId: req.id
    };
    
    // Log security-related errors with higher priority
    if (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 429) {
      console.warn(`🚨 Security Error: ${JSON.stringify(errorInfo)}`);
    } else {
      console.error(`❌ Error: ${JSON.stringify(errorInfo)}`);
    }
  };

  logError(err, req);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    error = { message: 'Too many requests', statusCode: 429 };
  }

  // Security-related errors
  if (err.message.includes('malicious') || err.message.includes('injection')) {
    error = { message: 'Invalid input detected', statusCode: 400 };
  }

  // Database connection errors
  if (err.name === 'SequelizeConnectionError') {
    error = { message: 'Database connection failed', statusCode: 503 };
  }

  // Prepare response
  const response = {
    success: false,
    message: error.message || 'Server Error',
    requestId: req.id
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = err;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && error.statusCode >= 500) {
    response.message = 'Internal server error';
  }

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;


