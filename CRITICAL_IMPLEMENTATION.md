# SSCRMS v2.0 - Critical Implementation Guide

## Critical Build Rules (NON-NEGOTIABLE)

### 1. Anonymous Complaint Privacy ⚠️ CRITICAL
```
RULE: NEVER store student_id linked to an anonymous complaint in ANY database, 
       MongoDB field, or log entry.

IMPLEMENTATION:
- Student submits anonymously → Generate UUID v4 token
- Compute SHA-256 hash of token
- Store ONLY hash in complaints.anon_token_hash (never raw token)
- Store mapping: anon_token:{hash} → complaint_id in Redis (90-day TTL)
- Return raw token ONCE in response to student
- Store token nowhere else - student must save it

ENFORCEMENT:
- CI/CD pipeline: Scan for student_id in anonymous complaints
- Code review: Verify every anonymous complaint flow
- Audit: Monthly check of audit_logs for leakage
```

### 2. TF-IDF Duplicate Check BEFORE Gemini ⚠️ CRITICAL
```
RULE: TF-IDF duplicate check MUST run BEFORE every Gemini API call.
      Never call Gemini without running TF-IDF first.

EXECUTION ORDER:
1. Student submits complaint
2. RUN TF-IDF check against last 200 complaints from Redis cache
3. IF similarity_score >= 0.78: Mark is_duplicate=true, SKIP Gemini call
4. ELSE: Proceed to Gemini API call for analysis
5. Store results in MongoDB REGARDLESS of duplicate status

BENEFITS:
- Saves Gemini API quota (1500 req/day limit)
- Reduces costs
- Faster processing for duplicates
- Maintains full audit trail

CODE LOCATION:
backend/services/complaintService.js → submitComplaint()
ai-service/main.py → /ai/analyze endpoint
```

### 3. SLA Deadline Server-Side Computation ⚠️ CRITICAL
```
RULE: SLA deadline MUST be computed server-side using stored procedure.
      Never trust client clock or compute on frontend.

MYSQL STORED PROCEDURE:
CALL compute_sla_deadline(:severity, NOW(), @deadline)

SEVERITY → SLA MAPPING:
- critical   → T + 4 hours
- high       → T + 24 hours
- medium     → T + 48 hours
- low        → T + 120 hours (5 working days approximate)

ESCALATION:
Background job runs every 30 minutes and checks:
SELECT * FROM complaints WHERE sla_deadline < NOW() AND status NOT IN ('closed', 'escalated')
→ Auto-escalate these complaints

WHY:
- Client clock may be wrong (timezone, skew)
- Consistent across all users
- Passed audit compliance
- Prevents manipulation
```

### 4. Status Change Logging (Trigger + Explicit) ⚠️ CRITICAL
```
RULE: Every status change MUST write a row to complaint_status_log.
      Use both trigger AND explicit code for safety.

MYSQL TRIGGER:
CREATE TRIGGER trg_status_log AFTER UPDATE ON complaints
FOR EACH ROW
IF OLD.status != NEW.status THEN
  INSERT INTO complaint_status_log (complaint_id, changed_by, old_status, new_status)
  VALUES (NEW.complaint_id, NEW.assigned_to, OLD.status, NEW.status)
END IF

EXPLICIT CODE (Backend service):
await ComplaintStatusLog.create({
  complaint_id, changed_by, old_status, new_status, note, changed_at
})

WHY BOTH:
- Trigger: Database-level enforcement
- Code: Application-level control, custom notes
- Redundancy: Ensures no status change slips through
- Audit: Complete history for compliance
```

### 5. Principal Role = ZERO Write Access ⚠️ CRITICAL
```
RULE: Principal role has ZERO write access.
      Not a single PATCH, POST, or DELETE endpoint accepts principal role.

EVERY ENDPOINT MUST VERIFY:
- Principal is explicitly excluded from mutations
- Principal only has GET access (read-only)
- Response filters for principal (no sensitive data)

VERIFY IN CODE:
@route.patch('/', requireRole(['admin', 'committee_head', 'committee_member']))
// NOT including 'principal'

DATABASE LEVEL:
Permissions enforce that principal can only SELECT, never UPDATE/DELETE

WHY:
- Principal is oversight, not executor
- Prevents accidental data modification
- Audit trail stays clean
- Compliance requirement for educational institutions
```

