# 🏗️ The Complain Box v2.0 Frontend - Implementation Guide

## ✅ COMPLETED - Phase 1 & Phase 2 Foundation

### Installed Dependencies
- ✅ react-router-dom, axios
- ✅ lucide-react, react-dropzone, date-fns
- ✅ recharts, react-hot-toast
- ✅ tailwindcss (v3) with Bauhaus config

### Design System Setup
- ✅ Outfit font integrated (Google Fonts)
- ✅ tailwind.config.js with all Bauhaus colors and tokens
- ✅ src/index.css with global classes
- ✅ Safelist configured to prevent Tailwind purging

### Context & State Management
- ✅ AuthContext.jsx - user, token, login/logout, hasRole()
- ✅ NotificationContext.jsx - notifications, polling, markAllRead()
- ✅ API interceptors - JWT injection, 401/429 handling

### Base Components (Created)
- ✅ Button.jsx - Primary, Secondary, Yellow, Outline, Ghost variants + loading state
- ✅ Badge.jsx - StatusBadge, PriorityBadge, SeverityBadge, CategoryBadge
- ✅ Card.jsx - Base card with Bauhaus styling
- ✅ SLACountdown.jsx - Countdown timer with urgency levels
- ✅ ProtectedRoute.jsx - Role-based route guards
- ✅ Sidebar.jsx - Desktop/mobile navigation with role-based menu
- ✅ TopBar.jsx - Header with notifications and user menu
- ✅ AppShell.jsx - Main layout wrapper
- ✅ ComplaintCard.jsx - Complaint summary card with geometric accents

### Constants
- ✅ src/constants/roles.js
- ✅ src/constants/statuses.js
- ✅ src/constants/categories.js

### Hooks
- ✅ useAuth.js
- ✅ useNotifications.js
- ✅ useSLA.js

---

## 📋 REMAINING TASKS

### Phase 2B: Additional Shared Components (HIGH PRIORITY)

These components are used across multiple pages:

1. **Modal.jsx** - Reusable modal with Bauhaus styling
   - Props: isOpen, onClose, title, children
   - Classes: Fixed overlay, centered card, close button
   
2. **FileUpload.jsx** - react-dropzone wrapper
   - Max 3 files, 10MB each
   - Accepted: JPG, PNG, MP4, PDF
   - MIME validation, size validation, count validation
   - File preview thumbnails
   - Remove button per file

3. **Timeline.jsx** - Vertical status timeline
   - Props: logs array (with status, actor, note, timestamp)
   - Animation: staggered node entrance

4. **SkeletonCard.jsx** - Loading placeholder
   - Match ComplaintCard dimensions
   - Shimmer animation
   - Min 400ms display

5. **FileValidation.js** (utility)
   - validateFileType(file)
   - validateFileSize(file)
   - validateFileCount(files)

6. **PasswordStrengthBar.jsx** - 4-segment indicator
   - Red (weak) → Yellow (fair) → Blue (good) → Green (strong)
   - Update as user types

7. **OTPInput.jsx** - 6 individual input boxes
   - Auto-focus next on digit
   - Auto-focus prev on backspace
   - Auto-submit on completion

8. **Pagination.jsx** - Reusable pagination component
   - Props: total, page, limit, onPageChange
   - Shows "X–Y of Z", Previous/Next buttons, page size selector

9. **DataTable.jsx** - Responsive table for admin pages
   - Props: columns, data, onRowClick
   - Table on desktop, cards on mobile

10. **StatusTimeline.jsx** - Shows complaint status flow
    - Horizontal or vertical timeline
    - Color-coded status nodes

---

### Phase 3: Public Pages

#### 3.1 LoginPage (/login)
**File:** `src/pages/public/LoginPage.jsx`

