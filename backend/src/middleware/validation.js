const { body, validationResult, sanitizeBody } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        path: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Enhanced sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Sanitize all string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  };

  // Recursively sanitize object properties
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);
  req.params = sanitizeObject(req.params);
  
  next();
};

// Enhanced registration validation with security checks
const validateRegistration = [
  sanitizeInput,
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters')
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email address is too long'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters long')
    .custom((value) => {
      // Check for common weak passwords
      const commonPasswords = ['password', '123456', 'admin', 'qwerty', 'letmein'];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('Password is too common, please choose a stronger password');
      }
      return true;
    }),
  
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
    .isLength({ max: 20 })
    .withMessage('Phone number is too long'),
  
  handleValidationErrors
];

// Enhanced login validation
const validateLogin = [
  sanitizeInput,
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email address is too long'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password length is invalid'),
  
  handleValidationErrors
];

// Enhanced forgot password validation
const validateForgotPassword = [
  sanitizeInput,
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email address is too long'),
  
  handleValidationErrors
];

// Enhanced reset password validation
const validateResetPassword = [
  sanitizeInput,
  
  body('new_password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters long')
    .custom((value) => {
      const commonPasswords = ['password', '123456', 'admin', 'qwerty', 'letmein'];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('Password is too common, please choose a stronger password');
      }
      return true;
    }),
  
  body('confirm_new_password')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .isLength({ min: 10, max: 255 })
    .withMessage('Reset token is invalid'),
  
  handleValidationErrors
];

// Enhanced change password validation
const validateChangePassword = [
  sanitizeInput,
  
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required')
    .isLength({ min: 1, max: 128 })
    .withMessage('Current password length is invalid'),
  
  body('new_password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters long')
    .custom((value, { req }) => {
      if (value === req.body.current_password) {
        throw new Error('New password must be different from current password');
      }
      const commonPasswords = ['password', '123456', 'admin', 'qwerty', 'letmein'];
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('Password is too common, please choose a stronger password');
      }
      return true;
    }),
  
  body('confirm_new_password')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Additional validation for other endpoints
const validateContact = [
  sanitizeInput,
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email address is too long'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .escape(),
  
  handleValidationErrors
];

// Guest booking validation (no authentication required)
const validateGuestBooking = [
  sanitizeInput,
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email address is too long'),
  
  body('phone')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number')
    .isLength({ max: 20 })
    .withMessage('Phone number is too long'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('time')
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  
  body('duration_minutes')
    .optional()
    .isInt({ min: 60, max: 120 })
    .withMessage('Duration must be 60 or 90 minutes'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
    .escape(),
  
  body('user_package_id')
    .optional()
    .custom((value) => {
      if (value) {
        throw new Error('Guests cannot use packages. Please login to use a package.');
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateContact,
  validateGuestBooking,
  sanitizeInput,
  handleValidationErrors
};
