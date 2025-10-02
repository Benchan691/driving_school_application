import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard, FiShield, FiCheck, FiAlertCircle, FiXCircle } from 'react-icons/fi';
import PaymentForm from './PaymentForm';
import './PaymentModal.scss';

const PaymentModal = ({ isOpen, onClose, packageData, onSuccess }) => {
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'processing', 'success', 'failed'
  const [paymentResult, setPaymentResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePaymentSuccess = (result) => {
    setPaymentResult(result);
    setPaymentStep('success');
    
    // Auto close after 5 seconds to give user time to see success
    setTimeout(() => {
      onSuccess(result);
      onClose();
      setPaymentStep('form');
      setPaymentResult(null);
    }, 5000);
  };

  const handlePaymentError = (error) => {
    // Show failure state with error message
    setErrorMessage(error.message || 'Payment failed. Please try again.');
    setPaymentStep('failed');
    
    // Auto reset to form after 5 seconds
    setTimeout(() => {
      setPaymentStep('form');
      setErrorMessage('');
    }, 5000);
  };

  const handleClose = () => {
    if (paymentStep === 'processing') return; // Prevent closing during processing
    onClose();
    setPaymentStep('form');
    setPaymentResult(null);
    setErrorMessage('');
  };

  if (!packageData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="payment-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="payment-modal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="payment-modal-header">
              <div className="header-content">
                <div className="header-icon">
                  <FiCreditCard />
                </div>
                <div className="header-text">
                  <h2>Complete Your Purchase</h2>
                  <p>Secure payment powered by Stripe</p>
                </div>
              </div>
              <button
                className="close-button"
                onClick={handleClose}
                disabled={paymentStep === 'processing'}
              >
                <FiX />
              </button>
            </div>

            {/* Package Summary */}
            <div className="package-summary">
              <div className="package-info">
                <h3>{packageData.name}</h3>
                <p className="package-description">{packageData.description}</p>
                <div className="package-features">
                  <ul>
                    {packageData.features.slice(0, 3).map((feature, index) => (
                      <li key={index}>
                        <FiCheck />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="package-pricing">
                <div className="price-display">
                  <span className="current-price">${packageData.price}</span>
                  {packageData.originalPrice > packageData.price && (
                    <span className="original-price">${packageData.originalPrice}</span>
                  )}
                </div>
                <div className="duration">{packageData.duration}</div>
                {packageData.originalPrice > packageData.price && (
                  <div className="savings">
                    Save ${packageData.originalPrice - packageData.price}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Steps */}
            <div className="payment-steps">
              {paymentStep === 'form' && (
                <PaymentForm
                  packageData={packageData}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onProcessing={() => setPaymentStep('processing')}
                />
              )}

              {paymentStep === 'processing' && (
                <motion.div
                  className="processing-step"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="processing-spinner">
                    <div className="spinner"></div>
                  </div>
                  <h3>Processing Payment</h3>
                  <p>Please don't close this window while we process your payment...</p>
                </motion.div>
              )}

              {paymentStep === 'success' && (
                <motion.div
                  className="success-step"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="success-icon">
                    <FiCheck />
                  </div>
                  <h3>Payment Successful!</h3>
                  <p>Your package has been purchased successfully.</p>
                  <div className="success-details">
                    <div className="detail-item">
                      <span>Package:</span>
                      <span>{packageData.name}</span>
                    </div>
                    <div className="detail-item">
                      <span>Amount:</span>
                      <span>${packageData.price}</span>
                    </div>
                    {paymentResult?.paymentIntentId && (
                      <div className="detail-item">
                        <span>Transaction ID:</span>
                        <span>{paymentResult.paymentIntentId}</span>
                      </div>
                    )}
                  </div>
                  <p className="redirect-notice">
                    Redirecting to your dashboard...
                  </p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      onSuccess(paymentResult);
                      onClose();
                      setPaymentStep('form');
                      setPaymentResult(null);
                    }}
                    style={{ marginTop: '16px' }}
                  >
                    Continue to Dashboard
                  </button>
                </motion.div>
              )}

              {paymentStep === 'failed' && (
                <motion.div
                  className="failed-step"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="failed-icon">
                    <FiXCircle />
                  </div>
                  <h3>Payment Failed</h3>
                  <p>{errorMessage}</p>
                  <div className="failed-details">
                    <div className="detail-item">
                      <span>Package:</span>
                      <span>{packageData.name}</span>
                    </div>
                    <div className="detail-item">
                      <span>Amount:</span>
                      <span>${packageData.price}</span>
                    </div>
                  </div>
                  <p className="retry-notice">
                    Please try again or contact support if the problem persists.
                  </p>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => {
                      setPaymentStep('form');
                      setErrorMessage('');
                    }}
                    style={{ marginTop: '16px' }}
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </div>

            {/* Security Notice */}
            <div className="security-notice">
              <FiShield />
              <span>Your payment information is encrypted and secure</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
