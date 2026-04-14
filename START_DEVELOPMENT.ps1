#!/usr/bin/env pwsh
# The Complain Box Development Startup Script
# Quick local development setup (no Docker required)

$projectRoot = "c:\Users\patil\OneDrive\Desktop\thecomplainbox"
$backendDir = "$projectRoot\backend"
$frontendDir = "$projectRoot\frontend"

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  The Complain Box v2.0 - Dev Startup  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if databases are accessible
Write-Host "[1/3] Checking database connections..." -ForegroundColor Yellow

# MySQL Check
Write-Host "  ► MySQL (localhost:3306)..." -NoNewline -ForegroundColor Gray
$mysqlCheck = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue
if ($mysqlCheck.TcpTestSucceeded) {
    Write-Host " ✅ Connected" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Not accessible (install MySQL or use Docker)" -ForegroundColor Yellow
}

# MongoDB Check
Write-Host "  ► MongoDB (localhost:27017)..." -NoNewline -ForegroundColor Gray
$mongoCheck = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
if ($mongoCheck.TcpTestSucceeded) {
    Write-Host " ✅ Connected" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Not accessible (install MongoDB or use Docker)" -ForegroundColor Yellow
}

# Redis Check
Write-Host "  ► Redis (localhost:6379)..." -NoNewline -ForegroundColor Gray
$redisCheck = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue
if ($redisCheck.TcpTestSucceeded) {
    Write-Host " ✅ Connected" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Not accessible (install Redis or use Docker)" -ForegroundColor Yellow
}

Write-Host ""

# Seed Database (optional)
$seedChoice = Read-Host "[2/3] Do you want to seed the database with test users? (y/n)"
if ($seedChoice -eq 'y' -or $seedChoice -eq 'Y') {
    Write-Host "Seeding database..." -ForegroundColor Yellow
    Set-Location $backendDir
    & npm run seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Seeding had issues (database may already exist)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[3/3] Starting application..." -ForegroundColor Yellow
Write-Host ""

# Start Backend Server
Write-Host "Opening Backend Terminal (port 4000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; Write-Host 'Starting Backend API Server...'; Write-Host ''; npm start" -PassThru | Out-Null

Write-Host "⏳ Waiting 3 seconds before starting frontend..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Opening Frontend Terminal (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; Write-Host 'Starting Frontend Development Server...'; Write-Host ''; npm start" -PassThru | Out-Null

Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     ✅ Application Starting!           ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Frontend will open in browser at:" -ForegroundColor Cyan
Write-Host "   🌐 http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "Backend API available at:" -ForegroundColor Cyan
Write-Host "   🔌 http://localhost:4000/api" -ForegroundColor White
Write-Host ""

Write-Host "Test Credentials:" -ForegroundColor Cyan
Write-Host "   👤 Email:    student.1@test.edu" -ForegroundColor White
Write-Host "   🔐 Password: Test@1234" -ForegroundColor White
Write-Host ""

Write-Host "Note: Both terminal windows will stay open. Close them to stop the servers." -ForegroundColor Gray
Write-Host ""
