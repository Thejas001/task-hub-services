const { User, Employee, Payment } = require('./models');

async function testCompleteFlow() {
  try {
    console.log('🧪 Testing complete worker registration flow...\n');
    
    // 1. Check if user exists
    const userId = 14;
    const user = await User.findByPk(userId);
    console.log('1. User check:', user ? `✅ User found: ${user.email}` : '❌ User not found');
    
    // 2. Check if employee profile exists
    const employee = await Employee.findOne({ where: { userId } });
    console.log('2. Employee profile check:', employee ? `✅ Profile exists: ${employee.firstName} ${employee.lastName}` : '❌ No profile found');
    
    // 3. Check payment records
    const payments = await Payment.findAll({ where: { userId } });
    console.log('3. Payment records:', payments.length > 0 ? `✅ ${payments.length} payment(s) found` : '❌ No payments found');
    
    if (payments.length > 0) {
      payments.forEach((payment, index) => {
        console.log(`   Payment ${index + 1}: ${payment.paymentType} - ${payment.paymentStatus} - ₹${payment.amount}`);
      });
    }
    
    // 4. Test application status
    if (employee) {
      console.log('4. Application status:', `✅ Status: ${employee.applicationStatus}`);
      console.log('   - Work Type:', employee.workType);
      console.log('   - Hourly Rate:', employee.hourlyRate);
      console.log('   - Created:', employee.createdAt);
    }
    
    console.log('\n🎉 Flow test completed!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
  
  process.exit(0);
}

testCompleteFlow();
