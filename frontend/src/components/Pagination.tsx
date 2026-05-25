import React, { useMemo } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

/**
 * ISOLATED Pagination Component
 * 
 * Performance Optimization:
 * - Fully memoized with React.memo
 * - useMemo for pagination range calculation (already implemented)
 * - Only re-renders when page/totalPages changes
 * - Does NOT re-render when other states change
 */
interface PaginationProps {
  page: number;
  totalPages: number;
  loading: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onPageClick: (pageNum: number) => void;
}

export const Pagination = React.memo(({
  page,
  totalPages,
  loading,
  onPrevious,
  onNext,
  onPageClick,
}: PaginationProps) => {
  // Memoize pagination range - only recalculates when page/totalPages change
  const paginationRange = useMemo(() => {
    const maxVisible = Math.min(5, totalPages);
    const start = Math.max(0, Math.min(page - 2, totalPages - maxVisible));
    const end = Math.min(start + maxVisible, totalPages);
    
    return { start, end, maxVisible };
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          disabled={page === 0 || loading}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        <div className="flex items-center space-x-1">
          {/* Page numbers - using memoized range calculation */}
          <>
            {/* First page button only if gap exists */}
            {paginationRange.start > 0 && (
              <>
                <button
                  onClick={() => onPageClick(0)}
                  disabled={loading}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  1
                </button>
                {paginationRange.start > 1 && <span className="px-2 text-gray-500">...</span>}
              </>
            )}

            {/* Render only pages from start to end - single continuous range */}
            {Array.from({ length: paginationRange.end - paginationRange.start }, (_, i) => {
              const pageNum = paginationRange.start + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageClick(pageNum)}
                  disabled={loading}
                  className={`px-3 py-2 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    pageNum === page
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}

            {/* Last page button only if gap exists */}
            {paginationRange.end < totalPages && (
              <>
                {paginationRange.end < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
                <button
                  onClick={() => onPageClick(totalPages - 1)}
                  disabled={loading}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {totalPages}
                </button>
              </>
            )}
          </>
        </div>

        <button
          onClick={onNext}
          disabled={page >= totalPages - 1 || loading}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <HiChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';
