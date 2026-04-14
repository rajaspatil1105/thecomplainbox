-- The Complain Box v2.0 - MySQL Database Schema
-- Production-grade complaint management system

-- Drop existing objects if they exist (for clean restart)
DROP TRIGGER IF EXISTS trg_status_log;
DROP PROCEDURE IF EXISTS compute_sla_deadline;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  user_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  institutional_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt cost factor 12',
  role ENUM('student', 'committee_member', 'committee_head', 'admin', 'principal') NOT NULL,
  committee_id CHAR(36),
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Soft delete flag',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_institutional_id (institutional_id),
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_committee_id (committee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- COMMITTEES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS committees (
  committee_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL,
  category_tag VARCHAR(50) NOT NULL COMMENT 'Must exactly match Gemini category output for auto-routing',
  head_user_id CHAR(36) NOT NULL,
  email_alias VARCHAR(150),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (head_user_id) REFERENCES users(user_id),
  INDEX idx_category_tag (category_tag),
  UNIQUE KEY uq_committee_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key to users table for committee_id
ALTER TABLE users ADD CONSTRAINT fk_users_committee 
  FOREIGN KEY (committee_id) REFERENCES committees(committee_id);

-- ============================================================================
-- COMPLAINTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS complaints (
  complaint_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  student_id CHAR(36) COMMENT 'NULL for anonymous complaints',
  anon_token_hash VARCHAR(255) COMMENT 'SHA-256 of tracking token. NULL for named complaints. NEVER store raw token.',
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL COMMENT 'Min 30 characters enforced at API layer',
  category VARCHAR(50) NOT NULL COMMENT 'Gemini-assigned or manually set by admin',
  severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  priority ENUM('P1', 'P2', 'P3', 'P4') NOT NULL,
  status ENUM('submitted', 'under_review', 'assigned', 'in_progress', 'waiting_student', 'resolved', 'closed', 'escalated') NOT NULL DEFAULT 'submitted',
  committee_id CHAR(36) COMMENT 'NULL until routed by AI or admin',
  assigned_to CHAR(36) COMMENT 'NULL until committee head assigns',
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  ai_confidence DECIMAL(4,3) COMMENT 'Gemini confidence score 0.000 to 1.000',
  is_duplicate BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Flagged by TF-IDF pre-check',
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  sla_deadline TIMESTAMP NOT NULL COMMENT 'Computed from priority + submitted_at on insert using stored procedure',
  FOREIGN KEY (student_id) REFERENCES users(user_id),
  FOREIGN KEY (committee_id) REFERENCES committees(committee_id),
  FOREIGN KEY (assigned_to) REFERENCES users(user_id),
  INDEX idx_student_id (student_id),
  INDEX idx_committee_status (committee_id, status),
  INDEX idx_sla_status (sla_deadline, status),
  INDEX idx_submitted_at (submitted_at),
  INDEX idx_is_duplicate (is_duplicate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- COMPLAINT STATUS LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS complaint_status_log (
  log_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  complaint_id CHAR(36) NOT NULL,
  changed_by CHAR(36) NOT NULL,
  old_status VARCHAR(50) NOT NULL,
  new_status VARCHAR(50) NOT NULL,
  note TEXT,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id),
  FOREIGN KEY (changed_by) REFERENCES users(user_id),
  INDEX idx_complaint_id (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- EVIDENCE FILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS evidence_files (
  file_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  complaint_id CHAR(36) NOT NULL,
  uploaded_by CHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL COMMENT 'Storage path or S3 key',
  file_type VARCHAR(20) NOT NULL COMMENT 'jpg, png, mp4, pdf',
  file_size_kb INT NOT NULL CHECK (file_size_kb <= 10240),
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id),
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id),
  INDEX idx_complaint_id (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- FEEDBACK TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback (
  feedback_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  complaint_id CHAR(36) UNIQUE NOT NULL COMMENT 'One feedback per complaint only',
  student_id CHAR(36) NOT NULL COMMENT 'Anonymous complaints skip feedback entirely',
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id),
  FOREIGN KEY (student_id) REFERENCES users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  actor_id CHAR(36) COMMENT 'NULL for automated system actions',
  action_type VARCHAR(80) NOT NULL COMMENT 'LOGIN, LOGOUT, COMPLAINT_SUBMITTED, STATUS_CHANGED, ESCALATED, COMPLAINT_ROUTED, USER_CREATED',
  entity_type VARCHAR(50) NOT NULL COMMENT 'complaint, user, committee, feedback',
  entity_id CHAR(36),
  ip_address VARCHAR(45) COMMENT 'IPv4 or IPv6',
  metadata JSON,
  logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(user_id),
  INDEX idx_actor_logged_at (actor_id, logged_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- STORED PROCEDURE: compute_sla_deadline
-- ============================================================================
DELIMITER $$

CREATE PROCEDURE compute_sla_deadline(
  IN p_severity VARCHAR(10),
  IN p_submitted TIMESTAMP,
  OUT p_deadline TIMESTAMP
)
BEGIN
  CASE p_severity
    WHEN 'critical' THEN
      SET p_deadline = DATE_ADD(p_submitted, INTERVAL 4 HOUR);
    WHEN 'high' THEN
      SET p_deadline = DATE_ADD(p_submitted, INTERVAL 24 HOUR);
    WHEN 'medium' THEN
      SET p_deadline = DATE_ADD(p_submitted, INTERVAL 48 HOUR);
    WHEN 'low' THEN
      SET p_deadline = DATE_ADD(p_submitted, INTERVAL 120 HOUR);
    ELSE
      SET p_deadline = DATE_ADD(p_submitted, INTERVAL 120 HOUR);
  END CASE;
END$$

DELIMITER ;

-- ============================================================================
-- TRIGGER: Auto-log status changes
-- ============================================================================
DELIMITER $$

CREATE TRIGGER trg_status_log
AFTER UPDATE ON complaints
FOR EACH ROW
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO complaint_status_log (
      complaint_id,
      changed_by,
      old_status,
      new_status,
      changed_at
    ) VALUES (
      NEW.complaint_id,
      NEW.assigned_to,
      OLD.status,
      NEW.status,
      NOW()
    );
  END IF;
END$$

DELIMITER ;

-- ============================================================================
-- INDEXES
-- ============================================================================
-- Already created inline above for most tables

-- Verify charset
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE committees CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE complaints CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE complaint_status_log CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE evidence_files CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE feedback CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE audit_logs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
