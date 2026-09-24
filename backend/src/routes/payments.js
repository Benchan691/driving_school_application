const express = require('express');
const router = express.Router();

// Initialize Stripe only if secret key is provided
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim() !== '') {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn('⚠️  Stripe secret key not configured. Payment features will be disabled.');
}

const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');
const { User, UserPackage, Package } = require('../models');

// REMOVED: Insecure test endpoint that exposed Stripe configuration
// For security reasons, this endpoint has been removed.
// Use environment variable checks or admin-only health endpoints instead.

// REMOVED: Test email endpoint for security reasons
// Exposed email configuration details. Use server-side logging for debugging instead.

// Create Stripe Checkout Session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { packageId, packageName } = req.body;
    
    console.log('Payment request received:', { packageId, packageName, userId: req.user.id });
    
    if (!packageName) {
      console.log('Package name missing in request');
      return res.status(400).json({
        success: false,
        message: 'Package name is required'
      });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate package exists in database
    let packageDetails;
    
    // Try to find by name first (since frontend uses integer IDs but DB uses UUIDs)
    packageDetails = await Package.findOne({ where: { name: packageName } });
    
    // If not found and packageId is a valid UUID, try by ID
    if (!packageDetails && packageId && typeof packageId === 'string' && packageId.length > 10) {
      packageDetails = await Package.findByPk(packageId);
    }
    
    // If still not found, use hardcoded mapping as fallback
    if (!packageDetails) {
      const packageNameMap = {
        '1 Hour Driving Lesson': { number_of_lessons: 1, validity_days: 365 },
        '1.5 Hours Driving Lessons': { number_of_lessons: 1, validity_days: 365 },
        'Package A': { number_of_lessons: 4, validity_days: 365 },
        'Package B': { number_of_lessons: 6, validity_days: 365 },
        'Package C': { number_of_lessons: 10, validity_days: 365 },
        'Road Test': { number_of_lessons: 1, validity_days: 365 }
      };
      
      const mappedPackage = packageNameMap[packageName];
      if (!mappedPackage) {
        return res.status(404).json({
          success: false,
          message: 'Package not found in database'
        });
      }
    }

    // Try to find package in database first
    let packageData;
    try {
      packageData = await Package.findByPk(packageId);
    } catch (error) {
      console.log('Package not found by ID, trying by name...');
    }

    // If not found by ID, try to find by name
    if (!packageData) {
      const packageNameMap = {
        '1 Hour Driving Lesson': '1 Hour Driving Lesson',
        '1.5 Hours Driving Lessons': '1.5 Hours Driving Lessons', 
        'Package A': 'Package A',
        'Package B': 'Package B',
        'Package C': 'Package C',
        'Road Test': 'Road Test'
      };
      
      const dbPackageName = packageNameMap[packageName] || packageName;
      packageData = await Package.findOne({ where: { name: dbPackageName } });
    }

    if (!packageData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Package not found' 
      });
    }

    // Check if Stripe is configured
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured. Please contact support.'
      });
    }

    // Use package price from database (convert to cents for Stripe)
    const amountInCents = Math.round(packageData.price * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: packageData.name,
              description: packageData.description || 'Driving lesson package',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
      metadata: {
        userId: user.id.toString(),
        userEmail: user.email,
        packageName: packageName,
        packageId: packageId || ''
      }
    });

    res.json({
      success: true,
      data: {
        url: session.url,
        sessionId: session.id
      }
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create checkout session',
      error: error.message
    });
  }
});

