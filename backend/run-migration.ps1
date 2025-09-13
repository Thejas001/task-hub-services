# Employee Table Migration Script for PowerShell
Write-Host "Running Employee Table Migration..." -ForegroundColor Green
Write-Host ""

# Database configuration - UPDATE THESE WITH YOUR ACTUAL CREDENTIALS
$DB_HOST = "localhost"
$DB_USER = "root"
$DB_PASSWORD = "your_password_here"  # Replace with your actual password
$DB_NAME = "task_hub_services"

Write-Host "Connecting to MySQL database..." -ForegroundColor Yellow
Write-Host "Database: $DB_NAME" -ForegroundColor Cyan
Write-Host "User: $DB_USER" -ForegroundColor Cyan
Write-Host ""

# Check if MySQL is available
try {
    $mysqlPath = Get-Command mysql -ErrorAction Stop
    Write-Host "MySQL found at: $($mysqlPath.Source)" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL command not found. Please ensure MySQL is installed and in your PATH." -ForegroundColor Red
    Write-Host "You can also run the SQL commands manually in MySQL Workbench or phpMyAdmin." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Run the migration
Write-Host "Executing migration..." -ForegroundColor Yellow
$migrationFile = "migrations\optimize_employee_table_fixed.sql"

if (Test-Path $migrationFile) {
    try {
        & mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "source $migrationFile"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
            Write-Host "The employee table has been optimized for the worker marketplace." -ForegroundColor Green
            Write-Host ""
            Write-Host "New features added:" -ForegroundColor Cyan
            Write-Host "- Hourly rates and professional bio" -ForegroundColor White
            Write-Host "- Skills and certifications arrays" -ForegroundColor White
            Write-Host "- Availability management" -ForegroundColor White
            Write-Host "- Rating and review system" -ForegroundColor White
            Write-Host "- Worker portfolio support" -ForegroundColor White
            Write-Host "- Verification status tracking" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "❌ Migration failed. Please check your database credentials and try again." -ForegroundColor Red
        }
    } catch {
        Write-Host ""
        Write-Host "❌ Error running migration: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Migration file not found: $migrationFile" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"
