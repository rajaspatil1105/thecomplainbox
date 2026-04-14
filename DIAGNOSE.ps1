#!/usr/bin/env pwsh
# The Complain Box - Diagnostic Script
# Identifies connection issues and shows what's running

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  The Complain Box - Diagnostics       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check Frontend
Write-Host "[1/6] Checking Frontend (port 3000)..." -ForegroundColor Yellow
$frontend = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue
if ($frontend.TcpTestSucceeded) {
    Write-Host "✅ Frontend is running on http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend is NOT running on port 3000" -ForegroundColor Red
}

# Check Backend
Write-Host ""
Write-Host "[2/6] Checking Backend (port 4000)..." -ForegroundColor Yellow
$backend = Test-NetConnection -ComputerName localhost -Port 4000 -WarningAction SilentlyContinue
if ($backend.TcpTestSucceeded) {
    Write-Host "✅ Backend is running on http://localhost:4000" -ForegroundColor Green
    
    # Test Health Endpoint
    Write-Host ""
    Write-Host "[3/6] Testing Backend Health Endpoint..." -ForegroundColor Yellow
    try {
        $healthResponse = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Backend API is responding" -ForegroundColor Green
        Write-Host "   Response: $($healthResponse.Content)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Backend API is not responding properly" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Backend is NOT running on port 4000" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 To start the backend, run:" -ForegroundColor Cyan
    Write-Host "   cd c:\Users\patil\OneDrive\Desktop\thecomplainbox\backend" -ForegroundColor White
    Write-Host "   npm start" -ForegroundColor White
}

# Check MySQL
Write-Host ""
Write-Host "[4/6] Checking MySQL (port 3306)..." -ForegroundColor Yellow
$mysql = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue
if ($mysql.TcpTestSucceeded) {
    Write-Host "✅ MySQL is accessible on localhost:3306" -ForegroundColor Green
} else {
    Write-Host "❌ MySQL is NOT accessible on localhost:3306" -ForegroundColor Red
    Write-Host "   Start MySQL with: docker-compose -f docker-compose.dev.yml up -d mysql" -ForegroundColor Yellow
}

# Check MongoDB
Write-Host ""
Write-Host "[5/6] Checking MongoDB (port 27017)..." -ForegroundColor Yellow
$mongodb = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
if ($mongodb.TcpTestSucceeded) {
    Write-Host "✅ MongoDB is accessible on localhost:27017" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB is NOT accessible on localhost:27017" -ForegroundColor Red
    Write-Host "   Start MongoDB with: docker-compose -f docker-compose.dev.yml up -d mongodb" -ForegroundColor Yellow
}

# Check Redis
Write-Host ""
Write-Host "[6/6] Checking Redis (port 6379)..." -ForegroundColor Yellow
$redis = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
if ($redis.TcpTestSucceeded) {
    Write-Host "✅ Redis is accessible on localhost:6379" -ForegroundColor Green
} else {
    Write-Host "❌ Redis is NOT accessible on localhost:6379" -ForegroundColor Red
    Write-Host "   Start Redis with: docker-compose -f docker-compose.dev.yml up -d redis" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  What You Need To Do                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

if ($backend.TcpTestSucceeded) {
    Write-Host "✅ Backend is running! Login should work now." -ForegroundColor Green
} else {
    Write-Host "❌ Backend is NOT running. This is why login fails." -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTION:" -ForegroundColor Yellow
    Write-Host "1. Open a new PowerShell terminal" -ForegroundColor White
    Write-Host "2. Run this command:" -ForegroundColor White
    Write-Host ""
    Write-Host "   cd c:\Users\patil\OneDrive\Desktop\thecomplainbox\backend" -ForegroundColor Cyan
    Write-Host "   npm start" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "3. Wait for 'Backend API running on port 4000' message" -ForegroundColor White
    Write-Host "4. Go back to browser and refresh http://localhost:3000" -ForegroundColor White
    Write-Host "5. Try logging in again" -ForegroundColor White
}

Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Cyan
Write-Host "   Email: student.1@test.edu" -ForegroundColor White
Write-Host "   Password: Test@1234" -ForegroundColor White
Write-Host ""
