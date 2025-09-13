@echo off
echo Running Employee Table Migration...
echo.

REM Replace these with your actual MySQL credentials
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=your_password_here
set DB_NAME=task_hub_services

echo Connecting to MySQL database...
echo Database: %DB_NAME%
echo User: %DB_USER%
echo.

REM Run the migration SQL file
mysql -h %DB_HOST% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < migrations/optimize_employee_table_fixed.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Migration completed successfully!
    echo The employee table has been optimized for the worker marketplace.
) else (
    echo.
    echo ❌ Migration failed. Please check your database credentials and try again.
)

pause
