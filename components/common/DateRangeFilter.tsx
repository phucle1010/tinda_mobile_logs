"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/ui/Select";

interface DateRangeFilterProps {
  dateFrom?: string;
  dateTo?: string;
  onDateChange: (dateFrom?: string, dateTo?: string) => void;
}

const presets = [
  { value: "all", label: "All" },
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7d" },
  { value: "30d", label: "Last 30d" },
  { value: "custom", label: "Custom" },
];

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateChange,
}: DateRangeFilterProps) {
  // Determine current selected preset
  const currentPreset = useMemo(() => {
    if (!dateFrom && !dateTo) {
      return "all";
    }

    if (dateFrom && dateTo) {
      const now = new Date();
      const today = new Date(now);
      today.setUTCHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split("T")[0];

      // Calculate expected date ranges for presets (using UTC to avoid timezone issues)
      const last24hFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      last24hFrom.setUTCHours(0, 0, 0, 0);
      const last24hFromStr = last24hFrom.toISOString().split("T")[0];

      const last7dFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      last7dFrom.setUTCHours(0, 0, 0, 0);
      const last7dFromStr = last7dFrom.toISOString().split("T")[0];

      const last30dFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      last30dFrom.setUTCHours(0, 0, 0, 0);
      const last30dFromStr = last30dFrom.toISOString().split("T")[0];

      // Check if dates match preset ranges (dateTo should be today)
      // For presets, dateTo is always set to today
      if (dateTo === todayStr) {
        if (dateFrom === last24hFromStr) return "24h";
        if (dateFrom === last7dFromStr) return "7d";
        if (dateFrom === last30dFromStr) return "30d";
      }

      // If dates don't match any preset, it's custom
      return "custom";
    }

    return "all";
  }, [dateFrom, dateTo]);

  // Derive showCustom from currentPreset - no state or useEffect needed
  // Use local state only for manual override when user explicitly toggles
  const [manualShowCustom, setManualShowCustom] = useState<boolean | null>(null);
  
  // Determine if custom inputs should be shown
  const showCustom = manualShowCustom !== null 
    ? manualShowCustom 
    : (currentPreset === "custom" && dateFrom && dateTo);

  const handlePreset = (preset: string) => {
    if (preset === "all") {
      onDateChange(undefined, undefined);
      return;
    }

    if (preset === "custom") {
      // If no dates are set, set default to today
      if (!dateFrom || !dateTo) {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split("T")[0];
        onDateChange(todayStr, todayStr);
      }
      setManualShowCustom(true);
      return;
    }

    const now = new Date();
    let from: Date;
    const to: Date = new Date(now);
    to.setUTCHours(23, 59, 59, 999); // End of today in UTC

    switch (preset) {
      case "24h":
        from = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    // Set from date to start of that day in UTC
    from.setUTCHours(0, 0, 0, 0);

    const fromStr = from.toISOString().split("T")[0];
    const toStr = to.toISOString().split("T")[0];
    onDateChange(fromStr, toStr);
    setManualShowCustom(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-36">
        <Select
          label="Date range"
          value={currentPreset}
          onChange={(value) => handlePreset(value as string)}
          options={presets}
          size="md"
        />
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom || ""}
            onChange={(e) => {
              onDateChange(e.target.value || undefined, dateTo);
            }}
            className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">to</span>
          <input
            type="date"
            value={dateTo || ""}
            onChange={(e) => {
              onDateChange(dateFrom, e.target.value || undefined);
            }}
            className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
        </div>
      )}
    </div>
  );
}
