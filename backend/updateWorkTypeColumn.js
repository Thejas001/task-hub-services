const sequelize = require('./config/db');
const Employee = require('./models/employee.model');

async function updateWorkTypeColumn() {
  try {
    console.log('Adding workType column to Employee table...');
    
    // Add workType column to existing table
    await sequelize.query(`
      ALTER TABLE Employees 
      ADD COLUMN workType VARCHAR(255) NULL
    `);
    
    console.log('✅ workType column added successfully!');
    
    // Update existing employees with default work types based on their work experience
    const employees = await Employee.findAll();
    
    for (const employee of employees) {
      // Extract work type from work experience or set a default
      let workType = 'Other';
      
      if (employee.workExperience) {
        const experience = employee.workExperience.toLowerCase();
        
        if (experience.includes('electric') || experience.includes('electrical')) {
          workType = 'Electrician';
        } else if (experience.includes('plumb') || experience.includes('pipe')) {
          workType = 'Plumber';
        } else if (experience.includes('paint') || experience.includes('painting')) {
          workType = 'Painter';
        } else if (experience.includes('carpent') || experience.includes('wood')) {
          workType = 'Carpenter';
        } else if (experience.includes('garden') || experience.includes('landscape')) {
          workType = 'Gardener';
        } else if (experience.includes('clean') || experience.includes('cleaning')) {
          workType = 'Cleaner';
        } else if (experience.includes('mason') || experience.includes('construction')) {
          workType = 'Mason';
        } else if (experience.includes('weld') || experience.includes('welding')) {
          workType = 'Welder';
        } else if (experience.includes('mechanic') || experience.includes('repair')) {
          workType = 'Mechanic';
        } else if (experience.includes('driver') || experience.includes('driving')) {
          workType = 'Driver';
        } else if (experience.includes('cook') || experience.includes('chef')) {
          workType = 'Cook';
        } else if (experience.includes('security') || experience.includes('guard')) {
          workType = 'Security Guard';
        }
      }
      
      await employee.update({ workType });
    }
    
    console.log(`✅ Updated ${employees.length} employees with work types`);
    console.log('Database update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await sequelize.close();
  }
}

updateWorkTypeColumn(); 