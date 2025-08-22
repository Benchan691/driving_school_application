// src/api/controllers/auth.controller.js

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/user.model.js';
import sendEmail from '../../services/email.js'; // Import the email service

// ... signup and login functions remain the same ...
// Helper function to sign a JWT token (no changes here)
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// SIGNUP function (no changes here)
export const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const newUser = await User.create({ name, email, phone, password });
    const token = signToken(newUser._id);
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};


// --- MODIFIED LOGIN FUNCTION ---
// LOGIN an existing user by email OR phone number
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    // 1) Check if identifier and password exist
    if (!identifier || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an identifier (email or phone) and password.',
      });
    }

    // 2) Determine if the identifier is an email or a phone number
    const isEmail = identifier.includes('@');
    
    // 3) Build the query dynamically
    const query = {};
    if (isEmail) {
      query.email = identifier;
    } else {
      // Assuming the identifier is the phone number string
      query['phone.number'] = identifier;
    }

    // 4) Find the user in the database based on the dynamic query
    const user = await User.findOne(query).select('+password');

    // 5) Check if user exists & password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect identifier or password.',
      });
    }

    // 6) If everything is ok, send token to client
    const token = signToken(user._id);
    
    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Send a generic success message to prevent user enumeration
      return res.status(200).json({ 
          status: 'success', 
          message: 'If the user exists, a token has been sent to the email.' 
      });
    }

    // 2) Generate the random reset token using our model method
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Save the user document with the new token

    // 3) Send it to user's email
    // Construct the reset URL for the frontend
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for 10 min)',
        message,
      });

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email!',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('💥 EMAIL ERROR:', err);
      return res.status(500).json({ message: 'There was an error sending the email. Try again later.' });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Check if token is not expired
    });

    // 2) If token has not expired, and there is a user, set the new password
    if (!user) {
      return res.status(400).json({ status: 'fail', message: 'Token is invalid or has expired.' });
    }

    user.password = req.body.password;
    // Clear the reset fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); // The pre-save hook will hash the new password

    // 3) Log the user in, send JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    next(error);
  }
};