const axios = require('axios');

async function testAPIs() {
  try {
    // First, login to get a token
    console.log('🔐 Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful! Token:', token.substring(0, 50) + '...');
    
    // Test 1: Get all customers
    console.log('\n👥 Testing /api/users (Customers)...');
    try {
      const customersRes = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Customers API Response:', {
        status: customersRes.status,
        dataType: Array.isArray(customersRes.data) ? 'Array' : typeof customersRes.data,
        dataLength: Array.isArray(customersRes.data) ? customersRes.data.length : 'N/A',
        sampleData: Array.isArray(customersRes.data) ? customersRes.data.slice(0, 2) : customersRes.data
      });
    } catch (error) {
      console.error('❌ Customers API Error:', error.response?.status, error.response?.data);
    }
    
    // Test 2: Get all workers
    console.log('\n👷 Testing /api/employee (Workers)...');
    try {
      const workersRes = await axios.get('http://localhost:5000/api/employee', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Workers API Response:', {
        status: workersRes.status,
        dataType: Array.isArray(workersRes.data) ? 'Array' : typeof workersRes.data,
        dataLength: Array.isArray(workersRes.data) ? workersRes.data.length : 'N/A',
        sampleData: Array.isArray(workersRes.data) ? workersRes.data.slice(0, 2) : workersRes.data
      });
    } catch (error) {
      console.error('❌ Workers API Error:', error.response?.status, error.response?.data);
    }
    
    // Test 3: Get all employees
    console.log('\n👔 Testing /api/employees (Employees)...');
    try {
      const employeesRes = await axios.get('http://localhost:5000/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Employees API Response:', {
        status: employeesRes.status,
        dataType: Array.isArray(employeesRes.data) ? 'Array' : typeof employeesRes.data,
        dataLength: Array.isArray(employeesRes.data) ? employeesRes.data.length : 'N/A',
        sampleData: Array.isArray(employeesRes.data) ? employeesRes.data.slice(0, 2) : employeesRes.data
      });
    } catch (error) {
      console.error('❌ Employees API Error:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAPIs(); 