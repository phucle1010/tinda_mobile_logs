import { useState } from "react";
import type { Log } from "@/types/log";

export function useLogComparison() {
  const [comparisonLogs, setComparisonLogs] = useState<{ log1: Log | null; log2: Log | null }>({
    log1: null,
    log2: null,
  });
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const handleCompareLog = (log: Log) => {
    if (!comparisonLogs.log1) {
      setComparisonLogs({ log1: log, log2: null });
    } else if (!comparisonLogs.log2) {
      setComparisonLogs({ ...comparisonLogs, log2: log });
      setIsComparisonOpen(true);
    } else {
      setComparisonLogs({ log1: log, log2: null });
    }
  };

  const handleCloseComparison = () => {
    setIsComparisonOpen(false);
    setComparisonLogs({ log1: null, log2: null });
  };

  return {
    comparisonLogs,
    isComparisonOpen,
    handleCompareLog,
    handleCloseComparison,
  };
}

