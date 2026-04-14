# 🚀 The Complain Box - Quick Start Guide

## Problem
Frontend is running but backend is not connected, causing "Connection error" on login.

## Solution Overview
You need to start the backend API server which will connect to your databases (MySQL, MongoDB, Redis).

---

## Option 1: Quick Start (Recommended if databases are already running locally)

### Windows PowerShell:
```powershell
# Run this in PowerShell:
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
& "c:\Users\patil\OneDrive\Desktop\thecomplainbox\START_DEVELOPMENT.ps1"
```

This will:
- ✅ Check if databases are accessible
- ✅ Seed test users (optional)
- ✅ Start backend on port 4000 (new terminal)
- ✅ Start frontend on port 3000 (new terminal)

---

## Option 2: Manual Setup (If you prefer step-by-step)

### Prerequisites
You need these running on your machine:
- **MySQL Server** on `localhost:3306`
- **MongoDB** on `localhost:27017`
- **Redis** on `localhost:6379`

### Step 1: Seed Database (first time only)
```powershell
cd c:\Users\patil\OneDrive\Desktop\thecomplainbox\backend
npm run seed
```

You'll see:
```
🌱 Seeding users...
✓ Seeded... users
✓ Seeded... complaints
✓ Seeded... committees
```

### Step 2: Start Backend (separate terminal)
```powershell
cd c:\Users\patil\OneDrive\Desktop\thecomplainbox\backend
npm start
```

You'll see:
```
✓ MySQL connected successfully
✓ MongoDB connected successfully
✓ Backend API running on port 4000
```

### Step 3: Start Frontend (separate terminal)
```powershell
cd c:\Users\patil\OneDrive\Desktop\thecomplainbox\frontend
npm start
```

Frontend opens at: **http://localhost:3000**

---

## Option 3: Docker Setup (If you don't have databases installed)

### Prerequisites
- Docker Desktop installed and running

### Start everything:
```powershell
cd c:\Users\patil\OneDrive\Desktop\thecomplainbox

# Start databases with Docker
docker-compose -f docker-compose.dev.yml up -d

# Wait 10 seconds for databases to be ready
Start-Sleep -Seconds 10

# Seed database
cd backend
npm run seed

# Start backend
npm start
```

In another terminal:
```powershell
cd c:\Users\patil\OneDrive\Desktop\thecomplainbox\frontend
npm start
```

---

## Test Login After Starting Backend

### Test User:
- **Email:** student.1@test.edu
- **Password:** Test@1234

### Other test accounts:
- **Admin:** admin@test.edu / Test@1234
- **Principal:** principal@test.edu / Test@1234
- **Committee Head:** head.security@test.edu / Test@1234

All passwords: `Test@1234`

---

## Troubleshooting

### "Connection error" on login?
→ Backend server is not running. Follow Option 1 or 2 above.

### MySQL connection error?
→ Install MySQL or use Docker:
```powershell
docker-compose -f docker-compose.dev.yml up -d mysql
```

### MongoDB connection error?
→ Install MongoDB or use Docker:
```powershell
docker-compose -f docker-compose.dev.yml up -d mongodb
```

### Redis connection error?
→ Install Redis or use Docker:
```powershell
docker-compose -f docker-compose.dev.yml up -d redis
```

### "Port 4000 already in use"?
→ Kill the process using port 4000:
```powershell
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### "Port 3000 already in use"?
→ Kill the process using port 3000:
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Infrastructure Status

### Current Status:
- ✅ Frontend: Running on http://localhost:3000
- ❌ Backend: NOT running on http://localhost:4000
- ❓ Databases: Check with Option 1 script

### To fix:
1. Run **Option 1** (automatic) or **Option 2** (manual)
2. Both backend and frontend will run in separate terminals
3. Frontend will auto-connect to backend
4. Login will work!

---

## Next Steps

After login works:
1. ✅ Test student dashboard
2. ✅ Submit a complaint
3. ✅ Try admin panel
4. ✅ Test all features

Happy complaining! 🎉