// Confirm payment and create user package
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Check if Stripe is configured
    if (!stripe) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured. Please contact support.'
      });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed or session not found'
      });
    }

    // Get user from session metadata
    const userId = session.metadata?.userId;
    const userEmail = session.metadata?.userEmail;
    const packageName = session.metadata?.packageName;
    const packageId = session.metadata?.packageId;

    if (!userId || !userEmail || !packageName) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session metadata'
      });
    }

    // Verify user exists and matches
    const user = await User.findByPk(userId);
    if (!user || user.email !== userEmail) {
      return res.status(403).json({
        success: false,
        message: 'User verification failed'
      });
    }

    // Get package details
    let packageDetails;
    
    // Try to find by name first (since frontend uses integer IDs but DB uses UUIDs)
    packageDetails = await Package.findOne({ where: { name: packageName } });
    
    // If not found and packageId is a valid UUID, try by ID
    if (!packageDetails && packageId && typeof packageId === 'string' && packageId.length > 10) {
      packageDetails = await Package.findByPk(packageId);
    }
    
    // If still not found, use hardcoded mapping
    if (!packageDetails) {
      const packageNameMap = {
        '1 Hour Driving Lesson': { number_of_lessons: 1, validity_days: 365 },
        '1.5 Hours Driving Lessons': { number_of_lessons: 1, validity_days: 365 },
        'Package A': { number_of_lessons: 4, validity_days: 365 },
        'Package B': { number_of_lessons: 6, validity_days: 365 },
        'Package C': { number_of_lessons: 10, validity_days: 365 },
        'Road Test': { number_of_lessons: 1, validity_days: 365 }
      };
      
      const mappedPackage = packageNameMap[packageName];
      if (!mappedPackage) {
        return res.status(404).json({
          success: false,
          message: 'Package not found'
        });
      }
      
      packageDetails = {
        id: packageId || 1,
        name: packageName,
        number_of_lessons: mappedPackage.number_of_lessons,
        validity_days: mappedPackage.validity_days
      };
    }

    // Extract package details from session
    const amount = session.amount_total / 100; // Convert from cents

    // Generate unique transaction ID combining Stripe payment intent with timestamp and user ID
    const timestamp = Date.now();
    const uniqueTransactionId = `${session.payment_intent}_${userId}_${timestamp}`;

    // Create user package record
    const userPackage = await UserPackage.create({
      user_id: userId,
      package_id: packageDetails.id,
      package_name: packageName,
      total_lessons: packageDetails.number_of_lessons,
      purchase_date: new Date(),
      payment_intent_id: session.payment_intent,
      purchase_price: amount // Use the actual amount paid from Stripe session
      // transaction_id: uniqueTransactionId // Temporarily disabled until database schema is updated
    });

    // Send payment receipt email to user
    try {
      await emailService.sendPaymentReceipt(user, {
        name: packageName,
        description: packageDetails.description || 'Driving lesson package',
        duration: `${packageDetails.number_of_lessons} lesson${packageDetails.number_of_lessons > 1 ? 's' : ''}`,
        price: amount
      }, {
        paymentIntentId: session.payment_intent, // Use Stripe payment intent as transaction ID
        amount: session.amount_total
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the payment confirmation if email fails
    }

    // Send notification email to admin
    try {
      await emailService.sendAdminPaymentNotification(user, {
        name: packageName,
        description: packageDetails.description || 'Driving lesson package',
        duration: `${packageDetails.number_of_lessons} lesson${packageDetails.number_of_lessons > 1 ? 's' : ''}`
      }, {
        paymentIntentId: session.payment_intent,
        amount: session.amount_total
      });
    } catch (emailError) {
      console.error('Failed to send admin payment notification:', emailError);
      // Don't fail the payment confirmation if email fails
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        packageName,
        amount,
        lessons: packageDetails.number_of_lessons,
        userPackageId: userPackage.id,
        transactionId: session.payment_intent, // Use Stripe payment intent as transaction ID
        stripePaymentIntent: session.payment_intent
      }
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
});

// Check payment status
router.get('/check-payment-status/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      success: true,
      data: {
        status: session.payment_status,
        paid: session.payment_status === 'paid'
      }
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
});

// Send receipt email
router.post('/send-receipt', authenticateToken, async (req, res) => {
  try {
    const { packageName, amount, lessons } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await emailService.sendPaymentReceipt(user, {
      name: packageName,
      price: amount,
      lessons: lessons
    });

    res.json({
      success: true,
      message: 'Receipt sent successfully'
    });

  } catch (error) {
    console.error('Send receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send receipt',
      error: error.message
    });
  }
});

