const { User, Employee } = require('./models');

async function checkAllUsers() {
  try {
    console.log('=== Checking all users in User table ===');
    const users = await User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    console.log(`Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Name: ${user.name}, Created: ${user.createdAt}`);
    });
    
    console.log('\n=== Checking all employees in Employee table ===');
    const employees = await Employee.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    console.log(`Found ${employees.length} employees:`);
    employees.forEach(emp => {
      console.log(`- ID: ${emp.id}, UserID: ${emp.userId}, Name: ${emp.firstName} ${emp.lastName}, Status: ${emp.applicationStatus}, Created: ${emp.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkAllUsers();
