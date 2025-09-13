const { User } = require('./models');
const sequelize = require('./config/db');

async function fixAdminPassword() {
  try {
    console.log('Starting to fix admin password...');
    
    // Find the admin user (Thejas)
    const adminUser = await User.findOne({ 
      where: { 
        email: 'thejas@gmail.com',
        role: 'Employee' // Based on the image, this user has role "Employee"
      } 
    });

    if (!adminUser) {
      console.log('Admin user not found. Creating one...');
      
      const newAdminUser = await User.create({
        name: 'Thejas',
        email: 'thejas@gmail.com',
        password: 'Test@123',
        phone: '1234567890',
        role: 'Employee'
      });
      
      console.log('Created admin user with plain text password');
    } else {
      console.log('Found existing admin user. Updating password...');
      
      // Update the password to plain text
      await adminUser.update({ password: 'Test@123' });
      
      console.log('Updated admin user password to plain text');
    }

    console.log('Admin password fix completed successfully!');
  } catch (error) {
    console.error('Error fixing admin password:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
fixAdminPassword(); 