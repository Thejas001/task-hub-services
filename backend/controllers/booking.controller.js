const Booking = require('../models/booking.model');
const Employee = require('../models/employee.model');
const { Op } = require('sequelize');

// Create a new booking/work request
const createBooking = async (req, res) => {
  try {
    const {
      workerId,
      workerName,
      customerName,
      customerEmail,
      customerPhone,
      workType,
      workDescription,
      preferredDate,
      preferredTime,
      address,
      estimatedHours,
      budget,
      urgency,
      status = 'pending'
    } = req.body;

    // Debug: Log the received data
    console.log('📋 Booking creation request received:', req.body);
    console.log('📋 Data types:', {
      workerId: typeof workerId,
      estimatedHours: typeof estimatedHours,
      preferredDate: typeof preferredDate,
      preferredTime: typeof preferredTime
    });
    
    // Validate required fields
    const missingFields = [];
    if (!workerId) missingFields.push('workerId');
    if (!customerName) missingFields.push('customerName');
    if (!customerEmail) missingFields.push('customerEmail');
    if (!workDescription) missingFields.push('workDescription');
    if (!preferredDate) missingFields.push('preferredDate');
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Check if worker exists
    console.log('🔍 Looking for worker with ID:', workerId);
    const worker = await Employee.findByPk(workerId);
    console.log('👷 Worker found:', worker ? 'Yes' : 'No');
    if (worker) {
      console.log('👷 Worker details:', { id: worker.id, name: `${worker.firstName} ${worker.lastName}`, status: worker.applicationStatus });
    }
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found'
      });
    }

    // Check if the date and time is already booked for this worker
    const existingBooking = await Booking.findOne({
      where: {
        employeeId: workerId,
        preferredDate,
        preferredTime,
        status: ['pending', 'accepted']
      }
    });

    if (existingBooking) {
      console.log('❌ Duplicate booking found:', { employeeId: workerId, preferredDate, preferredTime });
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for the selected worker'
      });
    }

    // Create new booking
    try {
      const bookingData = {
        employeeId: workerId,
        customerName,
        customerEmail,
        customerPhone,
        workDescription: workDescription || workType || '',
        preferredDate,
        preferredTime,
        address,
        estimatedHours: estimatedHours || 1, // Use provided value or default to 1
        specialRequirements: `${budget ? 'Budget: ' + budget : ''}${urgency ? ' Urgency: ' + urgency : ''}`.trim(),
        status,
        bookingDate: new Date().toISOString().split('T')[0]
      };
      
      console.log('📝 Creating booking with data:', bookingData);
      const booking = await Booking.create(bookingData);
      
      console.log('✅ Booking created successfully:', booking.id);
      
      res.status(201).json({
        success: true,
        message: 'Work request submitted successfully',
        data: booking
      });
      
    } catch (dbError) {
      console.error('💥 Database error creating booking:', dbError);
      
      // Handle unique constraint violation
      if (dbError.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'This time slot is already booked for the selected worker'
        });
      }
      
      // Handle other database errors
      return res.status(500).json({
        success: false,
        message: 'Database error occurred while creating booking'
      });
    }

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Get all bookings for a specific worker
// Employee views their own work requests using JWT
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id; // comes from JWT

    // Find the employee linked to this user
    const employee = await Employee.findOne({ where: { userId } });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Fetch all bookings for this employee
    const bookings = await Booking.findAll({
      where: { employeeId: employee.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Update booking status (accept/reject)
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, workerResponse } = req.body;

    if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be accepted, rejected, completed, or cancelled'
      });
    }

    const booking = await Booking.findByPk(bookingId, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName']
      }]
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Update booking status
    await booking.update({
      status,
      specialRequirements: workerResponse || booking.specialRequirements,
      updatedAt: new Date()
    });

    // Prepare response with additional info for frontend
    const responseData = {
      ...booking.toJSON(),
      workerName: booking.employee ? `${booking.employee.firstName} ${booking.employee.lastName}` : 'Unknown Worker',
      customerNotification: status === 'accepted' ? {
        message: `Your work request has been accepted by ${booking.employee ? `${booking.employee.firstName} ${booking.employee.lastName}` : 'the worker'}!`,
        date: booking.preferredDate,
        time: booking.preferredTime
      } : null
    };

    res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: responseData
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Get worker availability for calendar
const getWorkerAvailability = async (req, res) => {
  try {
    const { workerId, month, year } = req.params;

    // Get all bookings for the worker in the specified month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const bookings = await Booking.findAll({
      where: {
        employeeId: workerId,
        preferredDate: {
          [Op.gte]: startDate.toISOString().split('T')[0],
          [Op.lte]: endDate.toISOString().split('T')[0]
        },
        status: ['pending', 'accepted']
      }
    });

    // Create availability map
    const availability = {
      workerId,
      month,
      year,
      bookedDates: bookings.map(booking => booking.preferredDate),
      pendingDates: bookings.filter(booking => booking.status === 'pending').map(booking => booking.preferredDate),
      acceptedDates: bookings.filter(booking => booking.status === 'accepted').map(booking => booking.preferredDate)
    };

    res.status(200).json({
      success: true,
      data: availability
    });

  } catch (error) {
    console.error('Error fetching worker availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch availability',
      error: error.message
    });
  }
};

// Get all bookings (admin view)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName', 'email', 'mobileNumber']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId, {
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName', 'mobileNumber', 'workExperience']
      }]
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

// Get customer bookings by email
const getCustomerBookings = async (req, res) => {
  try {
    const { customerEmail } = req.params;

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Customer email is required'
      });
    }

    // Fetch all bookings for this customer
    const bookings = await Booking.findAll({
      where: { customerEmail },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName', 'mobileNumber', 'workExperience']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });

  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer bookings',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  updateBookingStatus,
  getWorkerAvailability,
  getAllBookings,
  getBookingById,
  getMyBookings,
  getCustomerBookings
};
