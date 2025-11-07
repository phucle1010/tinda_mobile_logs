"use client";

import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = "",
}: PaginationProps) {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    onPageChange(1);
  };

  const handleLast = () => {
    onPageChange(totalPages);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
    >
      {/* Page Info and Page Size Selector */}
      <div className="flex items-center gap-4">
        {/* Page Info */}
        {totalPages > 0 && (
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        )}

        {/* Page Size Selector */}
        {onPageSizeChange && pageSize && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
              Per page:
            </label>
            <div className="w-20">
              <Select
                value={pageSize}
                onChange={(value) => onPageSizeChange(Number(value))}
                options={pageSizeOptions}
                size="sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* First Page Button */}
          <Button
            onClick={handleFirst}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            aria-label="First page"
            className="px-2"
            leftIcon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            }
          />

          {/* Previous Button */}
          <Button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
            aria-label="Previous page"
          >
            Previous
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => {
              if (page === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1.5 text-xs text-gray-500 dark:text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <Button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  variant={isActive ? "primary" : "outline"}
                  size="sm"
                  className="min-w-[32px]"
                  aria-label={`Page ${pageNum}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            aria-label="Next page"
          >
            Next
          </Button>

          {/* Last Page Button */}
          <Button
            onClick={handleLast}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
            className="px-2"
            aria-label="Last page"
            leftIcon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            }
          />
        </div>
      )}
    </div>
  );
}
