"use client";

import { ReactNode } from "react";
import { Pagination } from "@/components/Pagination";

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyMessage?: string;
  emptyMessageClassName?: string;
  onRowClick?: (item: T, index: number) => void;
  rowClassName?: (item: T, index: number) => string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  loading?: boolean;
  loadingRowsCount?: number;
  maxHeight?: string;
  stickyHeader?: boolean;
  // Refresh props
  onRefresh?: () => void;
  isRefetching?: boolean;
  // Results info props
  total?: number;
  resultsInfo?: string | ReactNode;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No data available",
  emptyMessageClassName = "",
  onRowClick,
  rowClassName,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  loading = false,
  loadingRowsCount = 5,
  maxHeight = "500px",
  stickyHeader = true,
  onRefresh,
  isRefetching = false,
  total,
  resultsInfo,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
}: TableProps<T>) {
  const defaultRowClassName = (item: T, index: number) => {
    const baseClasses =
      "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors";
    const customClasses = rowClassName ? rowClassName(item, index) : "";
    const clickableClasses = onRowClick ? "cursor-pointer" : "";
    return `${baseClasses} ${customClasses} ${clickableClasses}`.trim();
  };

  const showPagination =
    currentPage !== undefined &&
    totalPages !== undefined &&
    onPageChange !== undefined;

  const renderSkeletonCell = (column: TableColumn<T>, index: number) => {
    // Vary skeleton width for visual interest based on column index
    const widths = ["w-12", "w-24", "w-32", "w-40", "w-20"];
    const width = widths[index % widths.length];

    return (
      <td
        key={column.key}
        className={`px-6 py-4 text-sm ${column.className || ""}`}
      >
        <div
          className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${width}`}
        />
      </td>
    );
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        {(total !== undefined || resultsInfo) && (
          <div className="mb-4 text-xs text-gray-600 dark:text-gray-400">
            {resultsInfo ||
              (total !== undefined &&
                `Showing ${data.length} of ${total} ${total === 1 ? "item" : "items"}`)}
          </div>
        )}

        {onRefresh && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={onRefresh}
              disabled={loading || isRefetching}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="Refresh data"
            >
              <svg
                className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        )}
      </div>

      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden`}
      >
        <div
          className="overflow-auto"
          style={{
            maxHeight: maxHeight ? maxHeight : undefined,
            overflowY: maxHeight ? "auto" : undefined,
          }}
        >
          <table className="w-full">
            <thead
              className={`bg-gray-50 dark:bg-gray-900 ${
                stickyHeader ? "sticky top-0 z-10" : ""
              } ${headerClassName}`}
            >
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900 ${
                      column.headerClassName || ""
                    }`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              className={`bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 ${bodyClassName}`}
            >
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: loadingRowsCount }).map((_, rowIndex) => (
                  <tr key={`skeleton-${rowIndex}`}>
                    {columns.map((column, colIndex) =>
                      renderSkeletonCell(column, colIndex)
                    )}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className={`px-6 py-8 text-center text-gray-500 dark:text-gray-400 ${emptyMessageClassName}`}
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={keyExtractor(item, index)}
                    className={defaultRowClassName(item, index)}
                    onClick={() => onRowClick?.(item, index)}
                  >
                    {columns.map((column) => {
                      const cellContent = column.render
                        ? column.render(item, index)
                        : (() => {
                            const rawValue = (item as Record<string, unknown>)[
                              column.key
                            ];
                            if (rawValue === null || rawValue === undefined) {
                              return "";
                            }
                            if (
                              typeof rawValue === "string" ||
                              typeof rawValue === "number" ||
                              typeof rawValue === "boolean"
                            ) {
                              return String(rawValue);
                            }
                            return JSON.stringify(rawValue);
                          })();

                      return (
                        <td
                          key={column.key}
                          className={`px-6 py-4 text-sm ${column.className || ""}`}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={pageSizeOptions}
          />
        </div>
      )}
    </div>
  );
}
