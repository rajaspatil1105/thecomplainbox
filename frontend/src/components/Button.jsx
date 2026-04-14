import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Button Component
 * Bauhaus design system - all variants with proper styling
 */
const Button = ({
  children,
  variant = 'primary', // primary, secondary, yellow, outline, ghost
  size = 'md', // sm, md, lg
  className = '',
  isLoading = false,
  disabled = false,
  type = 'button',
  pill = false,
  ...props
}) => {
  // Variant classes
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    yellow: 'btn-yellow',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  const pillClass = pill ? 'btn-pill' : '';
  const disabledClass = disabled || isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`
        flex items-center justify-center gap-2
        font-['Outfit'] font-bold
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${pillClass}
        ${disabledClass}
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export default Button;
