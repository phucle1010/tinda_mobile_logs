import { useState } from "react";
import type { Log } from "@/types/log";

export function useAdvancedFeatures() {
  const [activeAdvancedTab, setActiveAdvancedTab] = useState<string | null>(null);
  const [selectedCorrelatedLogs, setSelectedCorrelatedLogs] = useState<Log[]>([]);

  const toggleTab = (tab: string) => {
    setActiveAdvancedTab(activeAdvancedTab === tab ? null : tab);
  };

  return {
    activeAdvancedTab,
    toggleTab,
    selectedCorrelatedLogs,
    setSelectedCorrelatedLogs,
  };
}

