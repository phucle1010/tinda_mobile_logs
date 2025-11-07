import { useQuery } from "@tanstack/react-query";

import { logService } from "@/services/log.service";

import type { LogStats } from "@/components/sections/LogLevelStats";

export const useLogStats = () => {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useQuery<LogStats>({
      queryKey: ["logs", "stats"],
      queryFn: () => logService.getLogStats(),
      staleTime: 30 * 1000, // Cache for 30 seconds
    });

  return { data, isLoading, isError, error, refetch, isRefetching };
};
