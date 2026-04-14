import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * Modal Component
 * Reusable modal with Bauhaus styling and animations
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md', // sm, md, lg
  closeButton = true,
  backdrop = true,
  className = '',
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <>
      {/* Backdrop */}
      {backdrop && (
        <div
          className="fixed inset-0 bg-black/70 z-40"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className={`
            bg-white border-4 border-[#121212]
            shadow-[12px_12px_0px_0px_#121212]
            relative
            ${sizeClasses[size]}
            w-full
            max-h-[90vh]
            overflow-y-auto
            animate-fade-in-up
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="bg-[#1040C0] text-white p-6 border-b-4 border-[#121212] flex justify-between items-center">
              <h2 className="font-['Outfit'] font-bold uppercase text-xl tracking-widest">
                {title}
              </h2>
              {closeButton && (
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-[#1040C0]/80 rounded-none transition-colors"
                  aria-label="Close modal"
                >
                  <X size={24} className="text-white" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6 lg:p-8">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t-4 border-[#121212] p-6 lg:p-8 bg-[#F0F0F0] flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
