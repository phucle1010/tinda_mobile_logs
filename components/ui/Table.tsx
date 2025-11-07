"use client";

import { ReactNode, useEffect, useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { AutoRefreshToggle } from "@/components/common/AutoRefreshToggle";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { ColumnCustomizer } from "@/components/common/ColumnCustomizer";

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortKey?: string;
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
  // Export props
  onExportCSV?: () => void;
  onExportJSON?: () => void;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  // Auto-refresh props
  enableAutoRefresh?: boolean;
  onAutoRefresh?: () => void;
  // Sort props
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (sortKey: string, sortOrder: "asc" | "desc") => void;
  // Column customization props
  enableColumnCustomization?: boolean;
  defaultColumns?: Array<{ key: string; header: string }>;
  columnConfigs?: Array<{ key: string; visible: boolean; order: number }>;
  onColumnConfigChange?: (configs: Array<{ key: string; visible: boolean; order: number }>) => void;
  // Virtual scrolling props
  enableVirtualScrolling?: boolean;
  useVirtualScrolling?: boolean;
  onVirtualScrollingChange?: (enabled: boolean) => void;
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
  onExportCSV,
  onExportJSON,
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions,
  enableAutoRefresh = false,
  onAutoRefresh,
  sortBy,
  sortOrder,
  onSort,
  enableColumnCustomization = false,
  defaultColumns,
  columnConfigs,
  onColumnConfigChange,
  enableVirtualScrolling = false,
  useVirtualScrolling = false,
  onVirtualScrollingChange,
}: TableProps<T>) {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);

  // Auto-refresh effect
  useEffect(() => {
    if (
      enableAutoRefresh &&
      autoRefresh &&
      refreshInterval > 0 &&
      onAutoRefresh
    ) {
      const interval = setInterval(() => {
        onAutoRefresh();
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [enableAutoRefresh, autoRefresh, refreshInterval, onAutoRefresh]);

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
      {/* Table Controls - Responsive Layout */}
      <div className="mb-4 space-y-3">
        {/* Results Info */}
        <div className="flex items-center justify-between">
          {(total !== undefined || resultsInfo) && (
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {resultsInfo ||
                (total !== undefined &&
                  `Showing ${data.length} of ${total} ${total === 1 ? "item" : "items"}`)}
            </div>
          )}
        </div>

        {/* Controls - Responsive Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          {/* Left Side - Auto-refresh & Column Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Auto-refresh Toggle */}
            {enableAutoRefresh && (
              <div className="flex-shrink-0">
                <AutoRefreshToggle
                  enabled={autoRefresh}
                  interval={refreshInterval}
                  onToggle={setAutoRefresh}
                  onIntervalChange={setRefreshInterval}
                />
              </div>
            )}

            {/* Column Customization & Virtual Scrolling */}
            {(enableColumnCustomization || enableVirtualScrolling) && (
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {enableColumnCustomization && defaultColumns && (
                  <Button
                    onClick={() => setShowColumnCustomizer(true)}
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm"
                    title="Customize Columns"
                  >
                    <span className="hidden sm:inline">Customize Columns</span>
                    <span className="sm:hidden">Columns</span>
                  </Button>
                )}
                {enableVirtualScrolling && onVirtualScrollingChange && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={useVirtualScrolling}
                      onChange={onVirtualScrollingChange}
                      label="Virtual Scrolling"
                      size="sm"
                      className="hidden sm:flex"
                    />
                    <div title="Virtual Scrolling" className="sm:hidden">
                      <Switch
                        checked={useVirtualScrolling}
                        onChange={onVirtualScrollingChange}
                        label=""
                        size="sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Export & Refresh */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Export Buttons */}
            {(onExportCSV || onExportJSON) && (
              <div className="flex items-center gap-2">
                {onExportCSV && (
                  <Button
                    onClick={onExportCSV}
                    disabled={loading || data.length === 0}
                    variant="success"
                    size="sm"
                    title="Export to CSV"
                    className="text-xs sm:text-sm"
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    }
                  >
                    <span className="hidden sm:inline">CSV</span>
                    <span className="sm:hidden">CSV</span>
                  </Button>
                )}
                {onExportJSON && (
                  <Button
                    onClick={onExportJSON}
                    disabled={loading || data.length === 0}
                    variant="info"
                    size="sm"
                    title="Export to JSON"
                    className="text-xs sm:text-sm"
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    }
                  >
                    <span className="hidden sm:inline">JSON</span>
                    <span className="sm:hidden">JSON</span>
                  </Button>
                )}
              </div>
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <Button
                onClick={onRefresh}
                disabled={loading || isRefetching}
                isLoading={isRefetching}
                variant="primary"
                size="sm"
                title="Refresh data"
                className="text-xs sm:text-sm"
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                }
              >
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}
          </div>
        </div>
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
                {columns.map((column) => {
                  const isSortable = column.sortable !== false && onSort;
                  const sortKey = column.sortKey || column.key;
                  const isCurrentSort = sortBy === sortKey;
                  const currentSortOrder = isCurrentSort ? sortOrder : undefined;

                  const handleSortClick = () => {
                    if (isSortable && onSort) {
                      const newOrder =
                        isCurrentSort && currentSortOrder === "asc"
                          ? "desc"
                          : "asc";
                      onSort(sortKey, newOrder);
                    }
                  };

                  return (
                    <th
                      key={column.key}
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900 ${
                        column.headerClassName || ""
                      } ${
                        isSortable
                          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 select-none"
                          : ""
                      }`}
                      onClick={isSortable ? handleSortClick : undefined}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.header}</span>
                        {isSortable && (
                          <span className="text-gray-400 dark:text-gray-500">
                            {isCurrentSort ? (
                              currentSortOrder === "asc" ? (
                                <span>↑</span>
                              ) : (
                                <span>↓</span>
                              )
                            ) : (
                              <span className="opacity-30">⇅</span>
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
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

      {/* Column Customizer */}
      {showColumnCustomizer && defaultColumns && (
        <ColumnCustomizer
          columns={defaultColumns}
          configs={columnConfigs || defaultColumns.map((col, i) => ({
            key: col.key,
            visible: true,
            order: i,
          }))}
          onConfigChange={(configs) => {
            onColumnConfigChange?.(configs);
            setShowColumnCustomizer(false);
          }}
          onClose={() => setShowColumnCustomizer(false)}
        />
      )}
    </div>
  );
}
