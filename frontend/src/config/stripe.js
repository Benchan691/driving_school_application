import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key - get from your Stripe dashboard
// Test key format: pk_test_...
// Live key format: pk_live_...
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// Validate the key format
if (!stripePublishableKey) {
  console.error('REACT_APP_STRIPE_PUBLISHABLE_KEY environment variable is not set');
} else if (!stripePublishableKey.startsWith('pk_test_') && !stripePublishableKey.startsWith('pk_live_')) {
  console.error('Invalid Stripe publishable key format. Must start with pk_test_ or pk_live_');
} else {
  console.log('Stripe publishable key loaded:', stripePublishableKey.substring(0, 20) + '...');
}

// Create stripe promise with error handling
export const stripePromise = stripePublishableKey ? 
  loadStripe(stripePublishableKey).catch(error => {
    console.error('Failed to load Stripe:', error);
    return null;
  }) : 
  null;

// Add debugging
if (stripePromise) {
  stripePromise.then(stripe => {
    if (stripe) {
      console.log('Stripe loaded successfully in browser');
    } else {
      console.error('Stripe failed to load - returned null');
    }
  }).catch(error => {
    console.error('Stripe loading error:', error);
  });
}