export const COMPLAINT_STATUSES = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  WAITING_STUDENT: 'waiting_student',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  ESCALATED: 'escalated',
};

export const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  waiting_student: 'Waiting Student',
  resolved: 'Resolved',
  closed: 'Closed',
  escalated: 'Escalated',
};

export const STATUS_COLORS = {
  submitted: '#E0E0E0',
  under_review: '#F0C020',
  assigned: '#1040C0',
  in_progress: '#1040C0',
  waiting_student: '#F0C020',
  resolved: '#107050',
  closed: '#121212',
  escalated: '#D02020',
};

export const STATUS_BADGE_CLASSES = {
  submitted: 'badge-submitted',
  under_review: 'badge-under-review',
  assigned: 'badge-assigned',
  in_progress: 'badge-in-progress',
  waiting_student: 'badge-waiting-student',
  resolved: 'badge-resolved',
  closed: 'badge-closed',
  escalated: 'badge-escalated',
};

export const VALID_STATUS_TRANSITIONS = {
  submitted: ['under_review'],
  under_review: ['assigned', 'in_progress'],
  assigned: ['in_progress', 'waiting_student'],
  in_progress: ['waiting_student', 'resolved'],
  waiting_student: ['in_progress', 'resolved'],
  resolved: ['closed'],
};
