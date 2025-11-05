import { useQuery } from "@tanstack/react-query";

import { logService } from "@/services/log.service";

import { LogsQueryParams, LogsResponse } from "@/types/log";

export const useLogs = (params: LogsQueryParams) => {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useQuery<LogsResponse>({
      queryKey: [
        "logs",
        params.page,
        params.pageSize,
        params.level,
        params.search,
        params.sortBy,
        params.sortOrder,
      ],
      queryFn: () => logService.getLogs(params),
    });

  return { data, isLoading, isError, error, refetch, isRefetching };
};
