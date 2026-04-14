import React from 'react';

/**
 * PasswordStrengthBar Component
 * 4-segment password strength indicator
 */
const PasswordStrengthBar = ({ password = '', className = '' }) => {
  const calculateStrength = (pwd) => {
    if (!pwd) return 0;

    let strength = 0;

    // Check length
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;

    // Check for uppercase
    if (/[A-Z]/.test(pwd)) strength++;

    // Check for lowercase
    if (/[a-z]/.test(pwd)) strength++;

    // Check for numbers
    if (/\d/.test(pwd)) strength++;

    // Check for special characters
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++;

    // Cap at 4 segments
    return Math.min(4, Math.ceil(strength / 1.5));
  };

  const strength = calculateStrength(password);

  const getStrengthLabel = () => {
    switch (strength) {
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const getSegmentColor = (index) => {
    if (index < strength) {
      if (strength === 1) return 'bg-[#D02020]';
      if (strength === 2) return 'bg-[#F0C020]';
      if (strength === 3) return 'bg-[#1040C0]';
      if (strength === 4) return 'bg-[#107050]';
    }
    return 'bg-[#E0E0E0]';
  };

  return (
    <div className={className}>
      {/* Strength Bar */}
      <div className="flex gap-1 mb-2">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`
              flex-1
              h-1
              border border-[#121212]
              rounded-none
              transition-colors duration-200
              ${getSegmentColor(index)}
            `}
          />
        ))}
      </div>

      {/* Strength Label */}
      <p className="font-['Outfit'] text-xs font-bold uppercase tracking-widest text-[#121212]">
        {getStrengthLabel()}
      </p>
    </div>
  );
};

export default PasswordStrengthBar;
