const { User } = require('./models');

async function createAdminUser() {
  try {
    console.log('🔧 Starting admin user creation...');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ 
      where: { 
        email: 'admin@example.com',
        role: 'Admin'
      } 
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: Test@123');
      console.log('👤 Name:', existingAdmin.name);
      console.log('🆔 User ID:', existingAdmin.id);
      console.log('📅 Created:', existingAdmin.createdAt);
      return;
    }

    // Create admin user with existing credentials
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'Test@123', // Using existing admin credentials
      role: 'Admin',
      phoneNumber: '1234567890',
      address: 'Admin Address',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: Test@123');
    console.log('👤 Name:', adminUser.name);
    console.log('🆔 User ID:', adminUser.id);
    console.log('📅 Created:', adminUser.createdAt);
    console.log('⚠️  IMPORTANT: Please change the default password after first login!');
    console.log('🔒 For security, consider changing the email and password.');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    console.error('💡 Make sure your database is running and models are synced.');
  }
}

// Run the function
createAdminUser(); 