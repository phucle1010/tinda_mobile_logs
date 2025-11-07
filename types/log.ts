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
  level?: LogLevel | "ALL";
  search?: string;
  sortBy?: "created_at" | "level";
  sortOrder?: "asc" | "desc";
  dateFrom?: string;
  dateTo?: string;
}
