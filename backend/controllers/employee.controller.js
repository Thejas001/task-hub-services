const { User} = require('../models');
const Employee = require('../models/employee.model');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/db');


exports.addEmployee = async (req, res) => {
  const t = await sequelize.transaction(); // For atomicity
  try {
    const {
      firstName, middleName, lastName,
      age, address, state, pinCode,
      mobileNumber, nationality, workExperience,
      workType, email, password
    } = req.body;
    console.log("Received body:", req.body);
    console.log("Uploaded files:", req.files);

    // ✅ Create User first
    const newUser = await User.create({
      name: `${firstName} ${middleName || ''} ${lastName}`,
      email,
      password,
      phone: mobileNumber,
      role: 'Employee'
    }, { transaction: t });

    // ✅ Create Employee WITH userId directly and file paths
    const employee = await Employee.create({
      userId: newUser.id,
      firstName,
      middleName,
      lastName,
      age,
      address,
      state,
      pinCode,
      mobileNumber,
      nationality,
      workExperience,
      workType, // Add workType to employee creation
      applicationStatus: 'pending',
      // Store file paths if files were uploaded
      certificate: req.files?.certificate ? req.files.certificate[0].path : null,
      aadharCard: req.files?.aadharCard ? req.files.aadharCard[0].path : null,
      panCard: req.files?.panCard ? req.files.panCard[0].path : null
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
      const employee = await Employee.findOne({ where: { userId: user.id } });
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
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json({ applicationStatus: employee.applicationStatus });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching application status', error });
    }
};

// Get all pending worker applications (Admin / HR only)
exports.getAllPendingWorkerApplications = async (req, res) => {
  try {
    console.log("User from token:", req.user);

    // Allow only Admin
    if (!req.user || req.user.role !== "Admin") {
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
