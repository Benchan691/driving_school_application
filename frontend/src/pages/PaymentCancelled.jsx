import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentCancelled = () => {
  const [searchParams] = useSearchParams();
  const shouldClose = searchParams.get('close') === 'true';

  useEffect(() => {
    if (shouldClose) {
      // Auto-close the window after a short delay
      setTimeout(() => {
        window.close();
      }, 2000);
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
        backgroundColor: '#fef2f2',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
        <h1 style={{ color: '#dc2626', marginBottom: '10px' }}>Payment Cancelled</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Your payment was cancelled. No charges were made.
        </p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>
          This window will close automatically...
        </p>
      </div>
    </div>
  );
};

export default PaymentCancelled;

