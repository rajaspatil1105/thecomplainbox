# SSCRMS v2.0 - Startup Guide

## 📋 Current Status

✅ **Completed:**
- Backend dependencies installed (npm install done)
- Frontend dependencies installed (npm install done)
- `.env` configuration file created
- Database seeding script ready
- All controllers and routes implemented

⏳ **Next Steps:**
- Start Docker Desktop (if using Docker)
- Start databases (MySQL, MongoDB, Redis)
- Run database seeding script
- Start backend API server
- Start frontend application

---

## 🚀 Quick Start (Choose One Approach)

### **Approach 1: Using Docker (Recommended)**

#### Step 1: Start Docker Desktop
1. Open Windows Start Menu
2. Search for **"Docker Desktop"**
3. Click to launch Docker Desktop
4. Wait 30-60 seconds for Docker daemon to start
5. You should see Docker icon in system tray (bottom right)

#### Step 2: Verify Docker is Running
```powershell
docker ps
```
You should see an empty list of containers (no errors).

#### Step 3: Start Databases
```powershell
cd c:\Users\patil\OneDrive\Desktop\thecomplainbox
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- **MySQL** on port 3306
- **MongoDB** on port 27017
- **Redis** on port 6379

Wait 10-15 seconds for containers to be ready.

#### Step 4: Seed Database
```powershell
cd backend
npm run seed
```

#### Step 5: Start Backend API
```powershell
cd backend
npm run dev
```
Backend will be available at: **http://localhost:4000**

#### Step 6: Start Frontend (New Terminal)
```powershell
cd c:\Users\patil\OneDrive\Desktop\thecomplainbox\frontend
npm start
```
Frontend will be available at: **http://localhost:3000**

---

### **Approach 2: Local Setup (Install Services Locally)**

If you don't have Docker, install these services locally:

#### MySQL 8.0
- Download: https://dev.mysql.com/downloads/mysql/
- Install with default settings
- Set root password to: `root_secure_password_123`
- Create database: `sscrms_db`
- Import schema: Run `database/schema.sql`

#### MongoDB 7.0
- Download: https://www.mongodb.com/try/download/community
- Install default
- Server runs on port 27017 automatically

#### Redis 7
- Download: https://github.com/microsoftarchive/redis/releases
- Install default
- Server runs on port 6379 automatically

Then follow Steps 4-6 from Approach 1.

---

## 🔗 Access Points

Once everything is running:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Student/Admin UI |
| Backend API | http://localhost:4000/api/health | API Health Check |
| AI Service | http://localhost:8000/ai/health | Gemini AI Service |
| MySQL | localhost:3306 | Database |
| MongoDB | localhost:27017 | Document Store |
| Redis | localhost:6379 | Cache/Sessions |

---

## 📝 Test Credentials (After Seeding)

```
Email: admin@test.edu
Password: Test@1234
Role: Admin
```

Other test accounts created:
- 10 students (student.1@test.edu - student.10@test.edu)
- 5 committee heads
- 10 committee members

---

## 🐛 Troubleshooting

### Backend won't start: "ConnectionRefusedError"
→ Ensure MySQL, MongoDB, Redis are running
→ Check `.env` file has correct connection strings

### Docker Desktop won't start
→ Open System Preferences → General → Advanced
→ Enable "Use Virtualization Framework"
→ Restart computer if necessary

### Port already in use (e.g., port 3000)
→ Change `BACKEND_PORT` or `FRONTEND_PORT` in `.env`
→ Or kill process: `netstat -ano | findstr :3000` then `taskkill /PID <PID>`

### MongoDB connection error
→ Run: `docker-compose -f docker-compose.dev.yml logs mongodb`
→ Or manually start MongoDB service locally

### Seed script fails
→ Ensure databases are running and accessible
→ Check MySQL connection credentials in `.env`

---

## 📚 Important Files

- `.env` - Configuration (edit GEMINI_API_KEY for real AI)
- `backend/server.js` - Backend entry point
- `frontend/src/App.js` - Frontend entry point
- `database/schema.sql` - MySQL schema
- `database/mongodb-init.js` - MongoDB setup
- `CRITICAL_IMPLEMENTATION.md` - Critical build rules

---

## ✅ Checklist Before Starting

- [ ] Docker Desktop launched (or services installed locally)
- [ ] Node.js v18+ available (`node --version`)
- [ ] npm available (`npm --version`)
- [ ] `.env` file exists in project root
- [ ] Both backend and frontend `node_modules` exist

---

## 🚀 Commands Cheat Sheet

```powershell
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Seed database
npm run seed

# Start backend (development mode with auto-reload)
npm run dev

# Start frontend (development mode with hot reload)
npm start

# View Docker logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all Docker services
docker-compose -f docker-compose.dev.yml down

# Remove Docker volumes (reset data)
docker-compose -f docker-compose.dev.yml down -v
```

---

## 📖 Next Steps After Startup

1. **Login** with credentials above
2. **Seed data** shows 20 test complaints
3. **Dashboard** shows complaints filtered by role
4. **Submit** new complaint (requires min 30 char description)
5. **Track** anonymous complaints with token
6. **Escalate** complaints that breach SLA (simulated, add GEMINI_API_KEY for real AI)

---

**Need help?** Check `README.md` for full documentation.
**Having issues?** Review `CRITICAL_IMPLEMENTATION.md` for implementation details.

Good luck! 🎉
