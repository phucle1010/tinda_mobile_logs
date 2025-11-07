"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

interface MetadataFilterProps {
  metadataFilters: Record<string, string>;
  onFiltersChange: (filters: Record<string, string>) => void;
  availableKeys?: string[];
}

export function MetadataFilter({
  metadataFilters,
  onFiltersChange,
  availableKeys = [],
}: MetadataFilterProps) {
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleAddFilter = () => {
    if (newKey && newValue) {
      onFiltersChange({
        ...metadataFilters,
        [newKey]: newValue,
      });
      setNewKey("");
      setNewValue("");
    }
  };

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...metadataFilters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Metadata key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          list="metadata-keys"
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
        />
        {availableKeys.length > 0 && (
          <datalist id="metadata-keys">
            {availableKeys.map((key) => (
              <option key={key} value={key} />
            ))}
          </datalist>
        )}
        <input
          type="text"
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddFilter()}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
        />
        <Button onClick={handleAddFilter} variant="primary" size="md">
          Add
        </Button>
      </div>
      {Object.keys(metadataFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(metadataFilters).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm"
            >
              <span className="font-medium">{key}:</span>
              <span>{value}</span>
              <button
                onClick={() => handleRemoveFilter(key)}
                className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                title="Remove filter"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

