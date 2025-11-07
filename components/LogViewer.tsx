"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useLogs } from "@/actions/useLogs";
import { MetadataSidebar } from "@/components/MetadataSidebar";
import { Table, type TableColumn } from "@/components/Table";

import type { Log, LogLevel, LogsQueryParams } from "@/types/log";
import { formatDate, getDeviceInfo } from "@/utils/format";

const LOG_LEVELS: LogLevel[] = ["ERROR", "WARN", "INFO", "DEBUG"];

// Define URL query parsers
const parsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(20),
  level: parseAsString.withDefault("ALL"),
  search: parseAsString.withDefault(""),
  sortBy: parseAsString.withDefault("created_at"),
  sortOrder: parseAsString.withDefault("desc"),
};

export function LogViewer() {
  const [params, setParams] = useQueryStates(parsers);
  const [searchInput, setSearchInput] = useState(params.search || "");
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  };

  const { data, isLoading, isError, error, refetch, isRefetching } = useLogs(
    logsQueryParams as LogsQueryParams
  );

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
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewMeta(log);
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors break-all line-clamp-1 text-left"
          >
            {getDeviceInfo(log.meta) || "View Meta"}
          </button>
        ),
      },
    ],
    [params.page, params.pageSize, handleViewMeta]
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

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search logs by message..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleLevelFilter("ALL")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              params.level === "ALL"
                ? "bg-blue-600 text-white dark:bg-blue-500"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            All
          </button>
          {LOG_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => handleLevelFilter(level)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                params.level === level
                  ? `${getLevelColor(level)} font-semibold`
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">Sort by:</span>
          <button
            onClick={() => handleSort("created_at")}
            className={`px-3 py-1 rounded ${
              params.sortBy === "created_at"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Date
            {params.sortBy === "created_at" &&
              (params.sortOrder === "asc" ? " ↑" : " ↓")}
          </button>
          <button
            onClick={() => handleSort("level")}
            className={`px-3 py-1 rounded ${
              params.sortBy === "level"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Level
            {params.sortBy === "level" &&
              (params.sortOrder === "asc" ? " ↑" : " ↓")}
          </button>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-400">
            {error instanceof Error ? error.message : "Failed to fetch logs"}
          </p>
        </div>
      )}

      {/* Logs Table */}
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
          currentPage={params.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          pageSize={params.pageSize}
          onPageSizeChange={handlePageSizeChange}
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