// ── Guest Payment Routes (no authentication required) ──────────────────────

// Create Stripe Checkout Session for guests
router.post('/create-guest-checkout-session', async (req, res) => {
  try {
    const { packageId, packageName, guestEmail, guestName } = req.body;

    if (!packageName) {
      return res.status(400).json({ success: false, message: 'Package name is required' });
    }
    if (!guestEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payment service is not configured. Please contact support.' });
    }

    // Find package by name or ID
    let packageData = null;
    if (packageId) {
      try { packageData = await Package.findByPk(packageId); } catch (_) {}
    }
    if (!packageData) {
      packageData = await Package.findOne({ where: { name: packageName } });
    }
    if (!packageData) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const amountInCents = Math.round(packageData.price * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: guestEmail,
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: packageData.name,
              description: packageData.description || 'Driving lesson package',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
      metadata: {
        guestEmail,
        guestName: guestName || '',
        packageName,
        packageId: packageId || packageData.id.toString(),
        isGuest: 'true',
      },
    });

    res.json({ success: true, data: { url: session.url, sessionId: session.id } });
  } catch (error) {
    console.error('Guest checkout session error:', error);
    res.status(500).json({ success: false, message: 'Failed to create checkout session', error: error.message });
  }
});

// Check payment status for guests (no auth)
router.get('/check-guest-payment-status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payment service is not configured.' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    res.json({
      success: true,
      data: {
        status: session.payment_status,
        paid: session.payment_status === 'paid',
      },
    });
  } catch (error) {
    console.error('Guest payment status check error:', error);
    res.status(500).json({ success: false, message: 'Failed to check payment status', error: error.message });
  }
});

// Confirm guest payment and send receipt email (no UserPackage created)
router.post('/confirm-guest-payment', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payment service is not configured.' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed or session not found' });
    }

    const { guestEmail, guestName, packageName, packageId } = session.metadata || {};

    if (!guestEmail || !packageName) {
      return res.status(400).json({ success: false, message: 'Invalid session metadata' });
    }

    // Resolve package details for the receipt
    let packageDetails = null;
    if (packageId) {
      try { packageDetails = await Package.findByPk(packageId); } catch (_) {}
    }
    if (!packageDetails) {
      packageDetails = await Package.findOne({ where: { name: packageName } });
    }

    const amount = session.amount_total / 100;
    const lessons = packageDetails ? packageDetails.number_of_lessons : 1;

    // Send receipt email to guest
    try {
      const guestUser = { name: guestName || guestEmail, email: guestEmail };
      await emailService.sendPaymentReceipt(guestUser, {
        name: packageName,
        description: packageDetails ? packageDetails.description : 'Driving lesson package',
        duration: `${lessons} lesson${lessons !== 1 ? 's' : ''}`,
        price: amount,
      }, {
        paymentIntentId: session.payment_intent,
        amount: session.amount_total,
      });
    } catch (emailError) {
      console.error('Guest receipt email failed:', emailError);
      // Non-critical — don't fail the response
    }

    // Notify admin
    try {
      const guestUser = { name: guestName || guestEmail, email: guestEmail };
      await emailService.sendAdminPaymentNotification(guestUser, {
        name: packageName,
        description: packageDetails ? packageDetails.description : 'Driving lesson package',
        duration: `${lessons} lesson${lessons !== 1 ? 's' : ''}`,
      }, {
        paymentIntentId: session.payment_intent,
        amount: session.amount_total,
      });
    } catch (emailError) {
      console.error('Guest admin notification failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Guest payment confirmed successfully',
      data: {
        packageName,
        amount,
        lessons,
        guestEmail,
        transactionId: session.payment_intent,
      },
    });
  } catch (error) {
    console.error('Guest payment confirmation error:', error);
    res.status(500).json({ success: false, message: 'Failed to confirm payment', error: error.message });
  }
});

module.exports = router;