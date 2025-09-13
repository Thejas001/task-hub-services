const { User} = require('../models');
const Employee = require('../models/employee.model');
const Payment = require('../models/payment.model');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/db');
const notificationService = require('../services/notificationService');


// Complete worker profile with payment (called after basic registration)
exports.completeWorkerProfile = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    console.log('Complete profile request body:', req.body);
    console.log('Complete profile request files:', req.files);
    console.log('User from token:', req.user);
    
    const {
      firstName, middleName, lastName,
      age, address, state, pinCode, city,
      mobileNumber, nationality, workExperience,
      workType, hourlyRate, bio, skills, 
      certifications, isAvailable, availableDays, 
      availableTimeSlots, paymentMethod, transactionId
    } = req.body;

    const userId = req.user.id; // From JWT token

    // Check if user already has an employee profile
    const existingEmployee = await Employee.findOne({ where: { userId } });
    if (existingEmployee) {
      console.log('User already has employee profile:', existingEmployee.id);
      return res.status(400).json({ 
        message: 'Profile already completed',
        employeeId: existingEmployee.id,
        applicationStatus: existingEmployee.applicationStatus
      });
    }

    // Update user details
    await User.update({
      name: `${firstName} ${middleName || ''} ${lastName}`.trim(),
      phone: mobileNumber
    }, { where: { id: userId }, transaction: t });

    // Parse JSON fields if they're strings
    let parsedSkills = skills;
    let parsedCertifications = certifications;
    let parsedAvailableDays = availableDays;
    let parsedAvailableTimeSlots = availableTimeSlots;

    if (typeof skills === 'string') {
      try { parsedSkills = JSON.parse(skills); } catch (e) { parsedSkills = []; }
    }
    if (typeof certifications === 'string') {
      try { parsedCertifications = JSON.parse(certifications); } catch (e) { parsedCertifications = []; }
    }
    if (typeof availableDays === 'string') {
      try { parsedAvailableDays = JSON.parse(availableDays); } catch (e) { parsedAvailableDays = []; }
    }
    if (typeof availableTimeSlots === 'string') {
      try { parsedAvailableTimeSlots = JSON.parse(availableTimeSlots); } catch (e) { parsedAvailableTimeSlots = []; }
    }

    // Get user email from the database
    const user = await User.findByPk(userId, { transaction: t });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create employee profile
    const employee = await Employee.create({
      userId,
      firstName,
      middleName,
      lastName,
      email: user.email, // Use email from user table
      age,
      address,
      state,
      pinCode,
      city,
      mobileNumber,
      nationality,
      workExperience,
      workType,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      bio,
      skills: parsedSkills,
      certifications: parsedCertifications,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : true,
      availableDays: parsedAvailableDays,
      availableTimeSlots: parsedAvailableTimeSlots,
      applicationStatus: 'pending',
      rating: 0.00,
      totalReviews: 0,
      isVerified: false,
      isBackgroundChecked: false,
      // Store file paths if files were uploaded
      profilePic: req.files?.profilePic ? req.files.profilePic[0].path : null,
      certificate: req.files?.certificate ? req.files.certificate[0].path : null,
      aadharCard: req.files?.aadharCard ? req.files.aadharCard[0].path : null,
      panCard: req.files?.panCard ? req.files.panCard[0].path : null,
      idCard: req.files?.idCard ? req.files.idCard[0].path : null
    }, { transaction: t });

    // Create payment record (non-fatal if payments table missing)
    const registrationFee = 500; // ₹500 registration fee
    let payment = null;
    try {
      payment = await Payment.create({
        userId,
        employeeId: employee.id,
        paymentType: 'registration_fee',
        amount: registrationFee,
        paymentMethod: paymentMethod || 'razorpay',
        paymentStatus: transactionId ? 'completed' : 'pending',
        transactionId,
        description: 'Worker registration fee',
        paidAt: transactionId ? new Date() : null
      }, { transaction: t });
    } catch (paymentError) {
      console.warn('Payment record creation failed, proceeding without blocking profile completion:', paymentError.message);
    }

    await t.commit();

    // Send notification to admins
    notificationService.notifyWorkerApplicationSubmitted(
      employee.id, 
      `${firstName} ${lastName}`
    );

    res.status(201).json({
      message: 'Profile completed successfully. Awaiting admin verification.',
      employeeId: employee.id,
      applicationStatus: employee.applicationStatus,
      paymentId: payment ? payment.id : null,
      registrationFee: registrationFee
    });

  } catch (error) {
    await t.rollback();
    console.error('Complete profile error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error completing profile', 
      error: error.message,
      details: error.stack
    });
  }
};

