import { useState, useRef, useEffect } from "react";
import type { LogLevel } from "@/types/log";

export function useLogFilters(initialLevel?: string) {
  // Parse level from params and initialize state directly
  const parseLevels = (level?: string): LogLevel[] => {
    if (level && level !== "ALL") {
      try {
        const parsed = JSON.parse(level);
        if (Array.isArray(parsed)) {
          return parsed;
        } else {
          return [parsed];
        }
      } catch {
        return [level as LogLevel];
      }
    }
    return [];
  };

  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>(() => parseLevels(initialLevel));
  const [metadataFilters, setMetadataFilters] = useState<Record<string, string>>({});
  const [groupBy, setGroupBy] = useState<"none" | "level" | "date">("none");

  // Track the external initialLevel value separately from internal state
  const externalLevelRef = useRef<string | undefined>(initialLevel);
  const isInternalUpdateRef = useRef(false);

  // Sync with external prop changes - use setTimeout to defer update outside effect
  useEffect(() => {
    // Skip if this is an internal update
    if (isInternalUpdateRef.current) {
      return;
    }

    // Only update if external level changed
    if (externalLevelRef.current !== initialLevel) {
      externalLevelRef.current = initialLevel;
      const newLevels = parseLevels(initialLevel);
      
      // Defer state update to next tick to avoid synchronous setState in effect
      const timeoutId = setTimeout(() => {
        setSelectedLevels((prev) => {
          const prevStr = JSON.stringify(prev);
          const newStr = JSON.stringify(newLevels);
          return prevStr !== newStr ? newLevels : prev;
        });
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [initialLevel]);

  const handleMultiLevelToggle = (level: LogLevel) => {
    isInternalUpdateRef.current = true;
    const newLevels = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level];
    
    setSelectedLevels(newLevels);
    // Reset flag after state update completes
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
    return newLevels;
  };

  const clearLevels = () => {
    isInternalUpdateRef.current = true;
    setSelectedLevels([]);
    // Reset flag after state update completes
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  };

  return {
    selectedLevels,
    setSelectedLevels,
    metadataFilters,
    setMetadataFilters,
    groupBy,
    setGroupBy,
    handleMultiLevelToggle,
    clearLevels,
  };
}

