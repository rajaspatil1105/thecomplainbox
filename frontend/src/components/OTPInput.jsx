import React, { useEffect } from 'react';

/**
 * OTPInput Component
 * 6 individual input boxes with auto-focus and backspace handling
 */
const OTPInput = ({ value = '', onChange, onComplete }) => {
  const [otp, setOtp] = React.useState(value.split('').slice(0, 6));
  const inputRefs = React.useRef([]);

  useEffect(() => {
    setOtp(value.split('').slice(0, 6).padEnd(6, ''));
  }, [value]);

  const handleChange = (index, event) => {
    const val = event.target.value;

    // Only allow digits
    if (!/^\d?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    const otpString = newOtp.join('');
    onChange(otpString);

    // Auto-focus next input on digit entry
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all digits entered
    if (otpString.length === 6 && onComplete) {
      onComplete(otpString);
    }
  };

  const handleKeyDown = (index, event) => {
    const key = event.key;

    // Backspace: move to previous input
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow keys for navigation
    if (key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {[...Array(6)].map((_, index) => (
        <input
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          type="text"
          inputMode="numeric"
          maxLength="1"
          value={otp[index] || ''}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="
            w-12 h-12 md:w-14 md:h-14
            text-center
            text-2xl
            font-['Outfit']
            font-black
            border-2 border-[#121212]
            rounded-none
            focus:border-[#1040C0]
            focus:outline-none
            focus:bg-[#1040C0]/5
            transition-colors duration-200
            bg-white
          "
        />
      ))}
    </div>
  );
};

export default OTPInput;
