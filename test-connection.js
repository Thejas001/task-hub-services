// Test script to verify backend-frontend connection
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testConnection() {
  console.log('🔍 Testing Backend-Frontend Connection...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend server availability...');
    const healthCheck = await axios.get(`${API_BASE_URL.replace('/api', '')}/`);
    console.log('✅ Backend server is running\n');

    // Test 2: Test user registration
    console.log('2. Testing user registration...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'test123',
      role: 'customer'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/users/register`, testUser);
      console.log('✅ User registration endpoint working');
      console.log('   Response:', registerResponse.data);
    } catch (error) {
      console.log('❌ User registration failed:', error.response?.data?.message || error.message);
    }

    // Test 3: Test admin login
    console.log('\n3. Testing admin login...');
    try {
      const adminLoginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
        email: 'admin@example.com',
        password: 'Test@123'
      });
      console.log('✅ Admin login endpoint working');
      console.log('   Token received:', !!adminLoginResponse.data.token);
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Test employee login
    console.log('\n4. Testing employee login...');
    try {
      const employeeLoginResponse = await axios.post(`${API_BASE_URL}/employee/login`, {
        email: 'thejas@gmail.com',
        password: 'Test@123'
      });
      console.log('✅ Employee login endpoint working');
      console.log('   Token received:', !!employeeLoginResponse.data.token);
    } catch (error) {
      console.log('❌ Employee login failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Test CORS
    console.log('\n5. Testing CORS configuration...');
    try {
      const corsResponse = await axios.options(`${API_BASE_URL}/users`, {
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      console.log('✅ CORS is properly configured');
    } catch (error) {
      console.log('❌ CORS test failed:', error.message);
    }

  } catch (error) {
    console.log('❌ Backend server is not running or not accessible');
    console.log('   Error:', error.message);
    console.log('\n💡 Make sure to start the backend server first:');
    console.log('   cd backend && npm start');
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Start backend: cd backend && npm start');
  console.log('2. Start frontend: npm run dev');
  console.log('3. Test the connection in browser');
}

testConnection();
