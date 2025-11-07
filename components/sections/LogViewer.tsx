"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useLogs } from "@/actions/useLogs";
import { useLogStats } from "@/actions/useLogStats";
import { MetadataSidebar } from "@/components/sections/MetadataSidebar";
import { Table, type TableColumn } from "@/components/ui/Table";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { LogLevelStats } from "@/components/sections/LogLevelStats";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

import type { Log, LogLevel, LogsQueryParams } from "@/types/log";
import { formatDate, getDeviceInfo, truncateText } from "@/utils/format";
import {
  exportToCSV,
  exportToJSON,
  copyLogToClipboard,
  copyLogId,
} from "@/utils/export";

const LOG_LEVELS: LogLevel[] = ["ERROR", "WARN", "INFO", "DEBUG"];

// Define URL query parsers
const parsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  level: parseAsString.withDefault("ALL"),
  search: parseAsString.withDefault(""),
  sortBy: parseAsString.withDefault("created_at"),
  sortOrder: parseAsString.withDefault("desc"),
  dateFrom: parseAsString,
  dateTo: parseAsString,
};

export function LogViewer() {
  const [params, setParams] = useQueryStates(parsers);
  const [searchInput, setSearchInput] = useState(params.search || "");
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    setSearchInput(params.search || "");
  }, [params.search]);

  const logsQueryParams = {
    ...params,
    level:
      params.level === "ALL" ||
      params.level === "ERROR" ||
      params.level === "WARN" ||
      params.level === "INFO" ||
      params.level === "DEBUG"
        ? params.level
        : "ALL",
    dateFrom: params.dateFrom || undefined,
    dateTo: params.dateTo || undefined,
  };

  const { data, isLoading, isError, error, refetch, isRefetching } = useLogs(
    logsQueryParams as LogsQueryParams
  );

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useLogStats();

  const handleAutoRefresh = () => {
    refetch();
    refetchStats();
  };

  const logs = useMemo(
    () => (Array.isArray(data?.logs) ? (data.logs as Log[]) : []),
    [data]
  );
  const total = useMemo(
    () => (typeof data?.total === "number" ? data.total : 0),
    [data]
  );
  const totalPages = useMemo(
    () => (typeof data?.totalPages === "number" ? data.totalPages : 0),
    [data]
  );

  const stats = useMemo(() => {
    if (statsData) {
      return statsData;
    }
    // Fallback to zero stats if not loaded yet
    return {
      ERROR: 0,
      WARN: 0,
      INFO: 0,
      DEBUG: 0,
      total: 0,
    };
  }, [statsData]);

  const handleSearch = () => {
    setParams({
      search: searchInput,
      page: 1,
    });
  };

  const handleLevelFilter = (level: LogLevel | "ALL") => {
    setParams({
      level,
      page: 1,
    });
  };

  const handleSort = (sortBy: "created_at" | "level") => {
    setParams({
      sortBy,
      sortOrder:
        params.sortBy === sortBy && params.sortOrder === "desc"
          ? "asc"
          : "desc",
      page: 1,
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handlePageChange = (page: number) => {
    setParams({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setParams({ pageSize, page: 1 });
  };

  const handleDateChange = (dateFrom?: string, dateTo?: string) => {
    setParams({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      page: 1,
    });
  };

  const handleExportCSV = () => {
    exportToCSV(logs);
  };

  const handleExportJSON = () => {
    exportToJSON(logs);
  };

  const handleCopyLog = async (log: Log) => {
    await copyLogToClipboard(log);
    setCopySuccess(log.id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleCopyLogId = async (logId: string) => {
    await copyLogId(logId);
    setCopySuccess(logId);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleViewMeta = useCallback((log: Log) => {
    setSelectedLog(log);
    setIsSidebarOpen(true);
  }, []);

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    // Clear selected log after animation completes
    setTimeout(() => {
      setSelectedLog(null);
    }, 300);
  };

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "ERROR":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "WARN":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "INFO":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "DEBUG":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const columns: TableColumn<Log>[] = useMemo(
    () => [
      {
        key: "no",
        header: "No",
        className: "whitespace-nowrap text-gray-500 dark:text-gray-400",
        render: (_, index) => (params.page - 1) * params.pageSize + index + 1,
      },
      {
        key: "created_at",
        header: "Created At",
        className: "whitespace-nowrap text-gray-500 dark:text-gray-400",
        render: (log) => formatDate(log.created_at),
      },
      {
        key: "level",
        header: "Level",
        className: "whitespace-nowrap",
        render: (log) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(
              log.level
            )}`}
          >
            {log.level}
          </span>
        ),
      },
      {
        key: "message",
        header: "Message",
        render: (log) => (
          <div className="text-gray-900 dark:text-gray-100 max-w-md break-words line-clamp-1">
            {log.message}
          </div>
        ),
      },
      {
        key: "meta",
        header: "Meta",
        headerClassName: "min-w-60",
        render: (log) => (
          <div className="flex items-center gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleViewMeta(log);
              }}
              variant="ghost"
              size="sm"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline p-0 h-auto break-all line-clamp-1 text-left"
            >
              {truncateText(getDeviceInfo(log.meta) || "View Meta", 30)}
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCopyLogId(log.id);
              }}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Copy log ID"
              leftIcon={
                copySuccess === log.id ? (
                  <svg
                    className="w-4 h-4 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )
              }
            />
          </div>
        ),
      },
    ],
    [params.page, params.pageSize, copySuccess, handleViewMeta, handleCopyLogId]
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Log Viewer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and filter application logs
        </p>
      </div>

      {!statsLoading && statsData && <LogLevelStats stats={stats} />}

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search logs by message..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <Button onClick={handleSearch} variant="primary" size="md">
              Search
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <DateRangeFilter
            dateFrom={params.dateFrom || undefined}
            dateTo={params.dateTo || undefined}
            onDateChange={handleDateChange}
          />

          <div className="w-32">
            <Select
              label="Level"
              value={params.level || "ALL"}
              onChange={(value) => handleLevelFilter(value as LogLevel | "ALL")}
              options={[
                { value: "ALL", label: "All" },
                ...LOG_LEVELS.map((level) => ({ value: level, label: level })),
              ]}
              size="sm"
            />
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Sort by:</span>
          <Button
            onClick={() => handleSort("created_at")}
            variant={params.sortBy === "created_at" ? "primary" : "ghost"}
            size="sm"
            className={
              params.sortBy === "created_at"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                : ""
            }
          >
            Date
            {params.sortBy === "created_at" &&
              (params.sortOrder === "asc" ? " ↑" : " ↓")}
          </Button>
          <Button
            onClick={() => handleSort("level")}
            variant={params.sortBy === "level" ? "primary" : "ghost"}
            size="sm"
            className={
              params.sortBy === "level"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                : ""
            }
          >
            Level
            {params.sortBy === "level" &&
              (params.sortOrder === "asc" ? " ↑" : " ↓")}
          </Button>
        </div>
      </div>

      {isError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-400">
            {error instanceof Error ? error.message : "Failed to fetch logs"}
          </p>
        </div>
      )}

      {!isError && (
        <Table
          data={logs}
          columns={columns}
          keyExtractor={(log) => log.id}
          emptyMessage="No logs found"
          loading={isLoading}
          onRefresh={handleRefresh}
          isRefetching={isRefetching}
          total={total}
          resultsInfo={`Showing ${logs.length} of ${total} logs${
            params.level !== "ALL" ? ` (filtered by ${params.level})` : ""
          }`}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          currentPage={params.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={params.pageSize}
          onPageSizeChange={handlePageSizeChange}
          enableAutoRefresh={true}
          onAutoRefresh={handleAutoRefresh}
        />
      )}

      <MetadataSidebar
        log={selectedLog}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  );
}
