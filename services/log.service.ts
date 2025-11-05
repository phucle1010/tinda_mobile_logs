import { LogsQueryParams, LogsResponse } from "@/types/log";

const getLogs = async (params: LogsQueryParams): Promise<LogsResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) {
    queryParams.append("page", params.page.toString());
  }
  if (params.pageSize !== undefined) {
    queryParams.append("pageSize", params.pageSize.toString());
  }
  if (params.level !== undefined) {
    queryParams.append("level", params.level);
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

  const response = await fetch(`/api/logs?${queryParams.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch logs");
  }

  return data;
};

export const logService = {
  getLogs,
};
