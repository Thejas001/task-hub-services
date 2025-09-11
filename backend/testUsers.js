const { User } = require('./models');

async function testUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    // Get all users
    const allUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    
    console.log(`✅ Found ${allUsers.length} users in database:`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id} | Name: ${user.name} | Email: ${user.email} | Role: ${user.role} | Created: ${user.createdAt}`);
    });
    
    // Check users by role
    const customers = await User.findAll({ where: { role: 'User' } });
    const admins = await User.findAll({ where: { role: 'Admin' } });
    const employees = await User.findAll({ where: { role: 'Employee' } });
    
    console.log('\n📊 Users by role:');
    console.log(`- Customers (User role): ${customers.length}`);
    console.log(`- Admins: ${admins.length}`);
    console.log(`- Employees: ${employees.length}`);
    
    if (customers.length === 0) {
      console.log('\n⚠️  No customers found! You may need to register some customers first.');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  }
}

// Run the test
testUsers(); 