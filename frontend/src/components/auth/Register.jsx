import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../utils/apiBase';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import './Auth.scss';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    trigger,
    formState: { errors },
    setError
  } = useForm({
    defaultValues: {
      user_type: 'student'
    }
  });

  const watchedPassword = watch('password');

  // Re-validate confirm_password whenever the password field changes
  useEffect(() => {
    if (getValues('confirm_password')) {
      trigger('confirm_password');
    }
  }, [watchedPassword, trigger, getValues]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Prepare registration data — backend uses `name` directly
      // confirm_password is kept so the backend validator can compare it against password
      const registrationData = { ...data };

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (result.success) {
        // Store tokens
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));

        toast.success('Registration successful! Welcome to our driving school!');
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        if (result.errors) {
          result.errors.forEach(error => {
            // confirm_password is validated on the frontend; ignore any backend error for it
            if (error.path === 'confirm_password') return;
            setError(error.path, {
              type: 'manual',
              message: error.message
            });
          });
        } else {
          setError('root', {
            type: 'manual',
            message: result.message || 'Registration failed. Please try again.'
          });
        }
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('root', {
        type: 'manual',
        message: 'Network error. Please check your connection.'
      });
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="auth-container">
      <motion.div
        className="auth-card register-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join our driving school community</p>
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


          {/* Personal Information */}
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" />
              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
                {...register('name', {
                  required: 'Full name is required',
                  validate: (value) => {
                    const trimmed = value.trim();
                    if (trimmed.length < 2) return 'Name must be at least 2 characters';
                    return true;
                  }
                })}
                className={errors.name ? 'error' : ''}
              />
            </div>
            {errors.name && (
              <span className="field-error">{errors.name.message}</span>
            )}
            <small className="form-hint">Enter your first and last name</small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="Enter your email address"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && (
              <span className="field-error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <FiPhone className="input-icon" />
              <input
                type="tel"
                id="phone"
                placeholder="Enter your phone number"
                {...register('phone', {
                  pattern: {
                    value: /^[+]?[1-9][\d]{0,15}$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                className={errors.phone ? 'error' : ''}
              />
            </div>
            {errors.phone && (
              <span className="field-error">{errors.phone.message}</span>
            )}
          </div>


          {/* Password fields */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Create a strong password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain uppercase, lowercase, number, and special character'
                  }
                })}
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirm_password">Confirm Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirm_password"
                placeholder="Confirm your password"
                {...register('confirm_password', {
                  required: 'Please confirm your password',
                  validate: (value) => {
                    const pwd = getValues('password');
                    return value === pwd || 'Passwords do not match';
                  }
                })}
                className={errors.confirm_password ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirm_password && (
              <span className="field-error">{errors.confirm_password.message}</span>
            )}
          </div>

          {/* Hidden user type field */}
          <input type="hidden" {...register('user_type')} value="student" />

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
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>

      <div className="auth-background">
        <div className="background-shapes">
          <motion.div
            className="shape shape-1"
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="shape shape-2"
            animate={{
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