// Legacy endpoint - kept for backward compatibility
exports.addEmployee = async (req, res) => {
  const t = await sequelize.transaction(); // For atomicity
  try {
    const {
      firstName, middleName, lastName,
      age, address, state, pinCode, city,
      mobileNumber, nationality, workExperience,
      workType, email, password, hourlyRate,
      bio, skills, certifications, isAvailable,
      availableDays, availableTimeSlots
    } = req.body;
    console.log("Received body:", req.body);
    console.log("Uploaded files:", req.files);

    // ✅ Create User first
    const newUser = await User.create({
      name: `${firstName} ${middleName || ''} ${lastName}`,
      email,
      password,
      phone: mobileNumber,
      role: 'employee'
    }, { transaction: t });

    // Parse JSON fields if they're strings
    let parsedSkills = skills;
    let parsedCertifications = certifications;
    let parsedAvailableDays = availableDays;
    let parsedAvailableTimeSlots = availableTimeSlots;

    if (typeof skills === 'string') {
      try { parsedSkills = JSON.parse(skills); } catch (e) { parsedSkills = []; }
    }
    if (typeof certifications === 'string') {
      try { parsedCertifications = JSON.parse(certifications); } catch (e) { parsedCertifications = []; }
    }
    if (typeof availableDays === 'string') {
      try { parsedAvailableDays = JSON.parse(availableDays); } catch (e) { parsedAvailableDays = []; }
    }
    if (typeof availableTimeSlots === 'string') {
      try { parsedAvailableTimeSlots = JSON.parse(availableTimeSlots); } catch (e) { parsedAvailableTimeSlots = []; }
    }

    // ✅ Create Employee WITH userId directly and file paths
    const employee = await Employee.create({
      userId: newUser.id,
      firstName,
      middleName,
      lastName,
      email,
      age,
      address,
      state,
      pinCode,
      city,
      mobileNumber,
      nationality,
      workExperience,
      workType,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      bio,
      skills: parsedSkills,
      certifications: parsedCertifications,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : true,
      availableDays: parsedAvailableDays,
      availableTimeSlots: parsedAvailableTimeSlots,
      applicationStatus: 'pending',
      rating: 0.00,
      totalReviews: 0,
      isVerified: false,
      isBackgroundChecked: false,
      // Store file paths if files were uploaded
      profilePic: req.files?.profilePic ? req.files.profilePic[0].path : null,
      certificate: req.files?.certificate ? req.files.certificate[0].path : null,
      aadharCard: req.files?.aadharCard ? req.files.aadharCard[0].path : null,
      panCard: req.files?.panCard ? req.files.panCard[0].path : null,
      idCard: req.files?.idCard ? req.files.idCard[0].path : null
    }, { transaction: t });

    // ✅ Commit transaction
    await t.commit();

    // ✅ Generate JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful. Awaiting admin verification.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      employeeId: employee.id,
      applicationStatus: employee.applicationStatus
    });

  } catch (error) {
    await t.rollback();
    console.error(error);
    
    // Handle specific database errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      if (error.fields && error.fields.email) {
        return res.status(409).json({ message: 'Email already exists. Please use a different email address.' });
      }
    }
    
    res.status(500).json({ message: 'Error during registration', error: error.message });
  }
};


  
 // Employee Login
exports.loginEmployee = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user || user.role !== 'Employee') {
        return res.status(404).json({ message: 'User not found or not an employee' });
      }
  
      // Check password
      if (password !== user.password) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Get associated employee to check application status
      // Limit attributes to avoid selecting columns that may not exist yet in the DB schema
      const employee = await Employee.findOne({ 
        where: { userId: user.id },
        attributes: ['id', 'userId', 'applicationStatus']
      });
      if (!employee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
  
      // ✅ Instead of blocking login, include applicationStatus in the response:
      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          applicationStatus: employee.applicationStatus // include status for frontend usage
        }
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error during login', error: error.message });
    }
  };
  

exports.getEmployeeByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const employee = await Employee.findOne({ where: { userId } });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching employee', error });
    }
};
// Get all employees (Only HR/Admin)
exports.getAllEmployee = async (req, res) => {
  try {
      console.log("User from token:", req.user);

      if (!req.user || (!req.user.role || (req.user.role !== 'Admin' && req.user.role !== 'User'))) {
          return res.status(403).json({ message: 'Access denied' });
      }

      const employees = await Employee.findAll();
      res.json(employees);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching employees', error });
  }
};



