const Payment = require('../models/payment.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');

// Verify payment and update status
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, transactionId, paymentStatus } = req.body;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update payment status
    await payment.update({
      paymentStatus: paymentStatus || 'completed',
      transactionId: transactionId || payment.transactionId,
      paidAt: paymentStatus === 'completed' ? new Date() : payment.paidAt
    });

    res.json({ 
      message: 'Payment verified successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.paymentStatus,
        transactionId: payment.transactionId
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

// Get payment history for a user
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const payments = await Payment.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Error fetching payment history', error: error.message });
  }
};

// Get all payments (Admin only)
exports.getAllPayments = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payments = await Payment.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: Employee,
          attributes: ['id', 'firstName', 'lastName', 'workType']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(payments);
  } catch (error) {
    console.error('Get all payments error:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Create payment intent (multi-gateway support)
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, paymentType, description, paymentMethod = 'razorpay' } = req.body;
    const userId = req.user.id;

    // Create pending payment record
    const payment = await Payment.create({
      userId,
      paymentType: paymentType || 'registration_fee',
      amount: amount || 500,
      paymentMethod: paymentMethod,
      paymentStatus: 'pending',
      description: description || 'Worker registration fee'
    });

    // For demo purposes, we'll simulate successful payment immediately
    // In production, you would integrate with actual payment gateways
    const transactionId = `txn_${payment.id}_${Date.now()}`;
    
    // Update payment as completed for demo
    await payment.update({
      paymentStatus: 'completed',
      transactionId: transactionId,
      paidAt: new Date()
    });

    // Generate payment intent response
    let paymentIntent = {
      paymentId: payment.id,
      amount: payment.amount,
      currency: 'INR',
      paymentMethod: paymentMethod,
      transactionId: transactionId,
      status: 'completed'
    };

    switch (paymentMethod.toLowerCase()) {
      case 'razorpay':
        paymentIntent = {
          ...paymentIntent,
          orderId: `rzp_order_${payment.id}_${Date.now()}`,
          key: process.env.RAZORPAY_KEY_ID || 'rzp_test_key',
          gateway: 'razorpay'
        };
        break;
      
      case 'stripe':
        paymentIntent = {
          ...paymentIntent,
          clientSecret: `pi_test_${payment.id}_${Date.now()}`,
          publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_key',
          gateway: 'stripe'
        };
        break;
      
      case 'paypal':
        paymentIntent = {
          ...paymentIntent,
          orderId: `paypal_order_${payment.id}_${Date.now()}`,
          clientId: process.env.PAYPAL_CLIENT_ID || 'paypal_test_key',
          gateway: 'paypal'
        };
        break;
      
      default:
        // Mock payment for testing
        paymentIntent = {
          ...paymentIntent,
          orderId: `mock_order_${payment.id}_${Date.now()}`,
          gateway: 'mock'
        };
    }

    res.json(paymentIntent);
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
};

// Handle payment webhooks (for all gateways)
exports.handlePaymentWebhook = async (req, res) => {
  try {
    const { paymentId, transactionId, status, gateway, signature } = req.body;
    
    // Verify webhook signature based on gateway
    let isValid = false;
    
    switch (gateway) {
      case 'razorpay':
        // Verify Razorpay signature
        isValid = verifyRazorpaySignature(req.body, signature);
        break;
      case 'stripe':
        // Verify Stripe signature
        isValid = verifyStripeSignature(req);
        break;
      case 'paypal':
        // Verify PayPal signature
        isValid = verifyPayPalSignature(req.body, signature);
        break;
      default:
        isValid = true; // For testing
    }

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    // Update payment status
    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await payment.update({
      paymentStatus: status,
      transactionId: transactionId || payment.transactionId,
      paidAt: status === 'completed' ? new Date() : payment.paidAt,
      paymentGatewayResponse: req.body
    });

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
};

// Helper functions for webhook verification
function verifyRazorpaySignature(body, signature) {
  // Implement Razorpay signature verification
  return true; // Simplified for demo
}

function verifyStripeSignature(req) {
  // Implement Stripe signature verification
  return true; // Simplified for demo
}

function verifyPayPalSignature(body, signature) {
  // Implement PayPal signature verification
  return true; // Simplified for demo
}
