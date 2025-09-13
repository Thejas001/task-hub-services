-- ==========================
-- HRMS DATABASE SCHEMA
-- ==========================

-- Users Table (Stores all system users - HR, Admins, Employees)
CREATE TABLE Users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('Admin', 'HR', 'Employee'),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments Table
CREATE TABLE Departments (
  department_id INT PRIMARY KEY AUTO_INCREMENT,
  department_name VARCHAR(255) UNIQUE,
  manager_id INT,
  FOREIGN KEY (manager_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- Employee Details Table
CREATE TABLE Employee_Details (
  employee_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE,
  department_id INT,
  position VARCHAR(255),
  salary DECIMAL(10,2),
  date_of_joining DATE,
  employment_type ENUM('Full-time', 'Part-time', 'Contract'),
  status ENUM('Active', 'Inactive'),
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES Departments(department_id) ON DELETE SET NULL
);

-- Payroll Table
CREATE TABLE Payroll (
  payroll_id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT,
  base_salary DECIMAL(10,2),
  bonuses DECIMAL(10,2),
  deductions DECIMAL(10,2),
  net_salary DECIMAL(10,2) GENERATED ALWAYS AS (base_salary + bonuses - deductions) STORED,
  payment_date DATE,
  FOREIGN KEY (employee_id) REFERENCES Employee_Details(employee_id) ON DELETE CASCADE
);

-- Leaves Table (Employee Leave Requests)
CREATE TABLE Leaves (
  leave_id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT,
  leave_type ENUM('Sick', 'Casual', 'Paid', 'Unpaid'),
  start_date DATE,
  end_date DATE,
  status ENUM('Pending', 'Approved', 'Rejected'),
  reason TEXT,
  FOREIGN KEY (employee_id) REFERENCES Employee_Details(employee_id) ON DELETE CASCADE
);

-- Performance Reviews Table
CREATE TABLE Performance_Reviews (
  review_id INT PRIMARY KEY AUTO_INCREMENT,
  employee_id INT,
  reviewer_id INT,
  review_date DATE,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comments TEXT,
  FOREIGN KEY (employee_id) REFERENCES Employee_Details(employee_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES Users(user_id) ON DELETE SET NULL
);

-- Recruitment Table (Job Applications Tracking)
CREATE TABLE Recruitment (
  application_id INT PRIMARY KEY AUTO_INCREMENT,
  job_role VARCHAR(255),
  candidate_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  resume_url VARCHAR(255),
  status ENUM('Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected'),
  applied_date DATE
);

-- Training Sessions Table
CREATE TABLE Training_Sessions (
  session_id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  trainer_name VARCHAR(255),
  department_id INT,
  session_date DATE,
  duration_hours INT,
  FOREIGN KEY (department_id) REFERENCES Departments(department_id) ON DELETE SET NULL
);

-- =======================================
-- EXISTING TABLES FROM YOUR ORIGINAL SCHEMA
-- =======================================

CREATE TABLE Hiring (
  phone VARCHAR(255) PRIMARY KEY,
  date VARCHAR(255),
  assignedTo VARCHAR(255),
  city VARCHAR(255),
  country VARCHAR(255),
  email VARCHAR(255),
  gender VARCHAR(255),
  interviewFeedback JSON,
  joiningInterest VARCHAR(255),
  lastUpdated VARCHAR(255),
  name VARCHAR(255),
  resumeurl VARCHAR(255),
  role VARCHAR(255),
  state VARCHAR(255),
  status VARCHAR(255)
);

CREATE TABLE Hiring_JD (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role VARCHAR(255) UNIQUE,
  createdAt VARCHAR(255),
  EmploymentType VARCHAR(255),
  JobOverview TEXT,
  NumberofVacancies VARCHAR(255),
  RolesAndResponsibilities TEXT,
  SkillsAndQualifications TEXT,
  Status VARCHAR(255),
  WhatWeOffer TEXT
);

CREATE TABLE Test_Questions (
  phone VARCHAR(255),
  date VARCHAR(255),
  level VARCHAR(255),
  name VARCHAR(255),
  numberOfQuestions INT,
  questions JSON,
  role VARCHAR(255),
  UserAnswers JSON,
  PRIMARY KEY (phone, date, name)
);

CREATE TABLE Support_tickets (
  ticket_id VARCHAR(255) PRIMARY KEY,
  client_name VARCHAR(255),
  assignedTo VARCHAR(255),
  comments JSON,
  createdAt VARCHAR(255),
  createdBy VARCHAR(255),
  description TEXT,
  status VARCHAR(255),
  subtitle VARCHAR(255),
  title VARCHAR(255)
);

CREATE TABLE Interns_task (
  task_id VARCHAR(255) PRIMARY KEY,
  createdAt VARCHAR(255),
  assignedTo VARCHAR(255),
  comments JSON,
  createdBy VARCHAR(255),
  createdUserEmail VARCHAR(255),
  description TEXT,
  duedate VARCHAR(255),
  priority VARCHAR(255),
  startdate VARCHAR(255),
  status VARCHAR(255),
  title VARCHAR(255)
);

CREATE TABLE EmployeeAttendance (
  employee_email VARCHAR(255) PRIMARY KEY,
  status VARCHAR(255),
  employee_name VARCHAR(255),
  timelogs JSON,
  shift_id VARCHAR(255)
);

CREATE TABLE Shifts (
  shift_id VARCHAR(255) PRIMARY KEY,
  shift_name VARCHAR(255),
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  breaks JSON
);

-- ==========================
-- FOREIGN KEY CONSTRAINTS
-- ==========================
ALTER TABLE Hiring ADD CONSTRAINT fk_hiring_role FOREIGN KEY (role) REFERENCES Hiring_JD(role);

ALTER TABLE Test_Questions ADD CONSTRAINT fk_test_questions_role FOREIGN KEY (role) REFERENCES Hiring_JD(role);
ALTER TABLE Test_Questions ADD CONSTRAINT fk_test_questions_phone FOREIGN KEY (phone) REFERENCES Hiring(phone);
ALTER TABLE Test_Questions ADD CONSTRAINT fk_test_questions_date FOREIGN KEY (date) REFERENCES Hiring(date);
ALTER TABLE Test_Questions ADD CONSTRAINT fk_test_questions_name FOREIGN KEY (name) REFERENCES Hiring(name);

ALTER TABLE EmployeeAttendance ADD CONSTRAINT fk_employee_attendance_shift FOREIGN KEY (shift_id) REFERENCES Shifts(shift_id);
