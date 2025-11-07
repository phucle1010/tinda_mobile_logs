import { useQuery } from "@tanstack/react-query";
import { logService } from "@/services/log.service";
import type { TimeSeriesData } from "@/types/log";

export const useTimeSeries = (params: {
  dateFrom?: string;
  dateTo?: string;
  interval?: string;
}) => {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useQuery<TimeSeriesData[]>({
      queryKey: ["timeSeries", params.dateFrom, params.dateTo, params.interval],
      queryFn: () => logService.getTimeSeries(params),
    });

  return { data, isLoading, isError, error, refetch, isRefetching };
};

