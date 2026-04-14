import React from 'react';
import { useSLA } from '../hooks/useSLA';

/**
 * SLA Countdown Component
 * Displays countdown timer to SLA deadline with color-coded urgency
 */
const SLACountdown = ({ slaDeadline, submittedAt, className = '' }) => {
  const { remaining, urgencyLevel, isOverdue } = useSLA(slaDeadline, submittedAt);

  // Color classes based on urgency
  const colorClasses = {
    normal: 'text-[#107050]',
    warning: 'text-[#C06000] animate-pulse',
    critical: 'text-[#D02020] animate-pulse',
    overdue: 'text-[#D02020] font-black',
  };

  return (
    <div className={`font-['Outfit'] font-black text-2xl tabular-nums ${colorClasses[urgencyLevel]} ${className}`}>
      {remaining}
    </div>
  );
};

export default SLACountdown;
