import { useState, useCallback } from "react";
import type { Log } from "@/types/log";

export function useLogSelection() {
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const handleViewMeta = useCallback((log: Log) => {
    setSelectedLog(log);
    setIsSidebarOpen(true);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setTimeout(() => {
      setSelectedLog(null);
    }, 300);
  }, []);

  const setCopySuccessWithTimeout = useCallback((logId: string) => {
    setCopySuccess(logId);
    setTimeout(() => setCopySuccess(null), 2000);
  }, []);

  return {
    selectedLog,
    isSidebarOpen,
    copySuccess,
    handleViewMeta,
    handleCloseSidebar,
    setCopySuccess: setCopySuccessWithTimeout,
  };
}

