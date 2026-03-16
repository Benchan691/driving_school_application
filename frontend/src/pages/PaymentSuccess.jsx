import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const shouldClose = searchParams.get('close') === 'true';
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (shouldClose) {
      // Auto-close the window after a short delay
      setTimeout(() => {
        window.close();
      }, 1000);
    }
  }, [shouldClose]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: '#f0fdf4',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#16a34a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          boxShadow: '0 10px 25px rgba(22, 163, 74, 0.3)'
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1 style={{ color: '#16a34a', marginBottom: '10px' }}>Payment Successful!</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Your payment has been processed successfully.
        </p>
        {sessionId && (
          <p style={{ fontSize: '12px', color: '#999' }}>
            Session ID: {sessionId}
          </p>
        )}
        <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
          This window will close automatically...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;

