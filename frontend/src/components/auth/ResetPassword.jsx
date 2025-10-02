import React, { useState } from 'react';
import { API_BASE } from '../../utils/apiBase';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './Auth.scss';


const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError
  } = useForm();

  const watchedPassword = watch('new_password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const token = searchParams.get('token');
      if (!token) {
        setError('root', {
          type: 'manual',
          message: 'Reset token is missing. Please use the link from your email.'
        });
        toast.error('Invalid reset link. Please use the link from your email.');
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          token
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSuccess(true);
        toast.success('Password reset successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach(error => {
            setError(error.path, {
              type: 'manual',
              message: error.message
            });
          });
        } else {
          const errorMessage = result.message || 'Password reset failed. Please try again.';
          setError('root', {
            type: 'manual',
            message: errorMessage
          });
        }
        toast.error(result.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('root', {
        type: 'manual',
        message: 'Network error. Please check your connection.'
      });
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-header">
            <div className="success-icon">
              <FiCheckCircle />
            </div>
            <h1>Password Reset Successful</h1>
            <p>Your password has been updated</p>
          </div>

          <div className="auth-content">
            <p className="success-message">
              Your password has been successfully reset. You will be redirected to the login page shortly.
            </p>
            
            <div className="auth-actions">
              <button
                onClick={() => navigate('/login')}
                className="auth-button"
              >
                Go to Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your new password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          {errors.root && (
            <motion.div
              className="error-message"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <FiAlertCircle />
              <span>{errors.root.message}</span>
            </motion.div>
          )}

          <div className="form-group">
            <label htmlFor="new_password">New Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="new_password"
                placeholder="Enter new password"
                {...register('new_password', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                  }
                })}
                className={errors.new_password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.new_password && (
              <span className="field-error">{errors.new_password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm_new_password">Confirm New Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm_new_password"
                placeholder="Confirm new password"
                {...register('confirm_new_password', {
                  required: 'Please confirm your password',
                  validate: value => value === watchedPassword || 'Passwords do not match'
                })}
                className={errors.confirm_new_password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirm_new_password && (
              <span className="field-error">{errors.confirm_new_password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <motion.div
                className="loading-spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPassword;




