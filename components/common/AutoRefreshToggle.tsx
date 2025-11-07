"use client";

import { Switch } from "@/components/ui/Switch";
import { Select } from "@/components/ui/Select";

interface AutoRefreshToggleProps {
  enabled: boolean;
  interval: number;
  onToggle: (enabled: boolean) => void;
  onIntervalChange: (interval: number) => void;
}

export function AutoRefreshToggle({
  enabled,
  interval,
  onToggle,
  onIntervalChange,
}: AutoRefreshToggleProps) {
  const intervals = [5, 10, 30, 60]; // seconds

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      <Switch
        checked={enabled}
        onChange={onToggle}
        label="Auto-refresh"
        size="sm"
        className="hidden sm:flex"
      />
      <Switch
        checked={enabled}
        onChange={onToggle}
        label=""
        size="sm"
        className="sm:hidden"
        title="Auto-refresh"
      />
      {enabled && (
        <div className="w-16 sm:w-20">
          <Select
            value={interval}
            onChange={(value) => onIntervalChange(Number(value))}
            options={intervals.map((sec) => ({
              value: sec,
              label: `${sec}s`,
            }))}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}
