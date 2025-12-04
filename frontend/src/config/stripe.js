import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key from environment
const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!stripeKey) {
  console.error('⚠️ REACT_APP_STRIPE_PUBLISHABLE_KEY is not set.');
  console.error('Please check your .env.development file and restart the frontend container.');
  console.error('Current env check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasKey: !!stripeKey,
    keyLength: stripeKey?.length || 0
  });
}

// Initialize Stripe with your publishable key
export const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

// Log for debugging (remove in production)
if (process.env.NODE_ENV === 'development') {
  console.log('🔑 Stripe initialized:', {
    hasKey: !!stripeKey,
    keyPrefix: stripeKey ? stripeKey.substring(0, 20) + '...' : 'none'
  });
}

