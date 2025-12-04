import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCalendar, FiClock, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/dashboard.scss';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { booking, isNewUser } = location.state || {};

  // If no booking data, redirect to booking page
  useEffect(() => {
    if (!booking) {
      navigate('/book');
    }
  }, [booking, navigate]);

  // If no booking data, show loading while redirecting
  if (!booking) {
    return null;
  }

  const bookingDate = booking.lesson_date 
    ? new Date(booking.lesson_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';
  
  const bookingTime = booking.start_time || booking.time || 'N/A';
  const duration = booking.end_time 
    ? (() => {
        const [startH, startM] = (booking.start_time || '00:00').split(':').map(Number);
        const [endH, endM] = booking.end_time.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        const diffMinutes = endMinutes - startMinutes;
        return diffMinutes === 90 ? '1.5 hours' : '1 hour';
      })()
    : '1 hour';
  
  const bookingReference = booking.booking_reference || booking.id || 'N/A';
  const referenceDisplay = typeof bookingReference === 'string' 
    ? bookingReference.substring(0, 8).toUpperCase()
    : bookingReference.toString().substring(0, 8).toUpperCase();

  return (
    <div className="dashboard-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ marginBottom: '1rem' }}
          >
            <FiCheckCircle size={64} color="#16a34a" />
          </motion.div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#16a34a' }}>
            Booking Confirmed!
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#64748b' }}>
            Your lesson has been scheduled successfully
          </p>
        </div>

        {/* Booking Reference */}
        <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ 
            background: '#fef3c7',
            border: '2px solid #f59e0b',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 600, color: '#92400e' }}>
              Booking Reference Number
            </p>
            <code style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#92400e',
              letterSpacing: '2px',
              background: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              display: 'inline-block'
            }}>
              {referenceDisplay}
            </code>
            <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#64748b' }}>
              Please save this reference number for your records
            </p>
          </div>
        </div>

        {/* Booking Details */}
        <div className="booking-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>📋 Booking Details</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiCalendar size={20} color="#3b82f6" />
              <div>
                <strong>Date:</strong> {bookingDate}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiClock size={20} color="#3b82f6" />
              <div>
                <strong>Time:</strong> {bookingTime}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiClock size={20} color="#3b82f6" />
              <div>
                <strong>Duration:</strong> {duration}
              </div>
            </div>
            <div>
              <strong>Status:</strong>{' '}
              <span style={{ 
                background: '#fef3c7',
                color: '#92400e',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600
              }}>
                Pending Verification
              </span>
            </div>
            {booking.notes && (
              <div>
                <strong>Notes:</strong> {booking.notes}
              </div>
            )}
          </div>
        </div>

        {/* Account Information */}
        {isNewUser ? (
          <div className="booking-card" style={{ 
            background: '#dcfce7',
            border: '2px solid #16a34a',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <FiLock size={24} color="#16a34a" />
              <h3 style={{ margin: 0, color: '#166534' }}>🔐 Your Account Has Been Created</h3>
            </div>
            <p style={{ marginBottom: '1rem' }}>
              We've automatically created an account for you so you can manage your bookings online.
            </p>
            <div style={{ 
              background: 'white',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: '8px 0' }}>
                <strong>Email:</strong> {booking.user?.email || 'N/A'}
              </p>
              <p style={{ margin: '8px 0', fontSize: '14px', color: '#64748b' }}>
                A temporary password has been sent to your email address.
              </p>
            </div>
            <div style={{ 
              background: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '1rem'
            }}>
              <strong>⚠️ Important:</strong> Please check your email for your temporary password 
              and change it after logging in for security.
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/login')}
              style={{ width: '100%' }}
            >
              <FiArrowRight style={{ marginRight: '8px' }} />
              Login to Your Account
            </button>
          </div>
        ) : (
          <div className="booking-card" style={{ 
            background: '#dbeafe',
            border: '2px solid #2563eb',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <FiMail size={24} color="#2563eb" />
              <h3 style={{ margin: 0, color: '#1e40af' }}>👋 Welcome Back!</h3>
            </div>
            <p style={{ marginBottom: '1rem' }}>
              Your booking has been added to your existing account. Check your email for confirmation.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              style={{ width: '100%' }}
            >
              <FiArrowRight style={{ marginRight: '8px' }} />
              {user ? 'View Your Bookings' : 'Login to View Bookings'}
            </button>
          </div>
        )}

        {/* Next Steps */}
        <div className="booking-card">
          <h3 style={{ marginTop: 0 }}>📧 What's Next?</h3>
          <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Check your email for booking confirmation</li>
            <li>We'll send you another email once your booking is verified by our team</li>
            <li>If you need to make changes, please contact us as soon as possible</li>
            {isNewUser && (
              <li>Login to your account using the credentials sent to your email</li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '2rem' }}>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/book')}
            style={{ flex: 1 }}
          >
            Book Another Lesson
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/')}
            style={{ flex: 1 }}
          >
            Return to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingConfirmation;

