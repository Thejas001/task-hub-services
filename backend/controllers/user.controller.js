const jwt = require("jsonwebtoken");
const { User, Employee } = require("../models");
const Booking = require("../models/booking.model");
require("dotenv").config();

// Register a new customer user
exports.registerUser = async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await User.create({
      name: "Customer", // Default name
      email,
      password,
      phone: phone || "",
      role: "user", // Customer role
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
  );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("User Registration Error:", error);
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

// Register a new worker (basic registration - email/password only)
exports.registerWorker = async (req, res) => {
  try {
    console.log('🔵 Worker registration request received:', { email: req.body.email, hasPassword: !!req.body.password });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log('🟢 Creating new worker user...');
    const newUser = await User.create({
      name: "Worker", // Temporary name, will be updated in details form
      email,
      password,
      phone: "", // Will be updated in details form
      role: "employee", // Worker role
    });
    console.log('✅ User created successfully:', { id: newUser.id, email: newUser.email, role: newUser.role });

    console.log('🔑 Generating JWT token...');
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Longer expiry for registration process
    );
    console.log('✅ JWT token generated successfully');

    const response = {
      message: "Worker account created. Please complete your profile.",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        needsProfileCompletion: true
      },
    };
    console.log('📤 Sending response:', { message: response.message, hasToken: !!response.token, userId: response.user.id });
    res.status(201).json(response);
  } catch (error) {
    console.error("💥 Worker Registration Error:", error);
    console.error("💥 Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      message: "Error registering worker",
      error: error.message,
    });
  }
};


// Login user
// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (password !== user.password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Fetch application status if role is Employee
    let applicationStatus = null;
    if (user.role === "Employee") {
      const employee = await Employee.findOne({ where: { userId: user.id } });
      if (employee) {
        applicationStatus = employee.applicationStatus;
      }
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        applicationStatus, // null if not an employee
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};


// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Fetch user's bookings
    console.log('🔍 Looking for bookings with customer email:', user.email);
    const bookings = await Booking.findAll({
      where: { customerEmail: user.email },
      include: [{
        model: Employee,
        as: 'employee',
        attributes: ['firstName', 'lastName', 'hourlyRate', 'workType', 'mobileNumber']
      }],
      order: [['createdAt', 'DESC']]
    });
    console.log('📋 Found bookings:', bookings.length);
    
    // Debug: Check all bookings in database
    const allBookings = await Booking.findAll({ limit: 5 });
    console.log('🔍 All bookings in database:', allBookings.map(b => ({ id: b.id, customerEmail: b.customerEmail, status: b.status })));
    
    // Debug: Check all users in database
    const allUsers = await User.findAll({ limit: 5, attributes: ['id', 'email', 'role'] });
    console.log('👥 All users in database:', allUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));

    // Format bookings for frontend
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      workerName: booking.employee ? `${booking.employee.firstName} ${booking.employee.lastName}` : 'Unknown Worker',
      serviceType: booking.workDescription || 'General Work',
      workType: booking.employee?.workType || 'General',
      bookingDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
      address: booking.address,
      estimatedHours: booking.estimatedHours,
      status: booking.status,
      workerPhone: booking.employee?.mobileNumber || '',
      amount: booking.estimatedHours * (booking.employee?.hourlyRate || 500) // Use actual hourly rate or default to ₹500
    }));

    // Format the response to match frontend expectations
    const profileData = {
      id: user.id,
      firstName: user.name.split(' ')[0] || user.name,
      lastName: user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      phoneNumber: user.phone || '',
      address: '',
      city: '',
      state: '',
      createdAt: user.createdAt,
      bookings: formattedBookings
    };

    res.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Get user by ID (Admin only)
exports.getUserById = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

// Update user profile (User can update their own profile)
exports.updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, address, city, state } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Update user with new name (combine firstName and lastName)
    const fullName = `${firstName} ${lastName}`.trim();
    
    await user.update({ 
      name: fullName,
      phone: phoneNumber
    });

    // Format the response to match frontend expectations
    const profileData = {
      id: user.id,
      firstName: firstName,
      lastName: lastName,
      email: user.email,
      phoneNumber: phoneNumber,
      address: address,
      city: city,
      state: state,
      createdAt: user.createdAt,
      bookings: []
    };

    res.json({ message: "Profile updated successfully", profile: profileData });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email, role } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ name, email, role });

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findByPk(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};