Features:
- Split-panel layout (60% left, 40% right on desktop)
- Left: Bauhaus logo + form card
- Right: Geometric Bauhaus composition (Yellow bg)
- Form: email, password, show/hide toggle
- Links: forgot password, register
- API: POST /api/auth/login
- On success: redirect by role to dashboard
- On error: show field error styling, rate limit banner

Key Elements:
- Login rate limiting display
- "Too many attempts" banner if 429
- Field validation errors with AlertCircle icon

---

#### 3.2 RegisterPage (/register)
**File:** `src/pages/public/RegisterPage.jsx`

Features:
- Same split-panel (Right panel: bg-[#F0C020])
- Step 1: Full Name, Institutional ID, Email, Password, Confirm Password
- Password strength indicator bar (4 segments)
- Step 2: 6-digit OTP input boxes with auto-focus
- 5:00 countdown timer, Resend button at 0:00
- Success state: green checkmark, auto-redirect after 2s
- Error states: email already registered, invalid OTP, OTP expired

API Calls:
- POST /api/auth/register
- POST /api/auth/verify-otp (custom endpoint or backend creates)

---

#### 3.3 AnonymousTrackerPage (/track)
**File:** `src/pages/public/AnonymousTrackerPage.jsx`

Features:
- Centered single-column layout max-w-lg
- Token input field (font-mono, border-4)
- Result card on success: status, submitted_at, last_update, last status_note
- Error: "Token not found or expired"
- Privacy note: "No login or personal data required"
- No AppShell - minimal header with logo only

API Call:
- GET /api/complaints/track/:token (no auth required)

---

### Phase 4: Student Pages

#### 4.1 StudentDashboard (/dashboard)
**File:** `src/pages/student/StudentDashboard.jsx`

Features:
- Page title: "MY COMPLAINTS"
- Stats row: 3 tiles (Total, Active, Resolved) with large numbers
- Filter pills: All, Submitted, Under Review, In Progress, Escalated, Closed
- Complaint grid: ComplaintCard components (1 col mobile, 2 col tablet, 3 col desktop)
- Empty state: circle div + "No complaints yet" + "SUBMIT YOUR FIRST COMPLAINT" button
- FAB (mobile only): Red circle bottom-right w-16 h-16 with Plus icon
- New Complaint button (desktop): Top-right Red Primary

API Call:
- GET /api/dashboard/student

---

#### 4.2 ComplaintFormPage (/complaints/new)
**File:** `src/pages/student/ComplaintFormPage.jsx`

Sections:
1. **Basic Info**
   - Title input (required, error if empty)
   - Description textarea (min 30 chars, live counter, Red if < 30, Green if ≥ 30)
   - Category dropdown (optional, with "Auto-detect by AI" option)

2. **Anonymous Toggle**
   - Bauhaus toggle switch (rectangle track, circle knob, rotate on state)
   - Helper text about anonymity
   - Yellow warning panel when ON

3. **Evidence Files**
   - FileUpload component
   - Max 3 files, 10MB each, JPG/PNG/MP4/PDF
   - Slot counter "X of 3 slots used"
   - File previews with remove buttons

4. **Submit**
   - Submit button: disabled if title empty OR description < 30 chars
   - Loading state: button shows spinner + "AI IS PROCESSING YOUR COMPLAINT..."
   - Rate limit warnings

Special Modal: Anonymous Token Modal
- Full-screen modal (cannot dismiss by clicking outside)
- Header: "SAVE YOUR TOKEN NOW" (Red text, uppercase)
- Red warning panel: "This token will NEVER be shown again"
- Token display: font-mono, breakable text, full UUID
- Copy button: Yellow, shows checkmark for 2s after copy
- Confirm checkbox: must be checked before proceeding
- Proceed button: Blue, disabled until checkbox checked

API Call:
- POST /api/complaints (multipart/form-data)
- Response: complaint_id, status, anon_token (if isAnonymous), sla_deadline

---

#### 4.3 ComplaintDetailPage (/complaints/:id)
**File:** `src/pages/student/ComplaintDetailPage.jsx`

Layout: 3-column on desktop (Main 60% | Status Sidebar 20% | Timeline 20%), single column on mobile

Main Column:
- Title (h1, Outfit Black)
- Badge row: Status, Priority, Category, Severity, "ANONYMOUS" pill
- AI badge: Confidence bar (Blue fill), AI summary text, if < 0.65 confidence: "MANUALLY ROUTED"
- Description card (white, border-2)
- Evidence files grid (images as thumbnails clickable → lightbox, PDF/video → icon + download link)
- "UPLOAD ADDITIONAL EVIDENCE" button (only if status NOT in closed/resolved)
- Message thread (only if NOT anonymous)
  - Student messages: right-aligned, bg-[#1040C0], text-white
  - Authority messages: left-aligned, bg-white, text-black
  - Both: rounded-none, border-2, max-w-xs
  - Input area: textarea + Blue SEND button

Status Sidebar:
- Current status badge (large)
- SLA countdown (text-2xl)
- "Assigned To" if assigned_to populated
- Committee name + category_tag
- Submission info (dates formatted)
- Feedback CTA (only if status='closed' AND NOT anonymous): yellow box with link to /feedback/:id

Timeline Column:
- Vertical line (absolute left-3 w-0.5)
- Each node: circle (completed=bg-[#121212], current=bg-[#1040C0], future=bg-white)
- Node content: StatusBadge + authority note + actor name + timestamp
- Animation: each node translateX(-20px) opacity-0 → translateX(0) opacity-1

API Calls:
- GET /api/complaints/:id
- GET /api/complaints/:id/messages
- Polling messages every 5-10 seconds (or use setInterval)

---

#### 4.4 FeedbackFormPage (/feedback/:id)
**File:** `src/pages/student/FeedbackFormPage.jsx`

Access Rule: Only if status='closed' AND is_anonymous=false. Else redirect to /dashboard.

Layout: Centered card max-w-md

Content:
- Heading: "RATE YOUR EXPERIENCE"
- Complaint summary: title + committee
- 5-star rating (clickable, hover preview)
- Star labels below: "1 Very Poor | 2 Poor | 3 Neutral | 4 Good | 5 Excellent"
- Comment textarea (optional)
- Submit button: Red, disabled until star selected
- Success state: green circle (w-20 h-20 bg-[#107050] rounded-full) + white checkmark icon + "Thank you for your feedback!" + link back to /dashboard
- Already-submitted state: show previous rating (non-interactive stars) + "You have already submitted feedback for this complaint"

API Call:
- POST /api/feedback/:id { rating, comment }
- On 422 error: show already-submitted state

---

### Phase 5: Authority Pages

#### 5.1 AuthorityInboxPage (/authority/inbox)
**File:** `src/pages/authority/AuthorityInboxPage.jsx`

Features:
- Page title: "COMPLAINT INBOX" + committee name Blue badge + unresolved count Red badge
- Filter bar (horizontal scrollable on mobile):
  - Severity pills: All, Low, Medium, High, Critical
  - Category dropdown
  - SLA Status pills: All, Overdue, On Time
  - Assigned To dropdown (visible if committee_head role)
  - Date From/To pickers
  - Active filter count badge (Yellow)
  - "CLEAR FILTERS" ghost button
- Table view (md+):
  - Columns: Priority Badge, Title, Category, Severity Badge, SLA Countdown, Assigned To, Status Badge, Action →
  - Row hover: bg-[#E0E0E0]
  - Overdue row: bg-[#D02020]/10 border-l-4 border-[#D02020]
  - Sortable columns: Priority, Submitted Date
  - Click row → navigate to /authority/complaints/:id
- Card view (mobile):
  - ComplaintCard stacked
- Pagination: "Showing X–Y of Z" + Previous/Next + page size selector

API Call:
- GET /api/dashboard/authority
- Query params: severity, category, sla_status, date_from, date_to, page, limit

---

#### 5.2 AuthorityDetailPage (/authority/complaints/:id)
**File:** `src/pages/authority/AuthorityDetailPage.jsx`

Layout: 2-column (Left 65% info | Right 35% actions)

Left Column (Info):
- Full complaint details (title, description, all metadata)
- AI badge (Confidence bar with Red fill 0-65%, Blue 65-100%, AI summary)
- Evidence viewer (thumbnail grid, click → lightbox modal, PDF/video → download)
- "DOWNLOAD ALL EVIDENCE" button (Blue Secondary → triggers ZIP download)
- Student info card (only if NOT anonymous): Name, Institutional ID, Email
- Anonymous banner (if anonymous): bg-[#F0C020], "ANONYMOUS COMPLAINT — Student identity protected. Messaging disabled."

Right Column (Actions):
1. **Status Update**
   - Dropdown: only valid next statuses
   - Mandatory resolution note textarea
   - UPDATE STATUS button (Blue, disabled if note empty)
   - API: PATCH /api/complaints/:id/status { newStatus, note }

2. **Assign Member** (visible if committee_head)
   - Dropdown of committee members
   - ASSIGN button (Yellow)
   - API: PATCH /api/complaints/:id/assign { user_id }

3. **Escalate Button** (visible if committee_head or admin)
   - Red Primary "ESCALATE COMPLAINT"
   - Modal confirmation: Red header, mandatory reason textarea, CONFIRM button (Red), CANCEL button (Ghost)
   - API: POST /api/complaints/:id/escalate { escalation_reason }

4. **Close Button** (visible if committee_head AND status='resolved')
   - bg-[#121212] text-white
   - Modal: mandatory "Resolution Summary" textarea, CONFIRM CLOSE button (Red)
   - API: PATCH /api/complaints/:id/status { newStatus: 'closed', note }

5. **Internal Notes** (committee-visible only, NOT shown to students)
   - Textarea: "Add internal note (committee-visible only)"
   - ADD NOTE button (Outline)
   - Notes list: yellow border-2 border-black cards, actor + timestamp + text
   - API: POST /api/complaints/:id/notes { note }

6. **Proof Upload**
   - Button: "UPLOAD PROOF OF ACTION"
   - Same FileUpload component
   - Show uploaded proofs as thumbnail grid

7. **Message Thread** (same as student detail)
   - Hidden if is_anonymous=true

API Calls:
- GET /api/complaints/:id
- GET /api/complaints/:id/messages
- PATCH /api/complaints/:id/status
- POST /api/complaints/:id/escalate
- PATCH /api/complaints/:id/assign
- POST /api/complaints/:id/notes
- File upload endpoints for proof

---

### Phase 6: Admin Pages

#### 6.1 AdminDashboardPage (/admin/dashboard)
**File:** `src/pages/admin/AdminDashboardPage.jsx`

KPI Cards Row:
- 4 stat cards: Total Complaints (Blue), Open Complaints (Yellow), Avg Resolution Time (white), Satisfaction (Green)
- Each card: large Outfit Black number, label, trend arrow (TrendingUp/Down lucide)

Charts (all using Recharts):
1. **Complaint Volume Line Chart** (Recharts LineChart)
   - Toggle: 30d | 60d | 90d (Yellow button group, active=bg-[#121212])
   - Line: stroke='#121212' strokeWidth=2
   - Area fill: #F0C020 opacity 30%
   - Responsive container

2. **Resolution Ratio Donut Chart** (Recharts PieChart with innerRadius)
   - Segments: Open (Blue), Closed (Black)
   - Center text: percentage closed
   - Simple legend

3. **Avg Resolution Time by Committee Bar Chart**
   - Bars alternating Blue and Yellow
   - ReferenceLine y={5 days target} Red stroke-dasharray
   - X-axis: committee names

4. **Student Satisfaction Area Chart**
   - Area fill='#F0C020', Line stroke='#121212'
   - ReferenceLine y={3.8 target} Red
   - Y-axis: 0–5 stars

API Call:
- GET /api/dashboard/admin
- Response: totalComplaints, openComplaints, closedComplaints, averageResolutionTime, dailyTrends, satisfactionMetrics, committeeStats

---

#### 6.2 RoutingQueuePage (/admin/routing-queue)
**File:** `src/pages/admin/RoutingQueuePage.jsx`

Features:
- Page title: "MANUAL ROUTING QUEUE" + pending count Red badge
- Yellow info banner: "These complaints have AI confidence < 65% and require manual committee assignment."
- Table:
  - Columns: #, Title, AI Summary, Confidence Score, Category Suggestion, Submitted Date, Assign
  - Confidence bar: w-32 h-3, fill width = confidence %
  - Assign control: inline select dropdown + Blue ASSIGN button
  - On success: row fades out (opacity transition-opacity 300ms)
- Empty state: green circle + checkmark icon + "ALL COMPLAINTS ROUTED" + "Queue is empty."

API Calls:
- GET /api/admin/routing-queue
- PATCH /api/admin/complaints/:id/route { committee_id }

---

#### 6.3 UsersPage (/admin/users)
**File:** `src/pages/admin/UsersPage.jsx`

Features:
- Page title: "USER MANAGEMENT" + "ADD USER" Red Primary button (top-right)
- Search bar: Input border-2, Search lucide icon, filters by name/email/institutional_id
- Role filter pills: All, Student, Committee Member, Committee Head, Admin, Principal
- Table:
  - Columns: Avatar + Name, Institutional ID, Email, Role Badge, Committee, Status, Actions
  - Avatar: circle initials (bg-[#1040C0], text-white, w-8 h-8)
  - Role badge: colored pills (Student=gray, Member=Blue, Head=Blue dark, Admin=Black, Principal=Yellow)
  - Active toggle: when is_active=false, row gets opacity-50
  - Edit button: Pencil lucide icon → opens Edit Drawer
- Edit Drawer (slides in from right):
  - Fixed right-0 top-0 h-screen w-80 bg-white border-l-4 border-black
  - Overlay bg-black/30
  - Fields: Name, Role, Committee (conditional)
  - SAVE CHANGES button (Blue, w-full)
- Create Modal:
  - Header: bg-[#1040C0] text-white "CREATE NEW USER"
  - Fields: Institutional ID, Full Name, Email, Password, Role, Committee
  - Password note: "This password will be shown once. The user must change it on first login."
  - CREATE USER button (Red Primary)
- Pagination: standard

API Calls:
- GET /api/admin/users { page, limit }
- POST /api/admin/users { institutional_id, name, email, password, role, committee_id? }
- PATCH /api/admin/users/:id { name?, role?, committee_id?, is_active? }

---

#### 6.4 CommitteesPage (/admin/committees)
**File:** `src/pages/admin/CommitteesPage.jsx`

Features:
- Page title: "COMMITTEES" + "ADD COMMITTEE" Red Primary button
- Committee cards (grid: 1 col mobile, 2 col tablet, 3 col desktop):
  - Card: white border-4 shadow-[8px_8px_0px_0px_#121212]
  - Hover: -translate-y-1 transition
  - Content: Name (uppercase bold), category_tag (Yellow badge), head user name (muted), member count, created date
  - Geometric accent (top-right corner): shapes cycle circle/square/triangle, colors cycle Red/Blue/Yellow
  - Edit button: Pencil lucide icon (absolute top-4 right-4)
- Edit Drawer (same as Users):
  - Fields: Name, Category Tag (validated dropdown: security|ragging|academic|hostel|fees|infrastructure|harassment|other), Head User dropdown, Email Alias (optional)
- Create Modal:
  - Same fields as drawer
  - Yellow warning: "category_tag must exactly match one of: security, ragging, academic, hostel, fees, infrastructure, harassment, other"

API Calls:
- GET /api/admin/committees
- POST /api/admin/committees { name, category_tag, head_user_id, email_alias? }
- PATCH /api/admin/committees/:id { name?, category_tag?, head_user_id?, email_alias? }

---

#### 6.5 AuditLogsPage (/admin/audit-logs)
**File:** `src/pages/admin/AuditLogsPage.jsx`

Features:
- Page title: "AUDIT LOGS" + "EXPORT CSV" Yellow button (top-right)
- CSV shows Loader2 animate-spin during download
- Filter bar:
  - Actor ID input
  - Action Type dropdown: All, LOGIN, LOGOUT, COMPLAINT_SUBMITTED, STATUS_CHANGED, ESCALATED, etc.
  - Entity Type dropdown: All, complaint, user, committee, feedback
  - Date From/To pickers
  - APPLY FILTERS button (Blue Secondary)
- Table:
  - Columns: Timestamp, Actor, Action Type, Entity Type, Entity ID, IP Address, Details
  - Timestamp: formatted date + time, font-mono
  - Action Type badge: colored pills (LOGIN=Blue, LOGOUT=gray, COMPLAINT_SUBMITTED=Green, STATUS_CHANGED=Yellow, ESCALATED=Red, etc.)
  - Details: truncated (60 chars), click row → expand full JSON below in monospace pre block
  - Total count: "X log entries" muted above table
- Pagination: standard

API Calls:
- GET /api/admin/audit-logs { actor_id?, action_type?, entity_type?, date_from?, date_to?, page?, limit? }
- GET /api/admin/audit-logs/export { same filters } → triggers CSV download

---

### Phase 7: Principal Pages

#### 7.1 PrincipalDashboardPage (/principal/dashboard)
**File:** `src/pages/principal/PrincipalDashboardPage.jsx`

🔒 **CRITICAL: ZERO WRITE ACCESS - READ ONLY ONLY ONLY**
- NEVER call POST, PATCH, DELETE axios methods
- NO forms, toggles, submit buttons, or any mutations
- Visual differentiation: Sidebar border-r-4 border-[#F0C020] (Yellow instead of Blue)
- Read-only watermark: Fixed diagonal "READ ONLY" text across page (opacity-[0.03])

Features:
- KPI Banner (full-width, bg-[#F0C020], border-b-4):
  - 4 large numbers: Total Complaints, Open, Escalated, Avg Satisfaction
  - Display only (no click handlers)

- Escalated Complaints Table:
  - Title: "ESCALATED COMPLAINTS"
  - Columns: Priority Badge, Title, Committee, Submitted Date, Time Escalated, Days Overdue
  - P1 highlight: bg-[#D02020]/10 border-l-4
  - Client-side sort only (no API call)

- Per-Committee Grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3):
  - Committee cards: Name + category_tag badge + Open (Blue number) + Avg Resolution Days (Black) + Satisfaction (5 read-only stars) + Resolved this month
  - No buttons

- Satisfaction Trend Chart (Recharts LineChart):
  - Yellow line, 6-month view (fixed, no controls)
  - ReferenceLine y={3.8 target}
  - No toggles or interactive controls

API Call:
- GET /api/dashboard/principal (read-only, no mutations)

---

## 🚀 Implementation Priority & Sequence

**RECOMMENDED ORDER:**

1. **CRITICAL:** Shared components (Modal, FileUpload, etc.) - all other pages depend on these
2. **FOUNDATION:** Public pages (Login, Register, Tracker) - users can't access app without these
3. **USER-FACING:** Student pages (all 4) - core user experience
4. **OPERATIONS:** Authority pages (Inbox, Detail) - committee workflow
5. **ADMINISTRATION:** Admin pages (all 5) - system management
6. **OVERSIGHT:** Principal dashboard - approval/monitoring

---

## 📚 Implementation Templates

### Component Template
```jsx
import React from 'react';

/**
 * ComponentName
 * Description
 */
const ComponentName = ({ prop1, prop2, className = '' }) => {
  return (
    <div className={`bauhaus-classes ${className}`}>
      {/* Content */}
    </div>
  );
};

export default ComponentName;
```

### Page Template
```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AppShell from '../../components/AppShell';
import { complaintAPI } from '../../services/api';

/**
 * PageName
 * Description
 */
const PageName = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // const response = await complaintAPI.getById(id);
        // setData(response.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <AppShell pageTitle="PAGE TITLE">
      {/* Content */}
    </AppShell>
  );
};

export default PageName;
```

---

## ⚡ Quick Start for Next Steps

1. **Create remaining component files** using template above
2. **Implement FileUpload.jsx and Modal.jsx FIRST** - most pages depend on these
3. **Implement LoginPage next** - entry point for all users
4. **Then build by role:** Student → Authority → Admin → Principal
5. **Test exhaustively** each page before moving to next

---

## 📝 File Checklist

### Components to Create
- [ ] Modal.jsx
- [ ] FileUpload.jsx
- [ ] Timeline.jsx
- [ ] SkeletonCard.jsx
- [ ] OTPInput.jsx
- [ ] PasswordStrengthBar.jsx
- [ ] Pagination.jsx
- [ ] DataTable.jsx

### Public Pages
- [ ] src/pages/public/LoginPage.jsx
- [ ] src/pages/public/RegisterPage.jsx
- [ ] src/pages/public/AnonymousTrackerPage.jsx

### Student Pages
- [ ] src/pages/student/StudentDashboard.jsx
- [ ] src/pages/student/ComplaintFormPage.jsx
- [ ] src/pages/student/ComplaintDetailPage.jsx
- [ ] src/pages/student/FeedbackFormPage.jsx

### Authority Pages
- [ ] src/pages/authority/AuthorityInboxPage.jsx
- [ ] src/pages/authority/AuthorityDetailPage.jsx

### Admin Pages
- [ ] src/pages/admin/AdminDashboardPage.jsx
- [ ] src/pages/admin/RoutingQueuePage.jsx
- [ ] src/pages/admin/UsersPage.jsx
- [ ] src/pages/admin/CommitteesPage.jsx
- [ ] src/pages/admin/AuditLogsPage.jsx

### Principal Pages
- [ ] src/pages/principal/PrincipalDashboardPage.jsx

### Root App Structure
- [ ] Update src/App.js with Router and all routes

---

## 🔗 API Reference Quick Guide

All endpoints are in the Backend Report. Key patterns:

**Authentication:**
```javascript
POST /auth/login { email, password }
POST /auth/register { institutional_id, name, email, password }
POST /auth/logout
```

**Complaints:**
```javascript
GET /dashboard/student // Get user's complaints
POST /complaints // Submit new complaint (multipart/form-data)
GET /complaints/:id // Get complaint detail
PATCH /complaints/:id/status { newStatus, note } // Update status
POST /complaints/:id/escalate { escalation_reason }
GET /complaints/:id/messages // Get message thread
POST /complaints/:id/messages { message }
```

**All requests** include header: `Authorization: Bearer <token>`

---

## 🎨 Bauhaus Color Quick Reference

- **Red (#D02020)**: Danger, escalated, P1, destructive buttons
- **Blue (#1040C0)**: Authority, primary actions, assigned/in-progress
- **Yellow (#F0C020)**: Admin, warnings, under_review/waiting badges
- **Green (#107050)**: Success, resolved/closed status
- **Black (#121212)**: Borders, foreground text, closed status
- **Muted (#E0E0E0)**: Disabled states, alternating rows

---

## ✨ Next Steps

1. Create Modal.jsx and FileUpload.jsx immediately
2. Implement LoginPage - test authentication flow
3. Build one complete role's pages (recommend: student first)
4. Test end-to-end with backend running
5. Polish animations and responsive behavior

Good luck building! 🚀