// Update employee details (Only HR/Admin)
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { position, department, salary, joiningDate } = req.body;

        // ✅ Validate and format the joiningDate
        let formattedDate = null;
        if (joiningDate) {
            const dateObj = new Date(joiningDate);
            if (!isNaN(dateObj.getTime())) {
                formattedDate = dateObj.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
            } else {
                return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
            }
        }

        // ✅ Update employee
        const updatedEmployee = await Employee.update(
            {
                position,
                department,
                salary,
                joiningDate: formattedDate
            },
            { where: { id } }
        );

        if (updatedEmployee[0] === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.status(200).json({ message: "Employee updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating employee", error });
    }
};


// Delete an employee (Only Admin)
exports.deleteEmployee = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const employee = await Employee.findByPk(req.params.id);
        if (!employee) return res.status(404).json({ message: 'Employee not found' });

        await employee.destroy();
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting employee', error });
    }
};

// Get employee application status by userId (for employee self-check)
exports.getEmployeeStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const employee = await Employee.findOne({ where: { userId } });
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ applicationStatus: employee.applicationStatus });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching application status', error });
    }
};

// Admin: verify (accept/reject) employee application
exports.verifyEmployee = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { id } = req.params; // employee id
        const { status } = req.body; // 'accepted' or 'rejected'
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const employee = await Employee.findByPk(id);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        employee.applicationStatus = status;
        await employee.save();
        res.json({ message: `Employee application ${status}`, employee });
    } catch (error) {
        res.status(500).json({ message: 'Error updating application status', error });
    }
};

exports.updateOwnProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { userId: req.user.id } });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Only allow updating certain fields
    const updatableFields = [
      'firstName', 'middleName', 'lastName', 'age', 'address', 'state', 'pinCode',
      'mobileNumber', 'hourlyWage', 'assignedArea', 'workingHours'
    ];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) employee[field] = req.body[field];
    });

    await employee.save();
    res.json({ message: 'Profile updated', employee });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

exports.updateProfilePic = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { userId: req.user.id } });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    employee.profilePic = req.file.path;
    await employee.save();

    res.json({ message: 'Profile picture updated', profilePic: employee.profilePic });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile picture', error: error.message });
  }
};

