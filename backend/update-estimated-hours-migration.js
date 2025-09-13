const { DataTypes } = require('sequelize');
const sequelize = require('./config/db');

async function updateEstimatedHoursColumn() {
  try {
    console.log('🔄 Starting migration to update estimatedHours column...');
    
    // Check if the column exists and its current type
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, NUMERIC_PRECISION, NUMERIC_SCALE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Bookings' AND COLUMN_NAME = 'estimatedHours'
    `);
    
    if (results.length === 0) {
      console.log('❌ estimatedHours column not found in Bookings table');
      return;
    }
    
    const columnInfo = results[0];
    console.log('📋 Current column info:', columnInfo);
    
    // If it's already DECIMAL, no need to migrate
    if (columnInfo.DATA_TYPE === 'decimal') {
      console.log('✅ Column is already DECIMAL type, no migration needed');
      return;
    }
    
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Add new column
      console.log('➕ Adding new estimatedHours column...');
      await sequelize.query(`
        ALTER TABLE Bookings 
        ADD COLUMN estimatedHours_new DECIMAL(4,2) DEFAULT 1.0
      `, { transaction });
      
      // Copy data from old to new column
      console.log('📋 Copying data from old to new column...');
      await sequelize.query(`
        UPDATE Bookings 
        SET estimatedHours_new = CAST(estimatedHours AS DECIMAL(4,2))
      `, { transaction });
      
      // Drop old column
      console.log('🗑️ Dropping old column...');
      await sequelize.query(`
        ALTER TABLE Bookings DROP COLUMN estimatedHours
      `, { transaction });
      
      // Rename new column
      console.log('🏷️ Renaming new column...');
      await sequelize.query(`
        ALTER TABLE Bookings 
        CHANGE COLUMN estimatedHours_new estimatedHours DECIMAL(4,2) NOT NULL DEFAULT 1.0
      `, { transaction });
      
      // Commit transaction
      await transaction.commit();
      console.log('✅ Migration completed successfully!');
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  updateEstimatedHoursColumn()
    .then(() => {
      console.log('🎉 Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = updateEstimatedHoursColumn;
