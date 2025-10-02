import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const userData = urlParams.get('user');
    const error = urlParams.get('error');

    if (error) {
      let errorMessage = 'Authentication failed';
      switch (error) {
        case 'oauth_failed':
          errorMessage = 'Google authentication failed';
          break;
        case 'oauth_error':
          errorMessage = 'Google authentication error';
          break;
        case 'oauth_cancelled':
          errorMessage = 'Google authentication was cancelled';
          break;
        case 'token_error':
          errorMessage = 'Failed to generate authentication tokens';
          break;
        default:
          errorMessage = 'Authentication failed';
      }
      
      toast.error(errorMessage);
      navigate('/login');
      return;
    }

    if (accessToken && refreshToken && userData) {
      try {
        // Store tokens and user data
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', decodeURIComponent(userData));

        const user = JSON.parse(decodeURIComponent(userData));
        toast.success(`Welcome back, ${user.first_name}!`);
        
        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('Error processing authentication callback:', error);
        toast.error('Failed to process authentication');
        navigate('/login');
      }
    } else {
      toast.error('Invalid authentication response');
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="auth-callback-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div className="loading-spinner" style={{
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #2563eb',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p>Processing authentication...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AuthCallback;

