import React from 'react';
import { STATUS_BADGE_CLASSES, PRIORITY_COLORS } from '../constants/statuses';

/**
 * Badge Component
 * Displays status and priority badges with Bauhaus styling
 */

export const StatusBadge = ({ status, className = '' }) => {
  const badgeClass = STATUS_BADGE_CLASSES[status] || 'badge-submitted';
  
  return (
    <span className={`badge-status ${badgeClass} ${className}`}>
      {status?.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
};

export const PriorityBadge = ({ priority, className = '' }) => {
  const priorityMap = {
    P1: 'badge-p1',
    P2: 'badge-p2',
    P3: 'badge-p3',
    P4: 'badge-p4',
  };

  const badgeClass = priorityMap[priority] || 'badge-p4';

  return (
    <span className={`badge-status ${badgeClass} ${className}`}>
      {priority}
    </span>
  );
};

export const SeverityBadge = ({ severity, className = '' }) => {
  const severityMap = {
    low: 'bg-[#E0E0E0] text-black',
    medium: 'bg-[#F0C020] text-black',
    high: 'bg-[#C06000] text-white',
    critical: 'bg-[#D02020] text-white',
  };

  const bgClass = severityMap[severity] || 'bg-[#E0E0E0] text-black';

  return (
    <span className={`badge-status ${bgClass} ${className}`}>
      {severity?.toUpperCase()}
    </span>
  );
};

export const CategoryBadge = ({ category, className = '' }) => {
  return (
    <span className={`badge-status bg-[#1040C0] text-white ${className}`}>
      {category}
    </span>
  );
};

export default StatusBadge;
