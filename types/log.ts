export type LogLevel = "WARN" | "INFO" | "ERROR" | "DEBUG";

export interface Log {
  id: string;
  created_at: string;
  level: LogLevel;
  message: string;
  meta: Record<string, unknown>;
}

export interface LogsResponse {
  logs: Log[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LogsQueryParams {
  page?: number;
  pageSize?: number;
  level?: LogLevel | "ALL" | LogLevel[];
  search?: string;
  searchRegex?: boolean;
  metadataFilters?: Record<string, string>;
  sortBy?: "created_at" | "level";
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
  groupBy?: "level" | "date" | "none";
}

export interface TimeSeriesData {
  date: string;
  ERROR: number;
  WARN: number;
  INFO: number;
  DEBUG: number;
  total: number;
}

export interface ErrorRateData {
  date: string;
  errorRate: number;
  errorCount: number;
  totalCount: number;
}

export interface SavedFilter {
  id: string;
  name: string;
  params: LogsQueryParams;
  createdAt: string;
}

export interface ColumnConfig {
  key: string;
  visible: boolean;
  order: number;
}

export interface LogBookmark {
  id: string;
  logId: string;
  createdAt: string;
  note?: string;
}

export interface LogComparison {
  log1: Log;
  log2: Log;
}
