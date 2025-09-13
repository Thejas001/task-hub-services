const { User } = require('../models');
const Employee = require('../models/employee.model');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/db');

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user || user.role !== 'Admin') {
      return res.status(404).json({ message: 'Invalid email or password' });
    }

    // Use plain text comparison for password verification
    if (password !== user.password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ Store the token in the database
    user.token = token;
    await user.save();

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during admin login', error: error.message });
  }
};

// Create worker (Admin only)
exports.createWorker = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      firstName, middleName, lastName,
      email, password, mobileNumber, age,
      address, state, city, pinCode, nationality,
      workType, workExperience, hourlyRate, bio,
      skills, certifications, isAvailable,
      availableDays, availableTimeSlots
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create User first
    const newUser = await User.create({
      name: `${firstName} ${middleName || ''} ${lastName}`.trim(),
      email,
      password,
      phone: mobileNumber,
      role: 'Employee'
    }, { transaction: t });

    // Create Employee profile
    const employee = await Employee.create({
      userId: newUser.id,
      firstName,
      middleName,
      lastName,
      email,
      mobileNumber,
      age,
      address,
      state,
      pinCode,
      city,
      nationality,
      workType,
      workExperience,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      bio,
      skills: skills || [],
      certifications: certifications || [],
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      availableDays: availableDays || [],
      availableTimeSlots: availableTimeSlots || [],
      applicationStatus: 'accepted', // Admin-created workers are automatically accepted
      rating: 0.00,
      totalReviews: 0,
      isVerified: true,
      isBackgroundChecked: true,
      addedBy: req.user.id // Track which admin created this worker
    }, { transaction: t });

    await t.commit();

    res.status(201).json({
      message: 'Worker created successfully',
      worker: {
        id: employee.id,
        userId: newUser.id,
        name: `${firstName} ${lastName}`,
        email,
        workType,
        applicationStatus: 'accepted'
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Error creating worker:', error);
    res.status(500).json({ 
      message: 'Error creating worker', 
      error: error.message 
    });
  }
};
