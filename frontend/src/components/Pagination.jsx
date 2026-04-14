import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination Component
 * Displays page navigation and results info
 */
const Pagination = ({
  total = 0,
  page = 1,
  limit = 10,
  onPageChange = () => {},
  className = '',
  showPageSize = true,
}) => {
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  const handlePageSizeChange = (e) => {
    // Note: This should be handled by parent component
    // triggering a recalculation of pages and reset to page 1
  };

  return (
    <div
      className={`
        flex flex-col sm:flex-row items-center justify-between gap-4
        px-4 py-3 border-t border-[#121212]
        bg-[#F0F0F0]
        font-['Outfit']
        ${className}
      `}
    >
      {/* Results Info */}
      <div className="text-xs font-medium text-[#121212]">
        {total === 0 ? (
          <span>No results</span>
        ) : (
          <span>
            Showing <span className="font-bold">{startIndex}</span> to{' '}
            <span className="font-bold">{endIndex}</span> of{' '}
            <span className="font-bold">{total}</span> results
          </span>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={page === 1 || totalPages === 0}
          className={`
            p-2
            border-2 border-[#121212]
            rounded-none
            font-['Outfit'] font-medium text-xs
            transition-all duration-150
            ${
              page === 1 || totalPages === 0
                ? 'bg-[#E0E0E0] text-[#121212]/50 cursor-not-allowed'
                : 'bg-white text-[#121212] hover:bg-[#121212] hover:text-white hover:shadow-[4px_4px_0px_0px_#121212] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#121212]'
            }
          `}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Indicator */}
        <div className="flex items-center gap-1 px-3 py-2 border border-[#121212] rounded-none bg-white">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={page}
            onChange={(e) => {
              const newPage = parseInt(e.target.value) || 1;
              if (newPage >= 1 && newPage <= totalPages) {
                onPageChange(newPage);
              }
            }}
            className="w-10 text-center font-bold text-[#121212] bg-transparent focus:outline-none"
          />
          <span className="text-xs font-medium text-[#121212]">
            / {totalPages}
          </span>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={page === totalPages || totalPages === 0}
          className={`
            p-2
            border-2 border-[#121212]
            rounded-none
            font-['Outfit'] font-medium text-xs
            transition-all duration-150
            ${
              page === totalPages || totalPages === 0
                ? 'bg-[#E0E0E0] text-[#121212]/50 cursor-not-allowed'
                : 'bg-white text-[#121212] hover:bg-[#121212] hover:text-white hover:shadow-[4px_4px_0px_0px_#121212] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#121212]'
            }
          `}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Responsive: Hide info on very small screens */}
      {/* This is handled by the mobile-first responsive classes above */}
    </div>
  );
};

export default Pagination;
