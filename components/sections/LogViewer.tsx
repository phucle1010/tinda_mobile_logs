"use client";

import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { logService } from "@/services/log.service";

import { useTimeSeries } from "@/actions/useTimeSeries";
import { useErrorRate } from "@/actions/useErrorRate";
import { useLogs } from "@/actions/useLogs";
import { useLogStats } from "@/actions/useLogStats";

import type { Log, LogLevel, LogsQueryParams } from "@/types/log";

import { MetadataSidebar } from "@/components/sections/MetadataSidebar";
import { Table, type TableColumn } from "@/components/ui/Table";
import { DateRangeFilter } from "@/components/common/DateRangeFilter";
import { LogLevelStats } from "@/components/sections/LogLevelStats";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { MetadataFilter } from "@/components/common/MetadataFilter";
import { QuickFilters } from "@/components/common/QuickFilters";
import { SavedFilters } from "@/components/common/SavedFilters";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { ErrorRateChart } from "@/components/charts/ErrorRateChart";
import { LogComparison } from "@/components/common/LogComparison";
import { ShareButton } from "@/components/common/ShareButton";
import { BookmarkButton } from "@/components/common/BookmarkButton";
import { FieldSearch } from "@/components/common/FieldSearch";
import { LogCorrelation } from "@/components/advanced/LogCorrelation";
import { AnalyticsDashboard } from "@/components/advanced/AnalyticsDashboard";
import { AlertRules } from "@/components/advanced/AlertRules";
import { LogTimeline } from "@/components/advanced/LogTimeline";
import { QueryBuilder } from "@/components/advanced/QueryBuilder";

