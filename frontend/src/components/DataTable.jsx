import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * DataTable Component
 * Responsive table component that converts to cards on mobile
 * Features:
 * - Sortable columns
 * - Mobile responsive (table on md+, cards on mobile)
 * - Row click handler
 * - Zebra striping
 */
const DataTable = ({
  columns = [],
  data = [],
  onRowClick = () => {},
  sortable = true,
  responsive = true,
  className = '',
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  const handleSort = (columnKey) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key: columnKey, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Fallback
      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  };

  const sortedData = getSortedData();

  // Desktop Table View
  const DesktopTable = () => (
    <div className="hidden md:block overflow-x-auto border border-[#121212] rounded-none">
      <table className="w-full border-collapse font-['Outfit']">
        <thead>
          <tr className="bg-[#F0F0F0] border-b-2 border-[#121212]">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`
                  px-4 py-3
                  text-left
                  font-bold
                  text-xs
                  uppercase
                  tracking-widest
                  border-r border-[#121212]
                  last:border-r-0
                  text-[#121212]
                  ${sortable ? 'cursor-pointer hover:bg-[#E0E0E0] transition-colors' : ''}
                `}
                onClick={() => handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {sortable && sortConfig.key === column.key && (
                    <span>
                      {sortConfig.direction === 'asc' ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center font-medium text-[#121212]/60"
              >
                No data available
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick(row)}
                className={`
                  border-b border-[#121212]
                  transition-colors
                  cursor-pointer
                  hover:bg-[#1040C0]/5
                  ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-[#F0F0F0]'}
                `}
              >
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.key}`}
                    className="px-4 py-3 text-xs font-medium text-[#121212] border-r border-[#121212] last:border-r-0"
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // Mobile Card View
  const MobileCards = () => (
    <div className="md:hidden space-y-3">
      {sortedData.length === 0 ? (
        <div className="px-4 py-8 text-center font-medium text-[#121212]/60">
          No data available
        </div>
      ) : (
        sortedData.map((row, rowIndex) => (
          <div
            key={rowIndex}
            onClick={() => onRowClick(row)}
            className="
              p-4
              border-2 border-[#121212]
              rounded-none
              bg-white
              cursor-pointer
              transition-all duration-150
              hover:shadow-[4px_4px_0px_0px_#121212]
              active:translate-y-1
              active:shadow-[2px_2px_0px_0px_#121212]
            "
          >
            <div className="space-y-2">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between items-start gap-2">
                  <span className="font-bold text-xs uppercase tracking-widest text-[#121212]">
                    {column.label}
                  </span>
                  <span className="text-xs font-medium text-[#121212]/80 text-right">
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className={`font-['Outfit'] ${className}`}>
      <DesktopTable />
      <MobileCards />
    </div>
  );
};

export default DataTable;
