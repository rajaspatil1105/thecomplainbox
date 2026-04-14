import { useState, useEffect } from 'react';

export const useSLA = (slaDeadline, submittedAt) => {
  const [remaining, setRemaining] = useState(null);
  const [percentage, setPercentage] = useState(100);
  const [isOverdue, setIsOverdue] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState('normal'); // 'normal', 'warning', 'critical', 'overdue'

  useEffect(() => {
    if (!slaDeadline) return;

    const updateTimer = () => {
      const now = new Date();
      const deadline = new Date(slaDeadline);
      const submitted = new Date(submittedAt);

      const timeRemaining = deadline - now;

      if (timeRemaining <= 0) {
        setRemaining('OVERDUE');
        setIsOverdue(true);
        setUrgencyLevel('overdue');
        setPercentage(0);
      } else {
        // Calculate time remaining in hours and minutes
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

        const totalDuration = deadline - submitted;
        const currentPercentage = Math.max(0, (timeRemaining / totalDuration) * 100);
        setPercentage(currentPercentage);

        if (currentPercentage > 50) {
          setUrgencyLevel('normal');
          setRemaining(`${hours}h ${minutes}m`);
        } else if (currentPercentage > 20) {
          setUrgencyLevel('warning');
          setRemaining(`${hours}h ${minutes}m`);
        } else {
          setUrgencyLevel('critical');
          setRemaining(`${hours}h ${minutes}m`);
        }

        setIsOverdue(false);
      }
    };

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [slaDeadline, submittedAt]);

  return {
    remaining,
    percentage,
    isOverdue,
    urgencyLevel,
  };
};
