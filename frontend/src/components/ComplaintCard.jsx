import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckSquare, Square } from 'lucide-react';
import Card from './Card';
import { StatusBadge, PriorityBadge, CategoryBadge } from './Badge';
import SLACountdown from './SLACountdown';
import { formatDistanceToNow } from 'date-fns';

/**
 * ComplaintCard Component
 * Displays complaint summary in grid/list view with all required elements
 */

// Geometric accent shapes by priority
const GeometricAccent = ({ priority }) => {
  const shapeColors = {
    P1: '#D02020',
    P2: '#1040C0',
    P3: '#F0C020',
    P4: '#107050',
  };

  const bgColor = shapeColors[priority] || '#D02020';

  return (
    <div
      className="absolute top-4 right-4 w-2 h-2 border-2 border-[#121212]"
      style={{ backgroundColor: bgColor }}
    />
  );
};

const STATUS_STEPS = [
  'submitted',
  'under_review',
  'in_progress',
  'waiting_student',
  'resolved',
  'closed',
];

const STEP_LABELS = {
  submitted: 'Submitted',
  under_review: 'Review',
  in_progress: 'In Progress',
  waiting_student: 'Need Student',
  resolved: 'Resolved',
  closed: 'Closed',
};

const getStatusStepIndex = (currentStatus) => {
  if (currentStatus === 'assigned') {
    return STATUS_STEPS.indexOf('in_progress');
  }

  if (currentStatus === 'escalated') {
    return STATUS_STEPS.indexOf('in_progress');
  }

  const idx = STATUS_STEPS.indexOf(currentStatus);
  return idx === -1 ? 0 : idx;
};

const ComplaintCard = ({
  complaint,
  onClick,
  className = '',
}) => {
  const [showStatusSteps, setShowStatusSteps] = useState(false);
  const navigate = useNavigate();
  const {
    complaint_id,
    title,
    status,
    priority,
    category,
    sla_deadline,
    submitted_at,
    is_anonymous,
  } = complaint;
  const studentVisibleStatus = status === 'assigned' ? 'in_progress' : status;
  const currentStepIndex = getStatusStepIndex(status);

  const handleClick = () => {
    if (onClick) {
      onClick(complaint);
    } else {
      navigate(`/complaints/${complaint_id}`);
    }
  };

  return (
    <Card
      clickable
      className={`relative overflow-hidden p-6 card-hover ${className}`}
      onClick={handleClick}
    >
      {/* Geometric Accent */}
      <GeometricAccent priority={priority} />

      {/* Priority Stripe */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 border-l-4`}
        style={{
          borderLeftColor: priority === 'P1' ? '#D02020' : priority === 'P2' ? '#C06000' : priority === 'P3' ? '#F0C020' : '#107050',
        }}
      />

      {/* Top Row: Status + Check Status + Priority */}
      <div className="flex justify-between items-start mb-4 pr-8">
        <div className="flex items-center gap-2">
          <StatusBadge status={studentVisibleStatus} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowStatusSteps((prev) => !prev);
            }}
            className="px-2 py-1 border-2 border-[#121212] bg-white text-[#121212] font-black text-[10px] uppercase tracking-widest hover:bg-[#121212] hover:text-white transition-colors"
          >
            Check Status
          </button>
        </div>
        <PriorityBadge priority={priority} />
      </div>

      {showStatusSteps && (
        <div className="mb-3 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
          {STATUS_STEPS.map((step, idx) => {
            const isDone = idx <= currentStepIndex;
            const isActive = step === studentVisibleStatus;

            return (
              <div
                key={step}
                className={`flex items-center gap-1 px-2 py-1 border ${
                  isActive ? 'border-[#1040C0] bg-[#1040C0]/10' : 'border-[#121212]/30 bg-white'
                }`}
              >
                {isDone ? (
                  <CheckSquare size={14} className={isActive ? 'text-[#1040C0]' : 'text-[#107050]'} />
                ) : (
                  <Square size={14} className="text-[#121212]/40" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#121212]">
                  {STEP_LABELS[step]}
                </span>
              </div>
            );
          })}

          {status === 'escalated' && (
            <div className="flex items-center gap-1 px-2 py-1 border border-[#D02020] bg-[#D02020]/10">
              <CheckSquare size={14} className="text-[#D02020]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D02020]">
                Escalated
              </span>
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <h3 className="font-['Outfit'] font-bold text-xl text-[#121212] mb-2 line-clamp-2">
        {title}
      </h3>

      {/* Anonymous Badge */}
      {is_anonymous && (
        <div className="flex items-center gap-1 mb-2">
          <Lock size={14} className="text-[#121212]" />
          <span className="font-['Outfit'] text-xs font-bold uppercase tracking-widest px-2 py-1 border-2 border-[#121212] rounded-full bg-white text-[#121212]">
            Anonymous
          </span>
        </div>
      )}

      {/* Category */}
      <div className="flex items-center gap-2 mb-3">
        <CategoryBadge category={category} />
      </div>

      {/* SLA Progress Bar */}
      <div className="mb-3 h-1 bg-[#E0E0E0] border border-[#121212]">
        <div
          className="h-full"
          style={{
            width: complaint.sla_percentage ? `${complaint.sla_percentage}%` : '100%',
            backgroundColor: complaint.urgencyLevel === 'normal' ? '#107050' : complaint.urgencyLevel === 'warning' ? '#C06000' : '#D02020',
          }}
        />
      </div>

      {/* Bottom Row: Submitted Date + SLA */}
      <div className="flex justify-between items-center text-xs font-['Outfit'] text-[#666666]">
        <span>
          {formatDistanceToNow(new Date(submitted_at), { addSuffix: true })}
        </span>
        <div className="text-right">
          <SLACountdown slaDeadline={sla_deadline} submittedAt={submitted_at} className="text-xs" />
        </div>
      </div>
    </Card>
  );
};

export default ComplaintCard;
