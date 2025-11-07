"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getSavedFilters, saveFilter, deleteSavedFilter } from "@/utils/storage";
import type { SavedFilter, LogsQueryParams } from "@/types/log";

interface SavedFiltersProps {
  onApplyFilter: (params: LogsQueryParams) => void;
  currentParams: LogsQueryParams;
}

export function SavedFilters({ onApplyFilter, currentParams }: SavedFiltersProps) {
  const [filters, setFilters] = useState<SavedFilter[]>(() => getSavedFilters());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState("");

  const handleSaveCurrent = () => {
    if (!filterName.trim()) return;
    const newFilter = saveFilter({
      name: filterName,
      params: currentParams,
    });
    setFilters([...filters, newFilter]);
    setFilterName("");
    setShowSaveDialog(false);
  };

  const handleDelete = (id: string) => {
    deleteSavedFilter(id);
    setFilters(filters.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Saved Filters:</span>
        <Button
          onClick={() => setShowSaveDialog(true)}
          variant="ghost"
          size="md"
          className="text-xs"
        >
          + Save Current
        </Button>
      </div>

      {showSaveDialog && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <input
            type="text"
            placeholder="Filter name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveCurrent()}
            className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
          />
          <Button onClick={handleSaveCurrent} variant="primary" size="sm">
            Save
          </Button>
          <Button onClick={() => setShowSaveDialog(false)} variant="ghost" size="sm">
            Cancel
          </Button>
        </div>
      )}

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-sm"
            >
              <button
                onClick={() => onApplyFilter(filter.params)}
                className="hover:underline"
              >
                {filter.name}
              </button>
              <button
                onClick={() => handleDelete(filter.id)}
                className="hover:text-blue-600 dark:hover:text-blue-300"
                title="Delete filter"
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

