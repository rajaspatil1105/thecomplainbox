import React from 'react';

/**
 * Card Component
 * Base card component with Bauhaus styling
 */
const Card = ({
  children,
  className = '',
  clickable = false,
  hover = true,
  ...props
}) => {
  const baseClass = 'card';
  const hoverClass = (clickable || hover) ? 'card-hover' : '';
  
  return (
    <div
      className={`${baseClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
