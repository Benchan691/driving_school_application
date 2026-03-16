import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiPhone, FiLock, FiSave, FiEdit, FiEye, FiEyeOff, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Auth.scss';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    reset
  } = useForm();

  const newPassword = watch('new_password');

  // Password strength checker
  const checkPasswordStrength = (password) => {
    if (!password) {
      return { score: 0, text: '', color: '' };
    }
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
    
    score = Object.values(checks).filter(Boolean).length;
    
    if (score <= 2) {
      return { score, text: 'Weak', color: '#ef4444', checks };
    } else if (score === 3) {
      return { score, text: 'Fair', color: '#f59e0b', checks };
    } else if (score === 4) {
      return { score, text: 'Good', color: '#3b82f6', checks };
    } else {
      return { score, text: 'Strong', color: '#10b981', checks };
    }
  };

  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('phone', user.phone || '');
    }
  }, [user, setValue]);

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(newPassword));
  }, [newPassword]);

  const handleProfileUpdate = async (data, event) => {
    event?.preventDefault(); // Ensure we prevent default form behavior
    console.log('🔍 Profile update called with:', data);
    setIsLoading(true);
    
    try {
      const result = await updateProfile(data);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        reset(data);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    console.log('📝 Edit button clicked');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    console.log('❌ Cancel edit clicked');
    setIsEditing(false);
    reset();
  };

  const handlePasswordChange = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await changePassword(data.current_password, data.new_password);
      
      if (result.success) {
        toast.success('Password changed successfully!');
        setIsChangingPassword(false);
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        reset();
      } else {
        // Show specific error message from the server
        const errorMessage = result.message || result.error || 'Failed to change password';
        
        // Handle validation errors if present
        if (result.errors && Array.isArray(result.errors)) {
          const errorMessages = result.errors.map(err => err.message).join(', ');
          toast.error(errorMessages, { duration: 5000 });
        } else {
          toast.error(errorMessage, { duration: 4000 });
        }
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Profile Not Available</h1>
            <p>Please log in to view your profile</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card profile-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <h1>User Profile</h1>
          <p>Manage your account information</p>
        </div>

        {/* Profile Information */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Personal Information</h2>
            {!isEditing && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleEditClick}
              >
                <FiEdit />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form id="profile-form" onSubmit={handleSubmit(handleProfileUpdate)} className="profile-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters long'
                      }
                    })}
                    className={errors.name ? 'error' : ''}
                  />
                </div>
                {errors.name && (
                  <span className="error-text">{errors.name.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number (Optional)</label>
                <div className="input-wrapper">
                  <FiPhone className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+1234567890"
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
                  <span className="error-text">{errors.phone.message}</span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  <FiSave />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  <FiX />
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{user.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{user.phone || 'Not provided'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">User Type:</span>
                <span className="info-value capitalize">{user.user_type}</span>
              </div>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        <div className="profile-section">
          <div className="section-header">
            <h2>Security</h2>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (isChangingPassword) {
                  setShowCurrentPassword(false);
                  setShowNewPassword(false);
                  setShowConfirmPassword(false);
                  reset();
                }
                setIsChangingPassword(!isChangingPassword);
              }}
            >
              {isChangingPassword ? <FiX /> : <FiEdit />}
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          <AnimatePresence>
            {isChangingPassword && (
              <motion.form 
                onSubmit={handleSubmit(handlePasswordChange)} 
                className="password-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="password-change-info">
                  <FiAlertCircle />
                  <p>Choose a strong password to keep your account secure</p>
                </div>

                <div className="form-group">
                  <label htmlFor="current_password">Current Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="current_password"
                      placeholder="Enter your current password"
                      {...register('current_password', {
                        required: 'Current password is required'
                      })}
                      className={errors.current_password ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.current_password && (
                    <span className="error-text">{errors.current_password.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="new_password">New Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="new_password"
                      placeholder="Create a strong password"
                      {...register('new_password', {
                        required: 'New password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters long'
                        }
                      })}
                      className={errors.new_password ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.new_password && (
                    <span className="error-text">{errors.new_password.message}</span>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <motion.div 
                      className="password-strength"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="strength-header">
                        <span className="strength-label">Password Strength:</span>
                        <span className="strength-text" style={{ color: passwordStrength.color }}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div className="strength-bar">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`strength-segment ${level <= passwordStrength.score ? 'active' : ''}`}
                            style={{
                              backgroundColor: level <= passwordStrength.score ? passwordStrength.color : '#e5e7eb'
                            }}
                          />
                        ))}
                      </div>
                      <div className="password-requirements">
                        <div className={`requirement ${passwordStrength.checks?.length ? 'met' : ''}`}>
                          {passwordStrength.checks?.length ? <FiCheck /> : <FiX />}
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`requirement ${passwordStrength.checks?.lowercase ? 'met' : ''}`}>
                          {passwordStrength.checks?.lowercase ? <FiCheck /> : <FiX />}
                          <span>One lowercase letter</span>
                        </div>
                        <div className={`requirement ${passwordStrength.checks?.uppercase ? 'met' : ''}`}>
                          {passwordStrength.checks?.uppercase ? <FiCheck /> : <FiX />}
                          <span>One uppercase letter</span>
                        </div>
                        <div className={`requirement ${passwordStrength.checks?.number ? 'met' : ''}`}>
                          {passwordStrength.checks?.number ? <FiCheck /> : <FiX />}
                          <span>One number</span>
                        </div>
                        <div className={`requirement ${passwordStrength.checks?.special ? 'met' : ''}`}>
                          {passwordStrength.checks?.special ? <FiCheck /> : <FiX />}
                          <span>One special character (@$!%*?&)</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_new_password">Confirm New Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm_new_password"
                      placeholder="Confirm your new password"
                      {...register('confirm_new_password', {
                        required: 'Please confirm your password',
                        validate: value => value === watch('new_password') || 'Passwords do not match'
                      })}
                      className={errors.confirm_new_password ? 'error' : ''}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.confirm_new_password && (
                    <span className="error-text">{errors.confirm_new_password.message}</span>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    <FiLock />
                    {isLoading ? 'Changing Password...' : 'Change Password'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setShowCurrentPassword(false);
                      setShowNewPassword(false);
                      setShowConfirmPassword(false);
                      reset();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
