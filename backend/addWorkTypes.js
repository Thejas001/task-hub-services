const sequelize = require('./config/db');
const Employee = require('./models/employee.model');

async function addWorkTypes() {
  try {
    console.log('Adding work types to existing employees...');
    
    // Get all employees
    const employees = await Employee.findAll();
    console.log(`Found ${employees.length} employees`);
    
    // Sample work types to assign
    const workTypes = [
      'Electrician',
      'Plumber', 
      'Painter',
      'Carpenter',
      'Gardener',
      'Cleaner',
      'Mason',
      'Welder',
      'Mechanic',
      'Driver',
      'Cook',
      'Security Guard',
      'Other'
    ];
    
    // Assign work types based on work experience or randomly
    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      const workType = workTypes[i % workTypes.length]; // Distribute work types
      
      await employee.update({ workType });
      console.log(`Updated employee ${employee.firstName} ${employee.lastName} with work type: ${workType}`);
    }
    
    console.log('✅ All employees updated with work types!');
    
  } catch (error) {
    console.error('❌ Error updating employees:', error);
  } finally {
    await sequelize.close();
  }
}

addWorkTypes(); 