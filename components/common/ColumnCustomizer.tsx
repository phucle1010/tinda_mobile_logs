"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import type { ColumnConfig } from "@/types/log";

interface ColumnCustomizerProps {
  columns: Array<{ key: string; header: string }>;
  configs: ColumnConfig[];
  onConfigChange: (configs: ColumnConfig[]) => void;
  onClose: () => void;
}

export function ColumnCustomizer({
  columns,
  configs,
  onConfigChange,
  onClose,
}: ColumnCustomizerProps) {
  const [localConfigs, setLocalConfigs] = useState<ColumnConfig[]>(() => {
    if (configs.length > 0) return configs;
    return columns.map((col, index) => ({
      key: col.key,
      visible: true,
      order: index,
    }));
  });

  const handleToggleVisibility = (key: string) => {
    setLocalConfigs((prev) =>
      prev.map((config) =>
        config.key === key ? { ...config, visible: !config.visible } : config
      )
    );
  };

  const handleMoveUp = (key: string) => {
    setLocalConfigs((prev) => {
      const index = prev.findIndex((c) => c.key === key);
      if (index <= 0) return prev;
      const newConfigs = [...prev];
      [newConfigs[index - 1], newConfigs[index]] = [
        newConfigs[index],
        newConfigs[index - 1],
      ];
      return newConfigs.map((c, i) => ({ ...c, order: i }));
    });
  };

  const handleMoveDown = (key: string) => {
    setLocalConfigs((prev) => {
      const index = prev.findIndex((c) => c.key === key);
      if (index >= prev.length - 1) return prev;
      const newConfigs = [...prev];
      [newConfigs[index], newConfigs[index + 1]] = [
        newConfigs[index + 1],
        newConfigs[index],
      ];
      return newConfigs.map((c, i) => ({ ...c, order: i }));
    });
  };

  const handleSave = () => {
    onConfigChange(localConfigs);
    onClose();
  };

  const sortedConfigs = [...localConfigs].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Customize Columns
          </h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            ×
          </Button>
        </div>

        <div className="space-y-2 mb-4">
          {sortedConfigs.map((config, index) => {
            const column = columns.find((c) => c.key === config.key);
            return (
              <div
                key={config.key}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
              >
                <Switch
                  checked={config.visible}
                  onChange={() => handleToggleVisibility(config.key)}
                  size="sm"
                />
                <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                  {column?.header || config.key}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleMoveUp(config.key)}
                    variant="ghost"
                    size="sm"
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    onClick={() => handleMoveDown(config.key)}
                    variant="ghost"
                    size="sm"
                    disabled={index === sortedConfigs.length - 1}
                  >
                    ↓
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

