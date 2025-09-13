const { User } = require('./models');
const Employee = require('./models/employee.model');
const sequelize = require('./config/db');

const sampleEmployees = [
  {
    user: {
      name: "John Smith",
      email: "john.smith@company.com",
      password: "password123",
      phone: "9876543210",
      role: "Employee"
    },
    employee: {
      firstName: "John",
      middleName: "",
      lastName: "Smith",
      age: 28,
      address: "123 Main Street, Anna Nagar",
      state: "Tamil Nadu",
      pinCode: "600040",
      mobileNumber: "9876543210",
      nationality: "Indian",
      workExperience: "5 years in IT",
      position: "Software Developer",
      department: "Engineering",
      salary: 75000.00,
      joiningDate: "2023-01-15",
      shiftStartTime: "09:00:00",
      shiftEndTime: "18:00:00",
      applicationStatus: "accepted",
      certificate: "/uploads/certificate1.pdf",
      aadharCard: "/uploads/aadhar1.pdf",
      panCard: "/uploads/pan1.pdf"
    }
  },
  {
    user: {
      name: "Sarah Johnson",
      email: "sarah.johnson@company.com",
      password: "password123",
      phone: "9876543211",
      role: "Employee"
    },
    employee: {
      firstName: "Sarah",
      middleName: "Marie",
      lastName: "Johnson",
      age: 32,
      address: "456 Oak Avenue, T Nagar",
      state: "Tamil Nadu",
      pinCode: "600017",
      mobileNumber: "9876543211",
      nationality: "Indian",
      workExperience: "8 years in HR",
      position: "HR Manager",
      department: "Human Resources",
      salary: 85000.00,
      joiningDate: "2022-06-20",
      shiftStartTime: "08:30:00",
      shiftEndTime: "17:30:00",
      applicationStatus: "accepted",
      certificate: "/uploads/certificate2.pdf",
      aadharCard: "/uploads/aadhar2.pdf",
      panCard: "/uploads/pan2.pdf"
    }
  },
  {
    user: {
      name: "Michael Brown",
      email: "michael.brown@company.com",
      password: "password123",
      phone: "9876543212",
      role: "Employee"
    },
    employee: {
      firstName: "Michael",
      middleName: "",
      lastName: "Brown",
      age: 35,
      address: "789 Pine Road, Adyar",
      state: "Tamil Nadu",
      pinCode: "600020",
      mobileNumber: "9876543212",
      nationality: "Indian",
      workExperience: "12 years in Finance",
      position: "Finance Analyst",
      department: "Finance",
      salary: 65000.00,
      joiningDate: "2021-03-10",
      shiftStartTime: "09:00:00",
      shiftEndTime: "18:00:00",
      applicationStatus: "accepted",
      certificate: "/uploads/certificate3.pdf",
      aadharCard: "/uploads/aadhar3.pdf",
      panCard: "/uploads/pan3.pdf"
    }
  },
  {
    user: {
      name: "Emily Davis",
      email: "emily.davis@company.com",
      password: "password123",
      phone: "9876543213",
      role: "Employee"
    },
    employee: {
      firstName: "Emily",
      middleName: "Grace",
      lastName: "Davis",
      age: 26,
      address: "321 Elm Street, Mylapore",
      state: "Tamil Nadu",
      pinCode: "600004",
      mobileNumber: "9876543213",
      nationality: "Indian",
      workExperience: "3 years in Marketing",
      position: "Marketing Specialist",
      department: "Marketing",
      salary: 55000.00,
      joiningDate: "2023-08-05",
      shiftStartTime: "10:00:00",
      shiftEndTime: "19:00:00",
      applicationStatus: "accepted",
      certificate: "/uploads/certificate4.pdf",
      aadharCard: "/uploads/aadhar4.pdf",
      panCard: "/uploads/pan4.pdf"
    }
  },
  {
    user: {
      name: "David Wilson",
      email: "david.wilson@company.com",
      password: "password123",
      phone: "9876543214",
      role: "Employee"
    },
    employee: {
      firstName: "David",
      middleName: "",
      lastName: "Wilson",
      age: 30,
      address: "654 Maple Drive, Velachery",
      state: "Tamil Nadu",
      pinCode: "600042",
      mobileNumber: "9876543214",
      nationality: "Indian",
      workExperience: "6 years in Operations",
      position: "Operations Manager",
      department: "Operations",
      salary: 70000.00,
      joiningDate: "2022-11-15",
      shiftStartTime: "08:00:00",
      shiftEndTime: "17:00:00",
      applicationStatus: "accepted",
      certificate: "/uploads/certificate5.pdf",
      aadharCard: "/uploads/aadhar5.pdf",
      panCard: "/uploads/pan5.pdf"
    }
  }
];

async function populateEmployeeData() {
  try {
    console.log('Starting to populate employee data...');
    
    for (const sampleData of sampleEmployees) {
      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: sampleData.user.email } });
      if (existingUser) {
        console.log(`User ${sampleData.user.email} already exists, skipping...`);
        continue;
      }

      // Create user with plain text password
      const newUser = await User.create(sampleData.user);
      console.log(`Created user: ${newUser.email}`);

      // Create employee
      const employeeData = {
        ...sampleData.employee,
        userId: newUser.id
      };
      
      const newEmployee = await Employee.create(employeeData);
      console.log(`Created employee: ${newEmployee.firstName} ${newEmployee.lastName}`);
    }

    console.log('Employee data population completed successfully!');
  } catch (error) {
    console.error('Error populating employee data:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
// populateEmployeeData(); // Commented out to avoid populating dummy data 