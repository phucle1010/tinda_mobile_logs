import { useState, useEffect } from "react";
import { getColumnConfig, saveColumnConfig } from "@/utils/storage";
import type { ColumnConfig } from "@/types/log";

export function useTableConfig() {
  // Load column configs from storage using lazy initialization
  const [columnConfigs, setColumnConfigs] = useState<ColumnConfig[]>(() => getColumnConfig() || []);
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false);

  const updateColumnConfigs = (configs: ColumnConfig[]) => {
    setColumnConfigs(configs);
    saveColumnConfig(configs);
  };

  return {
    columnConfigs,
    setColumnConfigs: updateColumnConfigs,
    useVirtualScrolling,
    setUseVirtualScrolling,
  };
}

