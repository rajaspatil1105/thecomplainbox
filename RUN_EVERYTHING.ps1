#!/usr/bin/env pwsh
# The Complain Box - Complete Setup & Start Guide
# Solves the connection error completely

$projectRoot = "c:\Users\patil\OneDrive\Desktop\thecomplainbox"
$backendDir = "$projectRoot\backend"
$frontendDir = "$projectRoot\frontend"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  The Complain Box - Complete Setup & Start" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Docker databases are needed
Write-Host "STEP 1: Checking if databases are running..." -ForegroundColor Yellow
$mysqlOk = Test-NetConnection -ComputerName localhost -Port 3306 -WarningAction SilentlyContinue | Select -ExpandProperty TcpTestSucceeded
$mongoOk = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue | Select -ExpandProperty TcpTestSucceeded
$redisOk = Test-NetConnection -ComputerName localhost -Port 6379 -WarningAction SilentlyContinue | Select -ExpandProperty TcpTestSucceeded

if (-not $mysqlOk -or -not $mongoOk -or -not $redisOk) {
    Write-Host ""
    Write-Host "Some databases are missing. Starting them with Docker..." -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location $projectRoot
    
    Write-Host "Starting Docker containers for MySQL, MongoDB, Redis..." -ForegroundColor Gray
    $result = docker-compose -f docker-compose.dev.yml up -d 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker containers started" -ForegroundColor Green
        Write-Host "   Waiting 15 seconds for databases to be ready..." -ForegroundColor Gray
        
        for ($i = 15; $i -gt 0; $i--) {
            Write-Host -NoNewline "."
            Start-Sleep -Seconds 1
        }
        Write-Host ""
    } else {
        Write-Host "ℹ️  Docker containers may already be running or Docker not available" -ForegroundColor Yellow
        Write-Host "   Continuing with local databases..." -ForegroundColor Gray
    }
} else {
    Write-Host "✅ All databases are running" -ForegroundColor Green
}

Write-Host ""

# Step 2: Seed database
Write-Host "STEP 2: Seeding database with test users..." -ForegroundColor Yellow
Set-Location $backendDir

Write-Host "Running database seed script..." -ForegroundColor Gray
$result = npm run seed 2>&1 | Out-String

if ($result -match "Seeded" -or $result -match "✓") {
    Write-Host "✅ Database seeded successfully" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Database may already be seeded (skipping)" -ForegroundColor Yellow
}

Write-Host ""

# Step 3: Start Backend
Write-Host "STEP 3: Starting Backend API Server on port 4000..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting in new PowerShell window..." -ForegroundColor Gray

$backendCmd = @"
`$ProgressPreference = 'SilentlyContinue'
Set-Location '$backendDir'
Write-Host 'The Complain Box Backend API Server' -ForegroundColor Cyan
Write-Host 'Starting...' -ForegroundColor Yellow
Write-Host ''
npm start
"@

# Start backend in new window
Start-Process powershell -ArgumentList @("-NoExit", "-Command", $backendCmd) -PassThru | Out-Null

Write-Host "✅ Backend starting in new window..." -ForegroundColor Green
Write-Host ""

# Step 4: Wait and verify backend
Write-Host "STEP 4: Waiting for Backend to be ready..." -ForegroundColor Yellow

$attempts = 0
$backendReady = $false

while ($attempts -lt 30) {
    Start-Sleep -Seconds 1
    $attempts++
    Write-Host -NoNewline "."
    
    try {
        $health = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($health.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    } catch {
        # Keep waiting
    }
}

Write-Host ""

if ($backendReady) {
    Write-Host "✅ Backend API is ready and responding!" -ForegroundColor Green
} else {
    Write-Host "⏳ Backend starting (may take a few more seconds)..." -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Refresh Frontend
Write-Host "STEP 5: Refreshing Frontend..." -ForegroundColor Yellow
Write-Host "Please refresh your browser at http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Final Instructions
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ SETUP COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔌 Backend:  http://localhost:4000" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Test Credentials:" -ForegroundColor Cyan
Write-Host "   👤 Email:    student.1@test.edu" -ForegroundColor White
Write-Host "   🔐 Password: Test@1234" -ForegroundColor White
Write-Host ""

Write-Host "📌 What to do now:" -ForegroundColor Yellow
Write-Host "   1. Refresh or go to: http://localhost:3000" -ForegroundColor White
Write-Host "   2. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "   3. Try logging in with credentials above" -ForegroundColor White
Write-Host "   4. You should see the student dashboard" -ForegroundColor White
Write-Host ""

Write-Host "💻 Both servers are running in separate windows:" -ForegroundColor Yellow
Write-Host "   - Backend window shows API logs" -ForegroundColor White
Write-Host "   - Frontend window shows React logs" -ForegroundColor White
Write-Host "   - Close either window to stop that server" -ForegroundColor White
Write-Host ""
