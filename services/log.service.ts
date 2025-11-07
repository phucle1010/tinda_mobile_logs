import { LogsQueryParams, LogsResponse, TimeSeriesData, ErrorRateData } from "@/types/log";
import type { LogStats } from "@/components/sections/LogLevelStats";

const getLogs = async (params: LogsQueryParams, exportAll = false): Promise<LogsResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) {
    queryParams.append("page", params.page.toString());
  }
  if (params.pageSize !== undefined) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params.level !== undefined) {
    if (Array.isArray(params.level)) {
      queryParams.append("level", JSON.stringify(params.level));
    } else {
      queryParams.append("level", params.level);
    }
  }
  if (params.sortBy !== undefined) {
    queryParams.append("sortBy", params.sortBy);
  }
  if (params.sortOrder !== undefined) {
    queryParams.append("sortOrder", params.sortOrder);
  }
  if (params.search) {
    queryParams.append("search", params.search);
  }
  if (params.searchRegex) {
    queryParams.append("searchRegex", "true");
  }
  if (params.dateFrom) {
    queryParams.append("dateFrom", params.dateFrom);
  }
  if (params.dateTo) {
    queryParams.append("dateTo", params.dateTo);
  }
  if (params.metadataFilters) {
    queryParams.append("metadataFilters", JSON.stringify(params.metadataFilters));
  }
  if (exportAll) {
    queryParams.append("exportAll", "true");
  }

  const response = await fetch(`/api/logs?${queryParams.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch logs");
  }

  return data;
};

const getLogStats = async (): Promise<LogStats> => {
  const response = await fetch("/api/logs/stats");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch log stats");
  }

  return data;
};

const getTimeSeries = async (params: { dateFrom?: string; dateTo?: string; interval?: string }): Promise<TimeSeriesData[]> => {
  const queryParams = new URLSearchParams();
  if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params.interval) queryParams.append("interval", params.interval);

  const response = await fetch(`/api/logs/timeseries?${queryParams.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch time series data");
  }

  return data;
};

const getErrorRate = async (params: { dateFrom?: string; dateTo?: string; interval?: string }): Promise<ErrorRateData[]> => {
  const queryParams = new URLSearchParams();
  if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
  if (params.dateTo) queryParams.append("dateTo", params.dateTo);
  if (params.interval) queryParams.append("interval", params.interval);

  const response = await fetch(`/api/logs/error-rate?${queryParams.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch error rate data");
  }

  return data;
};

export const logService = {
  getLogs,
  getLogStats,
  getTimeSeries,
  getErrorRate,
};
