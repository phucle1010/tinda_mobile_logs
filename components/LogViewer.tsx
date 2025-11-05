"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useEffect, useMemo, useState } from "react";

import { useLogs } from "@/actions/useLogs";
import { MetadataSidebar } from "@/components/MetadataSidebar";
import { Pagination } from "@/components/Pagination";

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

  const handleViewMeta = (log: Log) => {
    setSelectedLog(log);
    setIsSidebarOpen(true);
  };

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

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Log Viewer
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and filter application logs
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading || isRefetching}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh logs"
        >
          <svg
            className={`w-5 h-5 ${isRefetching ? "animate-spin" : ""}`}
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

      {/* Results Info */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {logs.length} of {total} logs
        {params.level !== "ALL" && ` (filtered by ${params.level})`}
      </div>

      {/* Error State */}
      {isError && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-400">
            {error instanceof Error ? error.message : "Failed to fetch logs"}
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      )}

      {/* Logs Table */}
      {!isLoading && !isError && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="min-w-60 px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Meta
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log: Log, index: number) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {(params.page - 1) * params.pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(
                            log.level
                          )}`}
                        >
                          {log.level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-gray-100 max-w-md">
                          {log.message}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewMeta(log)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors break-all line-clamp-1 text-left"
                        >
                          {getDeviceInfo(log.meta) || "View Meta"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="mt-6">
          <Pagination
            currentPage={params.page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <MetadataSidebar
        log={selectedLog}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  );
}
