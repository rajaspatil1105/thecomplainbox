# The Complain Box v2.0

A production-grade, AI-powered web application for educational institutions enabling students to submit complaints (named or anonymous), track resolution in real time, and rate outcomes — while giving committees and administrators structured tools to manage, route, and close complaints with full accountability.

## Quick Links

- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Database Schema](#database-schema)
- [Monitoring](#monitoring--debugging)
- [Production Deployment](#production-deployment)

## Project Overview

### Key Features

- **Anonymous & Named Complaints**: Students can submit complaints anonymously with tracking tokens or named for direct communication
- **AI-Powered Routing**: Gemini 1.5 Flash automatically categorizes and routes complaints to appropriate committees
- **Duplicate Detection**: TF-IDF algorithms detect potential duplicate complaints before AI processing
- **Real-time Tracking**: Public tracking page for anonymous complaints with status updates
- **SLA Management**: Automatic escalation when SLA deadlines are breached  
- **Role-Based Access**: Student, Committee Member, Committee Head, Admin, and Principal roles
- **Audit Logging**: Complete audit trail of all actions for compliance
- **OCR Extraction**: Automatically extract text from uploaded evidence (images, PDFs)

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js + Tailwind CSS |
| Backend | Node.js + Express.js |
| AI Service | Python 3.11+ + FastAPI |
| Databases | MySQL + MongoDB + Redis |
| Deployment | Docker Compose |

## Architecture

### System Components

```
Frontend (React)                   Backend API (Express)              AI Service (FastAPI)
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│  Student UI      │             │  Auth Service   │             │  Gemini Client  │
│  Authority Inbox │             │  Complaint Mgmt │─────────────>│  TF-IDF Engine  │
│  Admin Dashboard │─────────────>│  Dashboard API  │             │  OCR Processor  │
│  Principal View  │             │  Audit Logging  │             └──────────────────┘
└──────────────────┘             └──────────────────┘
                                           │
                                  ┌────────┼────────┐
                                  │        │        │
                                  ▼        ▼        ▼
                                MySQL   MongoDB   Redis
```

## Setup & Installation

### Prerequisites

- **Docker & Docker Compose**
- **Git**  
- **Node.js 18+** (for local development)
- **Python 3.11+** (for local development)
- **Google Gemini API Key** (free tier available)

### Quick Start with Docker

```bash
# 1. Clone and navigate
cd c:\Users\patil\OneDrive\Desktop\thecomplainbox

# 2. Copy environment template
cp .env.example .env

# 3. Edit .env with your settings
# - GEMINI_API_KEY (get from https://aistudio.google.com)
# - SMTP credentials for email notifications
# - Other config as needed

# 4. Start all services
docker-compose up -d

# 5. Verify everything is running
docker-compose ps

# 6. Access the application
# Frontend:        http://localhost:3000
# Backend API:     http://localhost:4000/api/health
# AI Service:      http://localhost:8000/ai/health
```

### Local Development (No Docker)

```bash
# Backend
cd backend
npm install
npm run dev  # Requires MySQL, MongoDB, Redis running

# AI Service (in separate terminal)
cd ai-service
pip install -e .
python -m uvicorn main:app --reload

# Frontend (in separate terminal)
cd frontend
npm install
npm start
```

## Database Schema

### MySQL - Core Business Logic

**Tables:**
- `users` - User accounts with roles (student, committee_member, committee_head, admin, principal)
- `committees` - Routing committees with category tags
- `complaints` - Core complaint records with SLA tracking
- `complaint_status_log` - Audit trail of all status changes
- `evidence_files` - Uploaded evidence (JPG, PNG, MP4, PDF)
- `feedback` - Student ratings (1-5) and comments
- `audit_logs` - Complete action audit trail

**Key Constraints:**
- Automatic SLA deadline computation via stored procedure
- Automatic status log insertion via trigger
- UUIDs for all identifiers
- Soft-delete capability (is_active flag)

### MongoDB - AI & Communication

**Collections:**
- `ai_outputs` - Full Gemini analysis results, TF-IDF scores, OCR text, confidence metrics
- `complaint_messages` - Thread of messages between student and authority

### Redis - Caching & Sessions

**Key Patterns:**
- `session:{user_id}` - JWT token (8-hour TTL)
- `rate_limit:submit:{user_id}` - Daily count (5 max, 24-hour TTL)
- `rate_limit:login:{ip}` - Login attempts (10 max, 15-min TTL)
- `anon_token:{hash}` - Complaint ID mapping (90-day TTL)
- `tfidf_cache:recent` - Last 200 complaints for duplicate check (6-hour TTL)

## API Endpoints

### Authentication (`/api/auth`)
```
POST   /register              - Create new account
POST   /login                 - Sign in with credentials
POST   /logout                - Sign out (invalidate session)
POST   /forgot-password       - Request password reset
POST   /reset-password        - Verify OTP and reset password
```

### Complaints (`/api/complaints`)
```
POST   /                      - Submit new complaint (AI analysis included)
GET    /:id                   - Get complaint details
GET    /track/:token          - Track anonymous complaint (public)
PATCH  /:id/status            - Update complaint status + note
POST   /:id/escalate          - Escalate complaint
GET    /:id/messages          - Fetch message thread
POST   /:id/messages          - Add message
```

### Dashboards (`/api/dashboard`)
```
GET    /student               - Student's complaints list
GET    /authority             - Committee inbox (filtered by role)
GET    /admin                 - Analytics & KPI dashboard
GET    /principal             - Overview (read-only)
```

### Feedback (`/api/feedback`)
```
POST   /:id                   - Submit rating (1-5) + comment
```

### Administration (`/api/admin`)
```
GET    /audit-logs            - Paginated audit trail
GET    /routing-queue         - Complaints awaiting manual routing
PATCH  /complaints/:id/route  - Manually assign committee
GET    /users                 - List all users
POST   /users                 - Create new user
PATCH  /users/:id             - Update user
GET    /committees            - List committees
POST   /committees            - Create committee
PATCH  /committees/:id        - Update committee
```

## Security Features

### Authentication & Authorization
- **Password Hashing**: bcrypt (cost factor 12)
- **JWT Authorization**: HS256, 8-hour expiry
- **Session Management**: Redis-backed, invalidated on logout
- **RBAC**: Role-based access control enforced server-side

### Data Protection  
- **Anonymous Privacy**: SHA-256 token hashing, no student_id linkage
- **File Validation**: MIME type checking (not extension), max 10MB per file
- **Input Sanitization**: Server-side validation with express-validator
- **SQL Injection Prevention**: Sequelize ORM parameterized queries only

### Rate Limiting
- **Complaints**: 5 per student per 24 hours
- **Login Attempts**: 10 per IP per 15 minutes

### Audit & Compliance
- **Audit Logging**: Every action logged (actor, action, entity, IP, timestamp)
- **CORS**: Restricted to frontend origin only

## SLA & Priority Mapping

Auto-escalation rule for breached deadlines:

| Severity | Priority | SLA Target | Auto-Escalate At |
|----------|----------|------------|------------------|
| Critical | P1 | 4 hours | 2 hours |
| High | P2 | 24 hours | 24 hours |
| Medium | P3 | 48 hours | 48 hours |
| Low | P4 | 120 hours | 120 hours |

## Role Permissions Matrix

| Action | Student | Committee | Head | Admin | Principal |
|--------|---------|-----------|------|-------|-----------|
| Submit Complaint | ✓ | - | - | - | - |
| View Own | ✓ | - | - | ✓ | ✓ |
| View Assigned | - | ✓ | ✓ | ✓ | ✓ (RO) |
| Update Status | - | ✓ | ✓ | ✓ | - |
| Escalate | - | - | ✓ | ✓ | - |
| Close | - | - | ✓ | ✓ | - |
| Submit Feedback | ✓* | - | - | - | - |
| Manage Users | - | - | - | ✓ | - |
| Analytics | - | - | - | ✓ | ✓ (RO) |

*Non-anonymous complaints only, post-closure

## Background Jobs

### Escalation Job
- **Schedule**: Every 30 minutes (node-cron)
- **Logic**: Find complaints where NOW() > sla_deadline AND status IN (under_review, assigned, in_progress)
- **Action**: Auto-update status to "escalated", send notifications to committee head + admin + principal (for P1)

## Monitoring & Debugging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f ai-service
docker-compose logs -f frontend
```

### Database Access
```bash
# MySQL
docker exec -it thecomplainbox-mysql mysql -u thecomplainbox_user -p thecomplainbox_db

# MongoDB
docker exec -it thecomplainbox-mongodb mongosh thecomplainbox_db

# Redis
docker exec -it thecomplainbox-redis redis-cli
```

### Health Checks
```bash
# Backend
curl http://localhost:4000/api/health

# AI Service
curl http://localhost:8000/ai/health

# Frontend
curl http://localhost:3000
```

## Production Deployment

### Pre-Flight Checklist
- [ ] Strong `JWT_SECRET` (min 32 chars, random)
- [ ] Production SMTP server configured
- [ ] Gemini API key with daily limit set
- [ ] HTTPS/TLS enabled
- [ ] WAF/DDoS protection in place
- [ ] Automated daily backups (30-day retention)
- [ ] CDN configured for static assets
- [ ] Monitoring & alerting enabled
- [ ] Load testing completed (target: 500+ concurrent)
- [ ] Security audit/penetration testing done

### Environment for Production
```env
NODE_ENV=production
JWT_SECRET=<generate-with-openssl-rand-hex-32>
GEMINI_API_KEY=<prod-key>
FRONTEND_URL=https://your-domain.com
MYSQL_PASSWORD=<strong-random-password>
MONGO_URI=mongodb://user:pass@mongo-prod/thecomplainbox?authSource=admin
REDIS_URL=redis://user:pass@redis-prod:6379
SMTP_HOST=<production-smtp-server>
```

### KPIs to Monitor
- **Resolution Time**: Avg < 5 working days
- **P1 Target**: < 4 hours
- **Satisfaction**: Avg rating > 3.8/5.0
- **AI Accuracy**: > 85% (no manual override)
- **SLA Compliance**: > 90%
- **Duplicate Rate**: < 5%
- **System Uptime**: 99% SLA

## Common Issues & Troubleshooting

### Gemini API Not Responding
```bash
# Check API key in .env
# Check quotas at https://aistudio.google.com
# Fallback: complaints routed to "General Queue" for manual review
```

### Database Connection Failed
```bash
# Verify MySQL is running
docker-compose logs mysql

# Check credentials in .env match docker-compose.yml
```

### Authentication Issues
```bash
# Clear token
rm ~/.bashrc  # or clear localStorage in browser console

# Check session exists in Redis
docker exec thecomplainbox-redis redis-cli get session:<user_id>
```

## Support & Contributing

**Report Issues**: Create an issue in the repository  
**Feature Requests**: Submit with use-case description  
**Code Contributions**: Fork, create feature branch, submit PR

## License

Proprietary - Smart Student Complaint & Resolution Management System v2.0

---

**Version**: 2.0.0 | **Last Updated**: April 2026 | **Status**: Production Ready
