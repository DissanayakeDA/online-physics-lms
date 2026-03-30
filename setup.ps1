# =========================================================
# OnlinePHYSICS LMS - Setup Script (PowerShell)
# =========================================================

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   OnlinePHYSICS LMS - Environment Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Create backend .env file
Write-Host "[1/3] Creating backend environment file..." -ForegroundColor Yellow
$backendEnv = @"
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=lms-super-secret-key-change-in-production
ADMIN_EMAIL=admin@lms.com
ADMIN_PASSWORD=Admin@123
FRONTEND_URL=http://localhost:3000
PORT=3001
"@
$backendEnv | Out-File -FilePath "apps\backend\.env" -Encoding UTF8
Write-Host "   -> Created apps/backend/.env" -ForegroundColor Green

# Create frontend .env.local file
Write-Host "[2/3] Creating frontend environment file..." -ForegroundColor Yellow
$frontendEnv = @"
NEXT_PUBLIC_API_URL=http://localhost:3001/api
"@
$frontendEnv | Out-File -FilePath "apps\frontend\.env.local" -Encoding UTF8
Write-Host "   -> Created apps/frontend/.env.local" -ForegroundColor Green

# Create uploads directory
Write-Host "[3/3] Creating uploads directory..." -ForegroundColor Yellow
if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" | Out-Null
}
Write-Host "   -> Created uploads/" -ForegroundColor Green

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Make sure MongoDB is running!" -ForegroundColor Red
Write-Host ""
Write-Host "To start MongoDB (if installed locally):" -ForegroundColor White
Write-Host "  mongod --dbpath C:\data\db" -ForegroundColor Gray
Write-Host ""
Write-Host "Or use MongoDB Atlas (cloud):" -ForegroundColor White
Write-Host "  Update MONGODB_URI in apps/backend/.env" -ForegroundColor Gray
Write-Host ""
Write-Host "To start the application:" -ForegroundColor White
Write-Host "  Terminal 1: npx nx serve backend" -ForegroundColor Gray
Write-Host "  Terminal 2: cd apps/frontend && npx next dev --webpack" -ForegroundColor Gray
Write-Host ""
Write-Host "URLs:" -ForegroundColor White
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Gray
Write-Host "  Backend:   http://localhost:3001/api" -ForegroundColor Gray
Write-Host ""
Write-Host "Default Admin Credentials:" -ForegroundColor White
Write-Host "  Email:    admin@lms.com" -ForegroundColor Gray
Write-Host "  Password: Admin@123" -ForegroundColor Gray
Write-Host ""