### 6. Audit Logging on Every Action ⚠️ CRITICAL
```
RULE: Every user action MUST write to audit_logs table.
      Log: actor_id, action_type, entity_type, entity_id, ip_address, timestamp

TRIGGERS:
- LOGIN / LOGOUT
- COMPLAINT_SUBMITTED
- STATUS_CHANGED
- ESCALATED
- COMPLAINT_ROUTED
- USER_CREATED / MODIFIED
- COMMITTEE_CREATED / MODIFIED
- FEEDBACK_SUBMITTED

MIDDLEWARE:
middleware/auditLogger.js intercepts all successful mutating requests

ENFORCEMENT:
- Automatic on all POST, PATCH, PUT, DELETE
- Cannot be bypassed
- Includes metadata (user role, IP, timestamp)

WHY:
- Compliance: Educational institutions need full audit trail
- Security: Detect unauthorized access patterns
- Investigation: Trace any data change to actor
```

### 7. Anonymous Token = Hash ONLY ⚠️ CRITICAL
```
RULE: NEVER store raw token anywhere.
      Always use SHA-256 hash for DB storage and lookups.

FLOW:
1. Generate: anonToken = uuidv4() → "a1b2c3d4-..."
2. Hash: tokenHash = SHA256(anonToken) → "abc123def456..."
3. DB Store: anon_token_hash = tokenHash (in complaints table)
4. Redis Mapping: anon_token:{tokenHash} → complaint_id (in Redis)
5. Response: Return ONLY anonToken to student (ONCE!)

LOOKUP (Tracking):
1. Student provides: anonToken
2. Compute: tokenHash = SHA256(anonToken)
3. Redis LOOKUP: get anon_token:{tokenHash} → complaint_id
4. Fetch complaint by ID
5. Return safe public info only

WHY:
- Even if DB is breached, token is not exposed
- Hashing is one-way (cannot reverse)
- Token expires in Redis after 90 days
```

### 8. File Validation: MIME Type NOT Extension ⚠️ CRITICAL
```
RULE: Validate MIME type (Content-Type header), NOT file extension.
      Attacker can rename php.txt to php.jpg but MIME type remains text/plain

IMPLEMENTATION:
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'video/mp4': 'mp4',
  'application/pdf': 'pdf'
};

// Reject if file.mimetype not in ALLOWED_TYPES
// Extension check is secondary only

MULTER CONFIG:
fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES[file.mimetype]) {
    return cb(new Error('Invalid MIME type'))
  }
}

WHY:
- Extension can be spoofed
- MIME type is harder to fake (requires proper file structure)
- Prevents malware uploads disguised as images
```

### 9. All SQL Queries = Sequelize Parameterized ⚠️ CRITICAL
```
RULE: No raw SQL string interpolation. EVER.
      EVERY query must use Sequelize ORM or parameterized statements.

SAFE (Sequelize):
const complaint = await Complaint.findOne({
  where: { complaint_id: uuid }
});

SAFE (Parameterized):
const [complaints] = await sequelize.query(
  'SELECT * FROM complaints WHERE complaint_id = ?',
  { replacements: [uuid] }
);

UNSAFE (NEVER):
const query = `SELECT * FROM complaints WHERE complaint_id = '${uuid}'`;
// This is SQL INJECTION vulnerability!

ENFORCEMENT:
- Code review: Flag ANY raw queries
- ESLint rule: Warn on sequelize.query without parameterization
- CI/CD: Security scan for SQL injection patterns
```

### 10. Gemini Fallback = Silent to Student ⚠️ CRITICAL
```
RULE: If Gemini API fails, fallback silently.
      NEVER show AI error to student.
      Route complaint to "General Queue" for manual review.

FALLBACK RESPONSE:
{
  category: 'other',
  severity: 'medium',
  urgency_score: 0.5,
  suggested_committee: 'General Queue',
  is_potential_duplicate: false,
  confidence: 0.0,  // Low confidence triggers manual review
  summary: 'Manual review required',
  error: 'AI service unavailable'
}

STUDENT SEES:
"Your complaint has been submitted successfully and will be reviewed by our team."

ADMIN SEES (in routing queue):
"AI confidence: 0% - Manual routing required"

WHY:
- UX: No technical errors shown to students
- Reliability: System continues even if Gemini down
- Compliance: Complaints never lost
- Admin: Manual review catches complex cases
```

## Implementation Checklist

### Phase 1: Database & Core Models
- [ ] Create MySQL schema with indexes and triggers
- [ ] Create Sequelize models for all tables
- [ ] Test database connections (MySQL, MongoDB, Redis)
- [ ] Create MongoDB schema with validation

