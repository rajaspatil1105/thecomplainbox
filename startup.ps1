#!/usr/bin/env pwsh
# SSCRMS v2.0 Startup Script
# Automates project startup with Docker and npm

$projectRoot = "c:\Users\patil\OneDrive\Desktop\thecomplainbox"
$backendDir = "$projectRoot\backend"
$frontendDir = "$projectRoot\frontend"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SSCRMS v2.0 - Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        $output = docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

# Step 1: Check Docker
Write-Host "[1/5] Checking Docker..." -ForegroundColor Yellow
$dockerRunning = Test-DockerRunning
if (-not $dockerRunning) {
    Write-Host "Docker daemon not running. Starting Docker Desktop..." -ForegroundColor Yellow
    try {
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        Write-Host "Waiting for Docker to start... (60 seconds)" -ForegroundColor Gray
        
        # Wait for Docker daemon
        $attempts = 0
        while (-not (Test-DockerRunning) -and $attempts -lt 30) {
            Start-Sleep -Seconds 2
            $attempts++
            Write-Host -NoNewline "."
        }
        
        if (Test-DockerRunning) {
            Write-Host " Docker started" -ForegroundColor Green
        } else {
            Write-Host " Docker not ready. Please start Docker Desktop manually." -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "Failed to start Docker Desktop" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Docker is running" -ForegroundColor Green
}

# Step 2: Start Databases
Write-Host ""
Write-Host "[2/5] Starting databases (MySQL, MongoDB, Redis)..." -ForegroundColor Yellow
Set-Location $projectRoot
$result = docker-compose -f docker-compose.dev.yml up -d 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Databases started" -ForegroundColor Green
    Write-Host "   Waiting for services to be ready..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
} else {
    Write-Host "Failed to start databases" -ForegroundColor Red
    Write-Host $result
    exit 1
}

# Step 3: Seed Database
Write-Host ""
Write-Host "[3/5] Seeding database with test data..." -ForegroundColor Yellow
Set-Location $backendDir
$result = npm run seed 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database seeded" -ForegroundColor Green
} else {
    Write-Host "Database seeding had issues (might already be seeded)" -ForegroundColor Yellow
}

# Step 4: Start Backend
Write-Host ""
Write-Host "[4/5] Starting Backend API (port 4000)..." -ForegroundColor Yellow
Write-Host "   Running: npm run dev" -ForegroundColor Gray
Set-Location $backendDir
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; npm run dev" -PassThru | Out-Null
Write-Host "Backend starting in new window..." -ForegroundColor Green

# Step 5: Start Frontend
Write-Host ""
Write-Host "[5/5] Starting Frontend (port 3000)..." -ForegroundColor Yellow
Write-Host "   Running: npm start" -ForegroundColor Gray
Set-Location $frontendDir
Start-Sleep -Seconds 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm start" -PassThru | Out-Null
Write-Host "Frontend starting in new window..." -ForegroundColor Green

# Final message
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SSCRMS v2.0 is starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:4000/api/health" -ForegroundColor White
Write-Host "   AI Service: http://localhost:8000/ai/health" -ForegroundColor White

Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Cyan
Write-Host "   Email:    admin@test.edu" -ForegroundColor White
Write-Host "   Password: Test@1234" -ForegroundColor White

Write-Host ""
Write-Host "The application should open automatically in your browser..." -ForegroundColor Yellow
Write-Host "If not, open http://localhost:3000 manually" -ForegroundColor Yellow

Write-Host ""
Write-Host "For details, see STARTUP_GUIDE.md" -ForegroundColor Cyan
Write-Host "For troubleshooting, see README.md" -ForegroundColor Cyan
Write-Host ""
