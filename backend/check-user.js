const { User, Employee } = require('./models');

async function checkUser() {
  try {
    const userId = 14; // The user ID from the token
    
    console.log('Checking user:', userId);
    
    const user = await User.findByPk(userId);
    console.log('User found:', user ? user.email : 'Not found');
    
    const employee = await Employee.findOne({ where: { userId } });
    console.log('Employee found:', employee ? employee.id : 'Not found');
    
    if (employee) {
      console.log('Employee details:', {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        applicationStatus: employee.applicationStatus
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  process.exit(0);
}

checkUser();
