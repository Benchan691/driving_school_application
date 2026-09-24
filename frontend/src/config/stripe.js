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

