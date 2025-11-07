/**
 * Local storage utilities for saved filters and column configs
 */

import type { LogsQueryParams, ColumnConfig, SavedFilter } from "@/types/log";

const SAVED_FILTERS_KEY = "tinda_logs_saved_filters";
const COLUMN_CONFIG_KEY = "tinda_logs_column_config";

export function saveFilter(filter: Omit<SavedFilter, "id" | "createdAt">): SavedFilter {
  const filters = getSavedFilters();
  const newFilter: SavedFilter = {
    ...filter,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  filters.push(newFilter);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
  return newFilter;
}

export function getSavedFilters(): SavedFilter[] {
  try {
    const data = localStorage.getItem(SAVED_FILTERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteSavedFilter(id: string): void {
  const filters = getSavedFilters().filter((f) => f.id !== id);
  localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(filters));
}

export function saveColumnConfig(configs: ColumnConfig[]): void {
  localStorage.setItem(COLUMN_CONFIG_KEY, JSON.stringify(configs));
}

export function getColumnConfig(): ColumnConfig[] | null {
  try {
    const data = localStorage.getItem(COLUMN_CONFIG_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

