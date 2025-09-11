const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/create', bookingController.createBooking);
router.get('/availability/:workerId/:month/:year', bookingController.getWorkerAvailability);
router.get('/customer/:customerEmail', bookingController.getCustomerBookings);

// Protected routes (authentication required)
router.get('/worker/my-bookings', authMiddleware, bookingController.getMyBookings);

router.put('/:bookingId/status', authMiddleware, bookingController.updateBookingStatus);
router.get('/:bookingId', authMiddleware, bookingController.getBookingById);

// Admin routes
router.get('/', authMiddleware, bookingController.getAllBookings);

module.exports = router;
