import React, { useState, useEffect } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { FiCreditCard, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../utils/apiBase';
import './PaymentForm.scss';

const PaymentForm = ({ packageData, onSuccess, onError, onProcessing }) => {
  const { user } = useAuth();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  useEffect(() => {
    if (user) {
      setBuyerName(user.name || '');
      setBuyerEmail(user.email || '');
    }
  }, [user]);

  // Check if Stripe is properly loaded
  if (!stripe || !elements) {
    return (
      <div className="payment-form">
        <div className="form-section">
          <h3>Payment Information</h3>
          <div className="error-message">
            <FiAlertCircle />
            <span>Loading Stripe... Please wait a moment.</span>
            <small>Debug: stripe={!!stripe}, elements={!!elements}</small>
          </div>
        </div>
      </div>
    );
  }

  // Check if Stripe has the required methods (better than checking _isReady)
  if (stripe && (!stripe.createPaymentMethod || !stripe.confirmCardPayment)) {
    return (
      <div className="payment-form">
        <div className="form-section">
          <h3>Payment Information</h3>
          <div className="error-message">
            <FiAlertCircle />
            <span>Stripe is still loading. Please wait a moment...</span>
            <small>Debug: Stripe missing required methods</small>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const email = (user ? user.email : (buyerEmail || '').trim()) || '';
    const name = (user ? user.name : (buyerName || '').trim()) || '';
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!user && !name) {
      setError('Please enter your name.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    onProcessing();

    try {
      const checkoutResponse = await fetch(`${API_BASE}/api/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: packageData.id,
          packageName: packageData.name,
          buyerName: name || email,
          buyerEmail: email,
        }),
      });

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

      // Open Stripe Checkout in a new window
      const checkoutUrl = checkoutData.data.url;
      
      if (!checkoutUrl) {
        setError('Invalid checkout URL received from server.');
        setIsProcessing(false);
        onError(new Error('Invalid checkout URL'));
        return;
      }

      console.log('Opening Stripe checkout:', checkoutUrl);
      
      const stripeWindow = window.open(
        checkoutUrl,
        'stripe-checkout',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!stripeWindow || stripeWindow.closed || typeof stripeWindow.closed === 'undefined') {
        // Popup blocked - fallback to same window redirect
        console.warn('Popup blocked, redirecting in same window');
        setError('Popup was blocked. Redirecting to payment page...');
        setTimeout(() => {
          window.location.href = checkoutUrl;
        }, 1000);
        setIsProcessing(false);
        return;
      }

      // Listen for postMessage from the success page
      const handleMessage = (event) => {
        if (event.data === 'payment-success') {
          console.log('Received payment success message from popup');
          // The success page will close the window, so we'll handle it in the window close detection
        }
      };
      
      window.addEventListener('message', handleMessage);

      // Monitor the popup window for both closure and URL changes
      const checkStatus = setInterval(async () => {
        try {
          // Check if window is closed
          if (stripeWindow.closed) {
            clearInterval(checkStatus);
            window.removeEventListener('message', handleMessage);
            
            // Add a small delay to ensure processing state is maintained
            setTimeout(() => {
              setIsProcessing(false);
            }, 500);
            
            // Check payment status when window closes
            const statusResponse = await fetch(`${API_BASE}/api/payments/check-payment-status/${sessionId}`, {
              method: 'GET',
            });
            
            const statusData = await statusResponse.json();
            console.log('Payment status check result:', statusData);
            
            if (statusData.success && statusData.data?.status === 'paid') {
              console.log('Payment succeeded, creating UserPackage...');
              
              // Create UserPackage record after successful payment (receipt sent by backend)
              const confirmResponse = await fetch(`${API_BASE}/api/payments/confirm-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: sessionId }),
              });
              
              const confirmData = await confirmResponse.json();
              
              if (confirmData.success) {
                onSuccess({
                  paymentIntentId: sessionId,
                  status: 'succeeded',
                  amount: packageData.price,
                  package: packageData,
                  userPackage: confirmData.data
                });
              } else {
                setError('Failed to create package record. Please contact support.');
                onError(new Error('Package creation failed'));
              }
            } else {
              // Payment was not successful
              setError('Payment was not completed or failed. Please try again.');
              onError(new Error('Payment not completed'));
            }
          } else {
            // Check if window has navigated to success URL
            try {
              const currentUrl = stripeWindow.location.href;
              if (currentUrl.includes('payment-success') || currentUrl.includes('success')) {
                // Payment was successful, close the window and process
                stripeWindow.close();
                clearInterval(checkStatus);
                window.removeEventListener('message', handleMessage);
                
                // Wait a moment for the window to close, then check status
                setTimeout(async () => {
                  try {
                    const statusResponse = await fetch(`${API_BASE}/api/payments/check-payment-status/${sessionId}`, {
                      method: 'GET',
                    });
                    
                    const statusData = await statusResponse.json();
                    console.log('Payment status after success redirect:', statusData);
                    
                    if (statusData.success && statusData.data?.status === 'paid') {
                      // Create UserPackage record
                      const confirmResponse = await fetch(`${API_BASE}/api/payments/confirm-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ sessionId: sessionId }),
                      });
                      
                      const confirmData = await confirmResponse.json();
                      console.log('Confirm payment result:', confirmData);
                      
                      if (confirmData.success) {
                        onSuccess({
                          paymentIntentId: sessionId,
                          status: 'succeeded',
                          amount: packageData.price,
                          package: packageData,
                          userPackage: confirmData.data
                        });
                      } else {
                        setError('Failed to create package record. Please contact support.');
                        onError(new Error('Package creation failed'));
                      }
                    } else {
                      // Payment verification failed
                      setError('Payment verification failed. Please check your dashboard.');
                      onError(new Error('Payment verification failed'));
                    }
                  } catch (error) {
                    console.error('Error checking payment status:', error);
                    setError('Unable to verify payment status. Please check your dashboard.');
                    onError(error);
                  }
                }, 1000);
              }
            } catch (crossOriginError) {
              // This is expected when trying to access cross-origin URLs
              // We'll rely on the window close detection instead
            }
          }
        } catch (error) {
          console.error('Error in payment monitoring:', error);
          clearInterval(checkStatus);
          window.removeEventListener('message', handleMessage);
          setError('Unable to verify payment status. Please check your dashboard.');
          onError(error);
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

  // No longer need card element options since we're using external window

  return (
    <motion.form
      className="payment-form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!user && (
        <div className="form-section buyer-info-section">
          <h3>Your details</h3>
          <div className="buyer-fields">
            <label>
              Full name <span className="required">*</span>
              <input
                type="text"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </label>
            <label>
              Email <span className="required">*</span>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </label>
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
              Processing...
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
