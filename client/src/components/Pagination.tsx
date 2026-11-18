import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  isLoading = false,
}) => {
  // If there are no items at all, don't show pagination controls
  if (totalCount === 0) return null;

  const validTotalPages = Math.max(1, totalPages);
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (validTotalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= validTotalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const leftBound = Math.max(2, currentPage - 1);
      const rightBound = Math.min(validTotalPages - 1, currentPage + 1);

      if (leftBound > 2) {
        pages.push('...');
      }

      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      if (rightBound < validTotalPages - 1) {
        pages.push('...');
      }

      pages.push(validTotalPages);
    }

    return pages;
  };

  return (
    <div className="glass-panel px-4 py-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs select-none">
      {/* Range Info */}
      <div className="text-slate-400 font-medium order-2 sm:order-1 text-center sm:text-left">
        Showing <span className="font-semibold text-slate-200">{startItem}</span> to{' '}
        <span className="font-semibold text-slate-200">{endItem}</span> of{' '}
        <span className="font-semibold text-slate-200">{totalCount}</span> results
      </div>

      {/* Page Navigation & Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2 order-1 sm:order-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
          aria-label="Previous Page"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            currentPage <= 1 || isLoading
              ? 'border-slate-800 text-slate-600 bg-slate-900/30 cursor-not-allowed'
              : 'border-slate-700/80 text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white cursor-pointer shadow-sm'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Pills */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((item, index) => {
            if (item === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 py-1 text-slate-500 font-medium select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(item);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                disabled={isActive || isLoading}
                className={`min-w-[32px] h-8 flex items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 cursor-default'
                    : 'bg-slate-900/70 hover:bg-slate-800 text-slate-300 border border-slate-800/90 hover:border-slate-700 cursor-pointer'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= validTotalPages || isLoading}
          aria-label="Next Page"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            currentPage >= validTotalPages || isLoading
              ? 'border-slate-800 text-slate-600 bg-slate-900/30 cursor-not-allowed'
              : 'border-slate-700/80 text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white cursor-pointer shadow-sm'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Page Size Selector */}
      {onPageSizeChange && (
        <div className="flex items-center gap-2 order-3">
          <span className="text-slate-400 text-xs hidden md:inline">Per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={isLoading}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-brand-500 outline-none font-medium cursor-pointer"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