exports.getEmployeeStatus = async (req, res) => {
    try {
        const userId = req.user.id; // from JWT token
        const employee = await Employee.findOne({ where: { userId } });
        if (!employee) {
            return res.status(404).json({ 
                message: 'No application found',
                hasApplication: false,
                applicationStatus: 'not_found'
            });
        }
        res.json({ 
            applicationStatus: employee.applicationStatus,
            hasApplication: true,
            employeeId: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            workType: employee.workType,
            createdAt: employee.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching application status', error });
    }
};

// Get all pending worker applications (Admin / HR only)
exports.getAllPendingWorkerApplications = async (req, res) => {
  try {
    console.log("User from token:", req.user);

    // Allow only Admin
    if (!req.user || (req.user.role || '').toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const User = require('../models/user.model');

    const pendingEmployees = await Employee.findAll({
      where: { applicationStatus: "pending" },
      attributes: [
        "id", 
        "firstName", 
        "middleName",
        "lastName", 
        "age",
        "address",
        "state",
        "pinCode",
        "mobileNumber", 
        "nationality",
        "workExperience",
        "applicationStatus", 
        "userId",
        "certificate",
        "aadharCard",
        "panCard",
        "profilePic",
        "createdAt",
        "updatedAt"
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email', 'name', 'role'],
          required: true
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    // Transform the data to include all details
    const transformedData = pendingEmployees.map(employee => ({
      id: employee.id,
      firstName: employee.firstName,
      middleName: employee.middleName,
      lastName: employee.lastName,
      fullName: `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
      age: employee.age,
      address: employee.address,
      state: employee.state,
      pinCode: employee.pinCode,
      email: employee.user ? employee.user.email : null,
      phone: employee.mobileNumber,
      nationality: employee.nationality,
      workExperience: employee.workExperience,
      applicationStatus: employee.applicationStatus,
      certificate: employee.certificate,
      aadharCard: employee.aadharCard,
      panCard: employee.panCard,
      profilePic: employee.profilePic,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      userRole: employee.user ? employee.user.role : null
    }));

    res.json(transformedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching pending worker applications",
      error: error.message
    });
  }
};

// Get public worker data (no authentication required)
exports.getPublicWorkers = async (req, res) => {
  try {
    const User = require('../models/user.model');
    
    // Get only accepted workers for public display
    const publicWorkers = await Employee.findAll({
      where: { applicationStatus: "accepted" },
      attributes: [
        "id", 
        "firstName", 
        "middleName",
        "lastName", 
        "age",
        "address",
        "state",
        "pinCode",
        "mobileNumber", 
        "nationality",
        "workExperience",
        "workType",
        "hourlyRate",
        "bio",
        "isAvailable",
        "rating",
        "totalReviews",
        "isVerified",
        "isBackgroundChecked",
        "applicationStatus", 
        "profilePic",
        "createdAt",
        "updatedAt"
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email'],
          required: true
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    // Transform the data for public display
    const transformedData = publicWorkers.map(employee => ({
      id: employee.id,
      firstName: employee.firstName,
      middleName: employee.middleName,
      lastName: employee.lastName,
      fullName: `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
      age: employee.age,
      address: employee.address,
      state: employee.state,
      pinCode: employee.pinCode,
      mobileNumber: employee.mobileNumber,
      nationality: employee.nationality,
      workExperience: employee.workExperience,
      workType: employee.workType,
      hourlyRate: employee.hourlyRate,
      bio: employee.bio,
      isAvailable: employee.isAvailable,
      rating: employee.rating || 0,
      totalReviews: employee.totalReviews || 0,
      isVerified: employee.isVerified,
      isBackgroundChecked: employee.isBackgroundChecked,
      applicationStatus: employee.applicationStatus,
      profilePic: employee.profilePic,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt
    }));

    res.json(transformedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching public worker data",
      error: error.message
    });
  }
};

// Search workers with filters (public endpoint)
exports.searchWorkers = async (req, res) => {
  try {
    const { workType, state, city, minRating, isAvailable, minHourlyRate, maxHourlyRate } = req.query;
    
    const whereClause = { applicationStatus: 'accepted' };
    
    if (workType) whereClause.workType = workType;
    if (state) whereClause.state = state;
    if (city) whereClause.city = city;
    if (isAvailable !== undefined) whereClause.isAvailable = isAvailable === 'true';
    if (minRating) whereClause.rating = { [sequelize.Op.gte]: parseFloat(minRating) };
    if (minHourlyRate) whereClause.hourlyRate = { [sequelize.Op.gte]: parseFloat(minHourlyRate) };
    if (maxHourlyRate) {
      whereClause.hourlyRate = { 
        ...whereClause.hourlyRate,
        [sequelize.Op.lte]: parseFloat(maxHourlyRate) 
      };
    }

    const workers = await Employee.findAll({
      where: whereClause,
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'mobileNumber', 'age',
        'address', 'state', 'city', 'pinCode', 'nationality', 'workType',
        'workExperience', 'hourlyRate', 'bio', 'skills', 'certifications',
        'isAvailable', 'rating', 'totalReviews', 'isVerified', 'isBackgroundChecked',
        'profilePic', 'createdAt'
      ],
      order: [['rating', 'DESC'], ['totalReviews', 'DESC']]
    });

    res.json(workers);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error searching workers",
      error: error.message
    });
  }
};

// Get worker profile by ID (public endpoint)
exports.getWorkerProfile = async (req, res) => {
  try {
    const { workerId } = req.params;
    
    const worker = await Employee.findOne({
      where: { 
        id: workerId, 
        applicationStatus: 'accepted' 
      },
      attributes: [
        'id', 'firstName', 'lastName', 'email', 'mobileNumber', 'age',
        'address', 'state', 'city', 'pinCode', 'nationality', 'workType',
        'workExperience', 'hourlyRate', 'bio', 'skills', 'certifications',
        'isAvailable', 'rating', 'totalReviews', 'isVerified', 'isBackgroundChecked',
        'profilePic', 'createdAt'
      ]
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching worker profile",
      error: error.message
    });
  }
};

// Update worker availability (authenticated)
exports.updateAvailability = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { userId: req.user.id } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { availableDays, availableTimeSlots, isAvailable } = req.body;

    // Parse JSON fields if they're strings
    let parsedAvailableDays = availableDays;
    let parsedAvailableTimeSlots = availableTimeSlots;

    if (typeof availableDays === 'string') {
      try { parsedAvailableDays = JSON.parse(availableDays); } catch (e) { parsedAvailableDays = []; }
    }
    if (typeof availableTimeSlots === 'string') {
      try { parsedAvailableTimeSlots = JSON.parse(availableTimeSlots); } catch (e) { parsedAvailableTimeSlots = []; }
    }

    await employee.update({
      availableDays: parsedAvailableDays,
      availableTimeSlots: parsedAvailableTimeSlots,
      isAvailable: isAvailable !== undefined ? isAvailable : employee.isAvailable
    });

    res.json({ message: 'Availability updated successfully', employee });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error updating availability",
      error: error.message
    });
  }
};

