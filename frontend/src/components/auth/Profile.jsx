import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiPhone, FiLock, FiSave, FiEdit, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Auth.scss';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    setError,
    reset
  } = useForm();

  useEffect(() => {
    if (user) {
      setValue('first_name', user.first_name || '');
      setValue('last_name', user.last_name || '');
      setValue('phone', user.phone || '');
    }
  }, [user, setValue]);

  const handleProfileUpdate = async (data) => {
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

  const handlePasswordChange = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await changePassword(data.current_password, data.new_password);
      
      if (result.success) {
        toast.success('Password changed successfully!');
        setIsChangingPassword(false);
        reset();
      } else {
        toast.error(result.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error('An error occurred while changing password');
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
            {isEditing ? (
              <button
                type="submit"
                form="profile-form"
                className="btn btn-secondary btn-sm"
                disabled={isLoading}
              >
                <FiSave />
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsEditing(true)}
              >
                <FiEdit />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form id="profile-form" onSubmit={handleSubmit(handleProfileUpdate)} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">First Name</label>
                  <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      id="first_name"
                      {...register('first_name', {
                        required: 'First name is required',
                        minLength: {
                          value: 2,
                          message: 'First name must be at least 2 characters long'
                        }
                      })}
                      className={errors.first_name ? 'error' : ''}
                    />
                  </div>
                  {errors.first_name && (
                    <span className="error-text">{errors.first_name.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="last_name">Last Name</label>
                  <div className="input-wrapper">
                    <FiUser className="input-icon" />
                    <input
                      type="text"
                      id="last_name"
                      {...register('last_name', {
                        required: 'Last name is required',
                        minLength: {
                          value: 2,
                          message: 'Last name must be at least 2 characters long'
                        }
                      })}
                      className={errors.last_name ? 'error' : ''}
                    />
                  </div>
                  {errors.last_name && (
                    <span className="error-text">{errors.last_name.message}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-wrapper">
                  <FiPhone className="input-icon" />
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone', {
                      pattern: {
                        value: /^[\+]?[1-9][\d]{0,15}$/,
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
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                >
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
                <span className="info-label">First Name:</span>
                <span className="info-value">{user.first_name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Last Name:</span>
                <span className="info-value">{user.last_name}</span>
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
              onClick={() => setIsChangingPassword(!isChangingPassword)}
            >
              {isChangingPassword ? <FiSave /> : <FiEdit />}
              {isChangingPassword ? 'Save' : 'Change Password'}
            </button>
          </div>

          {isChangingPassword && (
            <form onSubmit={handleSubmit(handlePasswordChange)} className="password-form">
              <div className="form-group">
                <label htmlFor="current_password">Current Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type="password"
                    id="current_password"
                    {...register('current_password', {
                      required: 'Current password is required'
                    })}
                    className={errors.current_password ? 'error' : ''}
                  />
                </div>
                {errors.current_password && (
                  <span className="error-text">{errors.current_password.message}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="new_password">New Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type="password"
                      id="new_password"
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
                  </div>
                  {errors.new_password && (
                    <span className="error-text">{errors.new_password.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_new_password">Confirm New Password</label>
                  <div className="input-wrapper">
                    <FiLock className="input-icon" />
                    <input
                      type="password"
                      id="confirm_new_password"
                      {...register('confirm_new_password', {
                        required: 'Please confirm your password',
                        validate: value => value === watch('new_password') || 'Passwords do not match'
                      })}
                      className={errors.confirm_new_password ? 'error' : ''}
                    />
                  </div>
                  {errors.confirm_new_password && (
                    <span className="error-text">{errors.confirm_new_password.message}</span>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsChangingPassword(false);
                    reset();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