### Phase 2: Authentication & Middleware
- [ ] Implement JWT auth middleware
- [ ] Implement RBAC middleware
- [ ] Implement rate limiting middleware
- [ ] Implement file validation middleware
- [ ] Implement audit logger middleware

### Phase 3: Auth Service
- [ ] User registration with password hashing
- [ ] User login with JWT issuance
- [ ] Session management in Redis
- [ ] Password reset flow with OTP
- [ ] Role-based dashboard routing

### Phase 4: Complaint Service Core
- [ ] Implement complaint submission (non-anonymous)
- [ ] Implement complaint submission (anonymous with token)
- [ ] Implement TF-IDF duplicate detection
- [ ] Integrate Gemini API for categorization
- [ ] Implement OCR text extraction
- [ ] Compute SLA deadlines via stored procedure
- [ ] Auto-route to committees based on category

### Phase 5: Complaint Management
- [ ] Get complaint details with RBAC
- [ ] Update complaint status with status log
- [ ] Escalate complaints
- [ ] Track anonymous complaints by token
- [ ] Message thread (MongoDB)

### Phase 6: Background Jobs
- [ ] Implement escalation job (every 30 min)
- [ ] Schedule with node-cron
- [ ] Send notifications on escalation

### Phase 7: Frontend Pages
- [ ] Login page
- [ ] Student dashboard
- [ ] New complaint form (with file upload)
- [ ] Complaint detail view
- [ ] Anonymous tracking page
- [ ] Authority inbox
- [ ] Admin dashboard with analytics
- [ ] Principal dashboard (read-only)

### Phase 8: API Controllers
- [ ] Auth controller
- [ ] Complaint controller
- [ ] Dashboard controller
- [ ] Feedback controller
- [ ] Admin controller

### Phase 9: Testing & Deployment
- [ ] Unit tests (backend services)
- [ ] Integration tests (API endpoints)
- [ ] Security audit
- [ ] Load testing (500+ concurrent)
- [ ] Docker build & test
- [ ] Production environment setup

## Key Files & Their Purposes

| Path | Purpose |
|------|---------|
| `backend/server.js` | Express app, starts escalation job |
| `backend/models/*.js` | Sequelize ORM models |
| `backend/services/complaintService.js` | Core complaint logic (TF-IDF, Gemini, SLA) |
| `backend/middleware/*.js` | Auth, RBAC, rate limiting, audit logging |
| `backend/jobs/escalationJob.js` | 30-min background escalation check |
| `ai-service/main.py` | FastAPI endpoints for Gemini + TF-IDF |
| `ai-service/gemini_client.py` | Gemini API wrapper |
| `ai-service/tfidf_engine.py` | Duplicate detection algorithm |
| `database/schema.sql` | MySQL schema with triggers, procedures |
| `frontend/src/App.js` | React router, page layout |
| `frontend/src/context/*.js` | Auth and notification state |
| `docker-compose.yml` | All services orchestrated |

## Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Page Load | < 2s @ P95 | Browser DevTools, Lighthouse |
| API Response (non-AI) | < 500ms | Response headers, APM |
| Complaint Submission (with AI) | < 6s end-to-end | User timing |
| Concurrent Users | 500+ | Load test |
| Uptime | 99% | Monitoring |

## Monitoring & Observability

```bash
# Key metrics to track:
- Gemini API response time and errors
- Redis hit/miss ratio
- MySQL slow query log
- Background job execution time
- JWT token invalidation rate
- Anonymous token usage patterns
```

## Common Pitfalls to Avoid

1. ❌ Storing raw anonymous token → ✓ Hash it with SHA-256
2. ❌ Calling Gemini without TF-IDF check → ✓ Check for duplicates first
3. ❌ Computing SLA on frontend → ✓ Use MySQL stored procedure
4. ❌ Showing AI errors to students → ✓ Silent fallback to General Queue
5. ❌ Trusting file extension → ✓ Validate MIME type
6. ❌ Raw SQL queries → ✓ Sequelize ORM always
7. ❌ Missing audit logs → ✓ Middleware logs everything
8. ❌ Principal has write access → ✓ RBAC enforces read-only
9. ❌ Status changes not logged → ✓ Trigger + explicit code
10. ❌ Sessions never invalidated → ✓ Delete from Redis on logout

---

**Remember**: This system handles sensitive student data. Security and privacy are not optional.
Every critical rule exists because of real-world attacks or compliance failures.
