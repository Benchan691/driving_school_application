import React, { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { FiCreditCard, FiLock, FiAlertCircle, FiUser, FiMail } from 'react-icons/fi';
import { API_BASE } from '../../utils/apiBase';
import './PaymentForm.scss';

const PaymentForm = ({ packageData, onSuccess, onError, onProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Guest info state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestEmailConfirm, setGuestEmailConfirm] = useState('');

  const accessToken = localStorage.getItem('accessToken');
  const isGuest = !accessToken;

  if (!stripe || !elements) {
    return (
      <div className="payment-form">
        <div className="form-section">
          <h3>Payment Information</h3>
          <div className="error-message">
            <FiAlertCircle />
            <span>Loading payment system… Please wait a moment.</span>
          </div>
        </div>
      </div>
    );
  }

  if (stripe && (!stripe.createPaymentMethod || !stripe.confirmCardPayment)) {
    return (
      <div className="payment-form">
        <div className="form-section">
          <h3>Payment Information</h3>
          <div className="error-message">
            <FiAlertCircle />
            <span>Stripe is still loading. Please wait a moment…</span>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    // Guest validation
    if (isGuest) {
      if (!guestName.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (guestEmail !== guestEmailConfirm) {
        setError('Email addresses do not match.');
        return;
      }
    }

    setIsProcessing(true);
    setError(null);
    onProcessing();

    try {
      // Choose endpoint based on auth state
      const endpoint = isGuest
        ? `${API_BASE}/api/payments/create-guest-checkout-session`
        : `${API_BASE}/api/payments/create-checkout-session`;

      const headers = { 'Content-Type': 'application/json' };
      if (!isGuest) headers['Authorization'] = `Bearer ${accessToken}`;

      const body = isGuest
        ? JSON.stringify({ packageId: packageData.id, packageName: packageData.name, guestEmail, guestName })
        : JSON.stringify({ packageId: packageData.id, packageName: packageData.name });

      const checkoutResponse = await fetch(endpoint, { method: 'POST', headers, body });

      if (!checkoutResponse.ok) {
        setError(`Failed to create checkout session: ${checkoutResponse.status}`);
        setIsProcessing(false);
        onError(new Error(`Checkout session creation failed: ${checkoutResponse.status}`));
        return;
      }

      const checkoutData = await checkoutResponse.json();

      if (!checkoutData.success || !checkoutData.data?.url) {
        setError('Failed to create checkout session. Please try again.');
        setIsProcessing(false);
        onError(new Error('Invalid checkout session response'));
        return;
      }

      const sessionId = checkoutData.data.sessionId;
      const checkoutUrl = checkoutData.data.url;

      const stripeWindow = window.open(
        checkoutUrl,
        'stripe-checkout',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!stripeWindow || stripeWindow.closed || typeof stripeWindow.closed === 'undefined') {
        setError('Popup was blocked. Redirecting to payment page…');
        setTimeout(() => { window.location.href = checkoutUrl; }, 1000);
        setIsProcessing(false);
        return;
      }

      const handleMessage = (event) => {
        if (event.data === 'payment-success') {
          // handled via window close detection below
        }
      };
      window.addEventListener('message', handleMessage);

      const checkStatus = setInterval(async () => {
        try {
          if (stripeWindow.closed) {
            clearInterval(checkStatus);
            window.removeEventListener('message', handleMessage);

            setTimeout(() => { setIsProcessing(false); }, 500);

            // Choose status / confirm endpoints
            const authHeader = isGuest ? {} : { 'Authorization': `Bearer ${accessToken}` };
            const statusEndpoint = isGuest
              ? `${API_BASE}/api/payments/check-guest-payment-status/${sessionId}`
              : `${API_BASE}/api/payments/check-payment-status/${sessionId}`;

            const statusResponse = await fetch(statusEndpoint, {
              method: 'GET',
              headers: authHeader,
            });
            const statusData = await statusResponse.json();

            if (statusData.success && statusData.data?.status === 'paid') {
              const confirmEndpoint = isGuest
                ? `${API_BASE}/api/payments/confirm-guest-payment`
                : `${API_BASE}/api/payments/confirm-payment`;

              const confirmHeaders = { 'Content-Type': 'application/json' };
              if (!isGuest) confirmHeaders['Authorization'] = `Bearer ${accessToken}`;

              const confirmResponse = await fetch(confirmEndpoint, {
                method: 'POST',
                headers: confirmHeaders,
                body: JSON.stringify({ sessionId }),
              });
              const confirmData = await confirmResponse.json();

              if (confirmData.success) {
                if (!isGuest) {
                  // Send receipt email for authenticated users
                  fetch(`${API_BASE}/api/payments/send-receipt`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
                    body: JSON.stringify({ packageName: packageData.name, amount: packageData.price, lessons: packageData.lessons || 1 }),
                  }).catch(() => {});
                }

                onSuccess({
                  paymentIntentId: sessionId,
                  status: 'succeeded',
                  amount: packageData.price,
                  package: packageData,
                  userPackage: confirmData.data,
                  isGuest,
                  guestEmail: isGuest ? guestEmail : undefined,
                });
              } else {
                setError('Failed to confirm payment. Please contact support.');
                onError(new Error('Payment confirmation failed'));
              }
            } else {
              setError('Payment was not completed. Please try again.');
              onError(new Error('Payment not completed'));
            }
          } else {
            try {
              const currentUrl = stripeWindow.location.href;
              if (currentUrl.includes('payment-success') || currentUrl.includes('success')) {
                stripeWindow.close();
              }
            } catch (_) {
              // cross-origin — expected
            }
          }
        } catch (err) {
          console.error('Error in payment monitoring:', err);
          clearInterval(checkStatus);
          window.removeEventListener('message', handleMessage);
          setError('Unable to verify payment status. Please check your email for confirmation.');
          onError(err);
        }
      }, 1000);

    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Payment request timed out. Please check your connection and try again.');
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      setIsProcessing(false);
      onError(err);
    }
  };

  return (
    <motion.form
      className="payment-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Guest info fields */}
      {isGuest && (
        <div className="form-section guest-info-section">
          <h3>Your Details</h3>
          <p className="guest-note">No account needed — enter your details to receive a receipt.</p>

          <div className="form-group">
            <label htmlFor="guestName">
              <FiUser /> Full Name
            </label>
            <input
              id="guestName"
              type="text"
              placeholder="Jane Smith"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="guestEmail">
              <FiMail /> Email Address
            </label>
            <input
              id="guestEmail"
              type="email"
              placeholder="jane@example.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="guestEmailConfirm">
              <FiMail /> Confirm Email
            </label>
            <input
              id="guestEmailConfirm"
              type="email"
              placeholder="jane@example.com"
              value={guestEmailConfirm}
              onChange={(e) => setGuestEmailConfirm(e.target.value)}
              required
              className="form-input"
            />
          </div>
        </div>
      )}

      <div className="form-section">
        <h3>Payment Information</h3>

        <div className="payment-info">
          <div className="payment-method">
            <FiCreditCard className="payment-icon" />
            <div className="payment-details">
              <h4>Secure Payment</h4>
              <p>Payment will be processed securely through Stripe</p>
            </div>
          </div>
          <div className="accepted-cards">
            <span>We accept:</span>
            <div className="card-icons">
              <svg viewBox="0 0 48 32" width="40" height="26" className="card-icon">
                <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                <text x="24" y="20" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">VISA</text>
              </svg>
              <svg viewBox="0 0 48 32" width="40" height="26" className="card-icon">
                <rect width="48" height="32" rx="4" fill="#EB001B"/>
                <circle cx="18" cy="16" r="10" fill="#FF5F00" opacity="0.8"/>
                <circle cx="30" cy="16" r="10" fill="#F79E1B" opacity="0.8"/>
              </svg>
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            className="error-message"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiAlertCircle />
            <span>{error}</span>
          </motion.div>
        )}
      </div>

      <div className="form-section">
        <div className="total-amount">
          <div className="amount-breakdown">
            <div className="breakdown-item">
              <span>Package:</span>
              <span>{packageData.name}</span>
            </div>
            <div className="breakdown-item">
              <span>Duration:</span>
              <span>{packageData.duration}</span>
            </div>
            <div className="breakdown-item total">
              <span>Total Amount:</span>
              <span>${packageData.price}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="pay-button"
          disabled={!stripe || isProcessing}
        >
          {isProcessing ? (
            <>
              <div className="spinner"></div>
              Processing…
            </>
          ) : (
            <>
              <FiLock />
              Pay ${packageData.price}
            </>
          )}
        </button>
      </div>

      <div className="security-info">
        <FiLock />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </motion.form>
  );
};

export default PaymentForm;
