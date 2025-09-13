const express = require('express');
const { verifyPayment, getPaymentHistory, getAllPayments, createPaymentIntent, handlePaymentWebhook } = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/authMiddleware');
const authRole = require('../middleware/authRole');

const router = express.Router();

// Create payment intent
router.post('/create-intent', authMiddleware, createPaymentIntent);

// Verify payment
router.post('/verify', verifyPayment);

// Handle payment webhooks (no auth required for webhooks)
router.post('/webhook', handlePaymentWebhook);

// Get user's payment history
router.get('/history', authMiddleware, getPaymentHistory);

// Get all payments (Admin only)
router.get('/all', authMiddleware, authRole(['admin']), getAllPayments);

module.exports = router;