import { formatDate, getDeviceInfo, truncateText } from "@/utils/format";
import { highlightText } from "@/utils/highlight";
import { useLogSearch } from "@/hooks/useLogSearch";
import { useLogSelection } from "@/hooks/useLogSelection";
import { useLogComparison } from "@/hooks/useLogComparison";
import { useLogFilters } from "@/hooks/useLogFilters";
import { useTableConfig } from "@/hooks/useTableConfig";
import { useAdvancedFeatures } from "@/hooks/useAdvancedFeatures";
import {
  exportToCSV,
  exportToJSON,
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Custom hooks for state management
  const {
    searchInput,
    setSearchInput,
    searchRegex,
    setSearchRegex,
    searchField,
    setSearchField,
  } = useLogSearch(params.search || "");

  const {
    selectedLog,
    isSidebarOpen,
    copySuccess,
    handleViewMeta,
    handleCloseSidebar,
    setCopySuccess,
  } = useLogSelection();

  const {
    comparisonLogs,
    isComparisonOpen,
    handleCompareLog,
    handleCloseComparison,
  } = useLogComparison();

  const {
    selectedLevels,
    metadataFilters,
    setMetadataFilters,
    groupBy,
    setGroupBy,
    handleMultiLevelToggle,
    clearLevels,
  } = useLogFilters(params.level);

  const {
    columnConfigs,
    setColumnConfigs,
    useVirtualScrolling,
    setUseVirtualScrolling,
  } = useTableConfig();

  const {
    activeAdvancedTab,
    toggleTab,
    selectedCorrelatedLogs,
    setSelectedCorrelatedLogs,
  } = useAdvancedFeatures();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Ctrl/Cmd + F for search
      if ((e.ctrlKey || e.metaKey) && e.key === "f" && !e.shiftKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to close sidebar
      if (e.key === "Escape" && isSidebarOpen) {
        handleCloseSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, handleCloseSidebar]);


  const logsQueryParams: LogsQueryParams = useMemo(() => {
    const levelParam = selectedLevels.length > 0 
      ? selectedLevels.length === 1 ? selectedLevels[0] : selectedLevels
      : params.level === "ALL" ? "ALL" : (params.level as LogLevel);
    
    return {
      page: params.page || undefined,
      pageSize: params.pageSize || undefined,
      level: levelParam,
      search: params.search || undefined,
      searchRegex: searchRegex || undefined,
      metadataFilters: Object.keys(metadataFilters).length > 0 ? metadataFilters : undefined,
      sortBy: (params.sortBy === "created_at" || params.sortBy === "level") ? params.sortBy : undefined,
      sortOrder: (params.sortOrder === "asc" || params.sortOrder === "desc") ? params.sortOrder : undefined,
      dateFrom: params.dateFrom || undefined,
      dateTo: params.dateTo || undefined,
      groupBy: groupBy !== "none" ? groupBy : undefined,
    };
  }, [params, selectedLevels, searchRegex, metadataFilters, groupBy]);

  const { data, isLoading, isError, error, refetch, isRefetching } = useLogs(logsQueryParams);

  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useLogStats();

  // Time series data
  const { data: timeSeriesData } = useTimeSeries({
    dateFrom: params.dateFrom || undefined,
    dateTo: params.dateTo || undefined,
    interval: "hour",
  });

  // Error rate data
  const { data: errorRateData } = useErrorRate({
    dateFrom: params.dateFrom || undefined,
    dateTo: params.dateTo || undefined,
    interval: "hour",
  });

  const handleAutoRefresh = () => {
    refetch();
    refetchStats();
  };

  const logs = useMemo(() => {
    let result = Array.isArray(data?.logs) ? (data.logs as Log[]) : [];
    
    // Apply correlation filter if selected
    if (selectedCorrelatedLogs.length > 0) {
      const correlatedIds = new Set(selectedCorrelatedLogs.map((log) => log.id));
      result = result.filter((log) => correlatedIds.has(log.id));
    }
    
    // Apply grouping
    if (groupBy === "level") {
      result = [...result].sort((a, b) => {
        const levelOrder = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
        return levelOrder[a.level] - levelOrder[b.level];
      });
    } else if (groupBy === "date") {
      result = [...result].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    
    return result;
  }, [data, groupBy, selectedCorrelatedLogs]);

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
    return {
      ERROR: 0,
      WARN: 0,
      INFO: 0,
      DEBUG: 0,
      total: 0,
    };
  }, [statsData]);



  const handleMultiLevelToggleWithParams = (level: LogLevel) => {
    const newLevels = handleMultiLevelToggle(level);
    
    if (newLevels.length === 0) {
      setParams({ level: "ALL", page: 1 });
      clearLevels();
    } else if (newLevels.length === 1) {
      setParams({ level: newLevels[0], page: 1 });
    } else {
      setParams({ level: JSON.stringify(newLevels), page: 1 });
    }
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

  const handleExportCSV = async () => {
    try {
      const allLogs = await logService.getLogs(logsQueryParams, true);
      exportToCSV(allLogs.logs);
    } catch (err) {
      console.error("Export failed:", err);
      // Fallback to current page
      exportToCSV(logs);
    }
  };

  const handleExportJSON = async () => {
    try {
      const allLogs = await logService.getLogs(logsQueryParams, true);
      exportToJSON(allLogs.logs);
    } catch (err) {
      console.error("Export failed:", err);
      // Fallback to current page
      exportToJSON(logs);
    }
  };

  const handleCopyLogId = useCallback(async (logId: string) => {
    await copyLogId(logId);
    setCopySuccess(logId);
  }, [setCopySuccess]);

  const handleQuickFilter = (quickParams: {
    dateFrom?: string;
    dateTo?: string;
    level?: string | string[];
  }) => {
    setParams({
      ...params,
      dateFrom: quickParams.dateFrom || params.dateFrom,
      dateTo: quickParams.dateTo || params.dateTo,
      level: quickParams.level ? (Array.isArray(quickParams.level) ? JSON.stringify(quickParams.level) : quickParams.level) : params.level,
      page: 1,
    });
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

  // Get available metadata keys from logs
  const availableMetadataKeys = useMemo(() => {
    const keys = new Set<string>();
    logs.forEach((log) => {
      Object.keys(log.meta || {}).forEach((key) => keys.add(key));
    });
    return Array.from(keys);
  }, [logs]);

  // Default columns
  const defaultColumns: TableColumn<Log>[] = useMemo(
    () => [
      {
        key: "no",
        header: "No",
        className: "whitespace-nowrap text-gray-500 dark:text-gray-400",
        render: (_, index) => (params.page - 1) * params.pageSize + index + 1,
        sortable: false,
      },
      {
        key: "created_at",
        header: "Created At",
        className: "whitespace-nowrap text-gray-500 dark:text-gray-400",
        render: (log) => formatDate(log.created_at),
        sortable: true,
        sortKey: "created_at",
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
        sortable: true,
        sortKey: "level",
      },
      {
        key: "message",
        header: "Message",
        render: (log) => {
          const highlighted = params.search
            ? highlightText(log.message, params.search)
            : log.message;
          return (
            <div
              className="text-gray-900 dark:text-gray-100 max-w-md break-words line-clamp-1"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          );
        },
        sortable: false,
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
        sortable: false,
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "min-w-32",
        render: (log) => (
          <div className="flex items-center gap-1">
            <BookmarkButton logId={log.id} />
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleCompareLog(log);
              }}
              variant="ghost"
              size="sm"
              title="Compare logs"
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
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              }
            />
          </div>
        ),
        sortable: false,
      },
    ],
    [params.page, params.pageSize, params.search, copySuccess, handleViewMeta, handleCopyLogId, handleCompareLog]
  );

  // Apply column configs
  const columns = useMemo(() => {
    if (columnConfigs.length === 0) return defaultColumns;
    
    const sortedConfigs = [...columnConfigs].sort((a, b) => a.order - b.order);
    return sortedConfigs
      .filter((config) => config.visible)
      .map((config) => {
        const column = defaultColumns.find((col) => col.key === config.key);
        return column || defaultColumns.find((col) => col.key === config.key);
      })
      .filter((col): col is TableColumn<Log> => col !== undefined);
  }, [columnConfigs, defaultColumns]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Log Viewer
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          View and filter application logs
        </p>
      </div>

      {/* Stats Cards */}
      {!statsLoading && statsData && (
        <div className="mb-6 sm:mb-8">
          <LogLevelStats stats={stats} />
        </div>
      )}

      {/* Advanced Features Tabs */}
      <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3">
        <Button
          onClick={() => toggleTab("correlation")}
          variant={activeAdvancedTab === "correlation" ? "primary" : "ghost"}
          size="sm"
        >
          Log Correlation
        </Button>
        <Button
          onClick={() => toggleTab("analytics")}
          variant={activeAdvancedTab === "analytics" ? "primary" : "ghost"}
          size="sm"
        >
          Advanced Analytics
        </Button>
        <Button
          onClick={() => toggleTab("alerts")}
          variant={activeAdvancedTab === "alerts" ? "primary" : "ghost"}
          size="sm"
        >
          Alert Rules
        </Button>
        <Button
          onClick={() => toggleTab("timeline")}
          variant={activeAdvancedTab === "timeline" ? "primary" : "ghost"}
          size="sm"
        >
          Timeline View
        </Button>
        <Button
          onClick={() => toggleTab("query")}
          variant={activeAdvancedTab === "query" ? "primary" : "ghost"}
          size="sm"
        >
          Query Builder
        </Button>
      </div>

      {/* Advanced Features Content */}
      {activeAdvancedTab === "correlation" && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <LogCorrelation
            logs={logs}
            onGroupSelect={(groupedLogs) => {
              setSelectedCorrelatedLogs(groupedLogs);
            }}
          />
        </div>
      )}

      {activeAdvancedTab === "analytics" && (
        <div className="mb-6">
          <AnalyticsDashboard logs={logs} />
        </div>
      )}

      {activeAdvancedTab === "alerts" && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <AlertRules />
        </div>
      )}

      {activeAdvancedTab === "timeline" && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <LogTimeline
            logs={logs}
            onLogSelect={handleViewMeta}
          />
        </div>
      )}

      {activeAdvancedTab === "query" && (
        <div className="mb-6">
          <QueryBuilder
            onQueryChange={(query) => {
              // Apply the advanced query
              console.log("Advanced query:", query);
            }}
          />
        </div>
      )}

      {/* Filters Section */}
      <div className="mb-6 space-y-4 sm:space-y-6">
        {/* Quick Filters & Saved Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <QuickFilters onApply={handleQuickFilter} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <SavedFilters
              onApplyFilter={(filterParams) => {
                const levelStr = Array.isArray(filterParams.level) 
                  ? JSON.stringify(filterParams.level)
                  : filterParams.level || "ALL";
                setParams({ 
                  ...params,
                  ...filterParams, 
                  level: levelStr,
                  page: 1 
                });
              }}
              currentParams={logsQueryParams}
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <FieldSearch
                onSearch={(query, field) => {
                  setSearchField(field);
                  setSearchInput(query);
                  setParams({
                    search: query,
                    page: 1,
                  });
                }}
                initialValue={searchInput}
                initialField={searchField}
              />
            </div>
            <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                <input
                  type="checkbox"
                  checked={searchRegex}
                  onChange={(e) => setSearchRegex(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span>Regex</span>
              </label>
              <ShareButton params={{
                page: logsQueryParams.page?.toString() || "",
                pageSize: logsQueryParams.pageSize?.toString() || "",
                level: Array.isArray(logsQueryParams.level) ? JSON.stringify(logsQueryParams.level) : (logsQueryParams.level || "ALL"),
                search: logsQueryParams.search || "",
                sortBy: logsQueryParams.sortBy || "",
                sortOrder: logsQueryParams.sortOrder || "",
                dateFrom: logsQueryParams.dateFrom || "",
                dateTo: logsQueryParams.dateTo || "",
              }} />
            </div>
          </div>

          {/* Multi-select Level Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">Level:</span>
            <div className="flex flex-wrap gap-2">
            {LOG_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => handleMultiLevelToggleWithParams(level)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedLevels.includes(level)
                    ? getLevelColor(level) + " font-semibold"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {level}
              </button>
            ))}
            <button
              onClick={() => {
                clearLevels();
                setParams({ level: "ALL", page: 1 });
              }}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedLevels.length === 0
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 font-semibold"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              All
            </button>
          </div>
        </div>

          {/* Metadata Filters */}
          <div className="w-full">
            <MetadataFilter
              metadataFilters={metadataFilters}
              onFiltersChange={setMetadataFilters}
              availableKeys={availableMetadataKeys}
            />
          </div>
        </div>

        {/* Date Range and Group By */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <DateRangeFilter
            dateFrom={params.dateFrom || undefined}
            dateTo={params.dateTo || undefined}
            onDateChange={handleDateChange}
          />

          <div className="w-32">
            <Select
              label="Group By"
              value={groupBy}
              onChange={(value) => setGroupBy(value as "none" | "level" | "date")}
              options={[
                { value: "none", label: "None" },
                { value: "level", label: "Level" },
                { value: "date", label: "Date" },
              ]}
              size="md"
            />
          </div>
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
            selectedLevels.length > 0 ? ` (filtered by ${selectedLevels.join(", ")})` : ""
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
          sortBy={params.sortBy}
          sortOrder={params.sortOrder as "asc" | "desc"}
          onSort={(sortKey, sortOrder) => {
            setParams({
              sortBy: sortKey,
              sortOrder,
              page: 1,
            });
          }}
          enableColumnCustomization={true}
          defaultColumns={defaultColumns.map((col) => ({ key: col.key, header: col.header }))}
          columnConfigs={columnConfigs}
          onColumnConfigChange={setColumnConfigs}
          enableVirtualScrolling={true}
          useVirtualScrolling={useVirtualScrolling}
          onVirtualScrollingChange={setUseVirtualScrolling}
        />
      )}

      {/* Charts - Always shown */}
      <div className="mb-6 sm:mb-8 space-y-6 sm:space-y-8 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-shadow hover:shadow-xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              Log Volume Over Time
            </h3>
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>
          <div className="h-[300px] sm:h-[400px] lg:h-[450px]">
            {timeSeriesData && <TimeSeriesChart data={timeSeriesData} />}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-shadow hover:shadow-xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
              Error Rate Over Time
            </h3>
            <div className="h-1 w-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
          </div>
          <div className="h-[300px] sm:h-[400px] lg:h-[450px]">
            {errorRateData && <ErrorRateChart data={errorRateData} />}
          </div>
        </div>
      </div>

      <MetadataSidebar
        log={selectedLog}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />

      <LogComparison
        log1={comparisonLogs.log1}
        log2={comparisonLogs.log2}
        isOpen={isComparisonOpen}
        onClose={handleCloseComparison}
      />
    </div>
  );
}
