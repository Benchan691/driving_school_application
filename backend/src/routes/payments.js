const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../services/emailService');
const { User, UserPackage, Package } = require('../models');

// Test endpoint to check Stripe configuration
router.get('/test', (req, res) => {
  console.log('Stripe secret key configured:', !!process.env.STRIPE_SECRET_KEY);
  console.log('Stripe secret key starts with:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'Not set');
  
  res.json({
    success: true,
    message: 'Payment endpoint is working',
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    stripeKeyPrefix: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 7) : 'Not set'
  });
});

// Test endpoint to check email configuration
router.get('/test-email', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check email configuration
    const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
    
    if (!emailConfigured) {
      return res.json({
        success: false,
        message: 'Email not configured',
        details: {
          EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
          EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set',
          EMAIL_FROM: process.env.EMAIL_FROM || 'Not set'
        },
        instructions: 'See EMAIL_SETUP.md for configuration instructions'
      });
    }

    // Send test email
    await emailService.sendPaymentReceipt(user, {
      name: 'Test Package',
      price: 100,
      lessons: 1
    });

    res.json({
      success: true,
      message: 'Test email sent successfully',
      recipient: user.email
    });

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

// Create Stripe Checkout Session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { packageId, packageName } = req.body;
    
    if (!packageName) {
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
    if (packageId) {
      packageDetails = await Package.findByPk(packageId);
    }
    
    // Fallback: try to find by name if packageId not found
    if (!packageDetails) {
      packageDetails = await Package.findOne({ where: { name: packageName } });
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
    if (packageId) {
      packageDetails = await Package.findByPk(packageId);
    }
    
    // Fallback: try to find by name
    if (!packageDetails) {
      packageDetails = await Package.findOne({ where: { name: packageName } });
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

    // Calculate expiry date
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + packageDetails.validity_days);

    // Create user package record
    const userPackage = await UserPackage.create({
      user_id: userId,
      package_id: packageDetails.id,
      package_name: packageName,
      total_lessons: packageDetails.number_of_lessons,
      lessons_used: 0,
      lessons_remaining: packageDetails.number_of_lessons,
      purchase_date: new Date(),
      expiry_date: expiryDate,
      payment_intent_id: session.payment_intent,
      purchase_price: amount // Use the actual amount paid from Stripe session
      // transaction_id: uniqueTransactionId // Temporarily disabled until database schema is updated
    });

    // Send payment receipt email
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

module.exports = router;