// Get worker reviews (public endpoint)
exports.getWorkerReviews = async (req, res) => {
  try {
    const { workerId } = req.params;
    
    // Check if worker exists and is accepted
    const worker = await Employee.findOne({
      where: { id: workerId, applicationStatus: 'accepted' },
      attributes: ['id']
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // For now, return empty array since we haven't implemented the reviews table yet
    // TODO: Implement when worker_reviews table is connected
    res.json([]);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching worker reviews",
      error: error.message
    });
  }
};

// Get all pending worker applications (Admin only)
exports.getAllPendingWorkerApplications = async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await Employee.findAll({
      where: { applicationStatus: 'pending' },
      attributes: [
        'id', 'userId', 'firstName', 'middleName', 'lastName', 'email', 'mobileNumber', 'age',
        'address', 'state', 'city', 'pinCode', 'nationality', 'workType', 'workExperience',
        'hourlyRate', 'bio', 'skills', 'certifications', 'isAvailable', 'availableDays',
        'availableTimeSlots', 'profilePic', 'certificate', 'aadharCard', 'panCard', 'idCard',
        'applicationStatus', 'rating', 'totalReviews', 'isVerified', 'isBackgroundChecked',
        'createdAt'
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format applications with payment info
    const formattedApplications = applications.map(app => ({
      id: app.id,
      userId: app.userId,
      firstName: app.firstName,
      middleName: app.middleName,
      lastName: app.lastName,
      email: app.email,
      mobileNumber: app.mobileNumber,
      age: app.age,
      address: app.address,
      state: app.state,
      city: app.city,
      pinCode: app.pinCode,
      nationality: app.nationality,
      workType: app.workType,
      workExperience: app.workExperience,
      hourlyRate: app.hourlyRate,
      applicationStatus: app.applicationStatus,
      createdAt: app.createdAt,
      profilePic: app.profilePic,
      certificate: app.certificate,
      aadharCard: app.aadharCard,
      panCard: app.panCard,
      idCard: app.idCard,
      bio: app.bio,
      skills: app.skills || [],
      certifications: app.certifications || [],
      isAvailable: app.isAvailable,
      availableDays: app.availableDays || [],
      availableTimeSlots: app.availableTimeSlots || [],
      rating: app.rating,
      totalReviews: app.totalReviews,
      isVerified: app.isVerified,
      isBackgroundChecked: app.isBackgroundChecked,
      user: app.user ? { id: app.user.id, name: app.user.name, email: app.user.email } : undefined,
      paymentStatus: 'completed',
      paymentAmount: 500
    }));

    res.json(formattedApplications);
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    res.status(500).json({ message: 'Error fetching applications', error: error.message });
  }
};

// Approve worker application (Admin only)
exports.approveWorkerApplication = async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await employee.update({
      applicationStatus: 'accepted',
      isVerified: true,
      isBackgroundChecked: true
    });

    // Send notification to worker
    notificationService.notifyApplicationApproved(
      employee.userId,
      `${employee.firstName} ${employee.lastName}`
    );

    res.json({ 
      message: 'Application approved successfully',
      applicationStatus: 'accepted'
    });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ message: 'Error approving application', error: error.message });
  }
};

// Reject worker application (Admin only)
exports.rejectWorkerApplication = async (req, res) => {
  try {
    if ((req.user.role || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { reason } = req.body;
    
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await employee.update({
      applicationStatus: 'rejected'
    });

    // Send notification to worker
    notificationService.notifyApplicationRejected(
      employee.userId,
      `${employee.firstName} ${employee.lastName}`,
      reason || 'No reason provided'
    );

    res.json({ 
      message: 'Application rejected successfully',
      applicationStatus: 'rejected'
    });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ message: 'Error rejecting application', error: error.message });
  }
};
