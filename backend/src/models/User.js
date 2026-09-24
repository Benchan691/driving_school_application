const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash', // Maps to password_hash column in database
    validate: {
      notEmpty: true,
      len: [8, 255]
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      is: /^[\+]?[1-9][\d]{0,15}$/
    }
  },
  user_type: {
    type: DataTypes.ENUM('student', 'instructor', 'admin'),
    allowNull: false,
    defaultValue: 'student'
  },
  password_reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  email_verification_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  two_factor_enabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  two_factor_secret: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
User.prototype.isLocked = function() {
  return !!(this.locked_until && this.locked_until > Date.now());
};

// Increment failed login attempts
User.prototype.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.locked_until && this.locked_until < Date.now()) {
    return await this.update({
      $unset: { locked_until: 1 },
      $set: { failed_login_attempts: 1 }
    });
  }
  
  const updates = { $inc: { failed_login_attempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.failed_login_attempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { locked_until: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return await this.update(updates);
};

// Reset failed login attempts
User.prototype.resetLoginAttempts = async function() {
  return await this.update({
    $unset: { failed_login_attempts: 1, locked_until: 1 }
  });
};

// Update last login
User.prototype.updateLastLogin = async function() {
  return await this.update({
    last_login: new Date()
  });
};

// Check if email is verified
User.prototype.isEmailVerified = function() {
  return this.email_verified;
};

// Verify email
User.prototype.verifyEmail = async function() {
  return await this.update({
    email_verified: true,
    email_verification_token: null
  });
};

// Generate email verification token
User.prototype.generateEmailVerificationToken = function() {
  const token = require('crypto').randomBytes(32).toString('hex');
  this.email_verification_token = token;
  return token;
};

// Enhanced toJSON with security
User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  
  // Remove sensitive fields
  delete values.password;
  delete values.password_reset_token;
  delete values.password_reset_expires;
  delete values.refresh_token;
  delete values.two_factor_secret;
  delete values.email_verification_token;
  delete values.failed_login_attempts;
  delete values.locked_until;
  
  return values;
};

// Public profile (minimal data)
User.prototype.toPublicJSON = function() {
  return {
    id: this.id,
    name: this.name,
    user_type: this.user_type,
    email_verified: this.email_verified
  };
};

module.exports = User;
