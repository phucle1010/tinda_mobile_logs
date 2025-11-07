import { useQuery } from "@tanstack/react-query";
import { logService } from "@/services/log.service";
import type { ErrorRateData } from "@/types/log";

export const useErrorRate = (params: {
  dateFrom?: string;
  dateTo?: string;
  interval?: string;
}) => {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useQuery<ErrorRateData[]>({
      queryKey: ["errorRate", params.dateFrom, params.dateTo, params.interval],
      queryFn: () => logService.getErrorRate(params),
    });

  return { data, isLoading, isError, error, refetch, isRefetching };
};

