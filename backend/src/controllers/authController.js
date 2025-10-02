const crypto = require('crypto');
const User = require('../models/User');
const Instructor = require('../models/Instructor');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const emailService = require('../services/emailService');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const {
        first_name,
        last_name,
        email,
        password,
        phone,
        user_type,
        license_number,
        years_experience,
        hourly_rate
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create user
      const user = await User.create({
        first_name,
        last_name,
        email,
        password,
        phone,
        user_type,
        is_verified: true // Auto-verify for now
      });

      // If user is an instructor, create instructor profile
      if (user_type === 'instructor') {
        await Instructor.create({
          user_id: user.id,
          license_number,
          years_experience,
          hourly_rate
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Update user with refresh token
      await user.update({ refresh_token: refreshToken });

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(user);
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
        // Don't fail registration if email fails
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }


      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user);

      // Update user with refresh token
      await user.update({ refresh_token: refreshToken });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      const user = req.user;
      
      // Clear refresh token
      await user.update({ refresh_token: null });

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        error: error.message
      });
    }
  }

  // Refresh access token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findByPk(decoded.id);
      if (!user || user.refresh_token !== refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

      // Update refresh token
      await user.update({ refresh_token: newRefreshToken });

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const user = req.user;
      res.json({
        success: true,
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: error.message
      });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const user = req.user;
      const allowedUpdates = ['first_name', 'last_name', 'phone'];
      const updates = {};

      // Only allow certain fields to be updated
      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      await user.update(updates);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const user = req.user;
      const { current_password, new_password } = req.body;

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(current_password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await user.update({ password: new_password });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
        error: error.message
      });
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Don't reveal if email exists or not
        return res.json({
          success: true,
          message: 'If an account with that email exists, we have sent a password reset link.'
        });
      }

      // Check if user already has a valid reset token (prevent spam)
      if (user.password_reset_token && user.password_reset_expires && user.password_reset_expires > new Date()) {
        console.log('Password reset already requested for this user, ignoring duplicate request');
        return res.json({
          success: true,
          message: 'If an account with that email exists, we have sent a password reset link.'
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await user.update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires
      });

      // Send reset email
      try {
        await emailService.sendPasswordResetEmail(user, resetToken);
      } catch (emailError) {
        console.error('Password reset email failed:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send reset email'
        });
      }

      res.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process forgot password request',
        error: error.message
      });
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token, new_password } = req.body;

      const user = await User.findOne({
        where: {
          password_reset_token: token,
          password_reset_expires: {
            [require('sequelize').Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Update password and clear reset token
      await user.update({
        password: new_password,
        password_reset_token: null,
        password_reset_expires: null
      });

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
