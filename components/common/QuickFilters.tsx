"use client";

import { Button } from "@/components/ui/Button";

interface QuickFilter {
  label: string;
  getParams: () => {
    dateFrom?: string;
    dateTo?: string;
    level?: string | string[];
  };
}

const quickFilters: QuickFilter[] = [
  {
    label: "Last Hour",
    getParams: () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      return {
        dateFrom: oneHourAgo.toISOString().split("T")[0],
        dateTo: now.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "Today",
    getParams: () => {
      const today = new Date().toISOString().split("T")[0];
      return {
        dateFrom: today,
        dateTo: today,
      };
    },
  },
  {
    label: "Today's Errors",
    getParams: () => {
      const today = new Date().toISOString().split("T")[0];
      return {
        dateFrom: today,
        dateTo: today,
        level: "ERROR",
      };
    },
  },
  {
    label: "This Week",
    getParams: () => {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        dateFrom: weekAgo.toISOString().split("T")[0],
        dateTo: now.toISOString().split("T")[0],
      };
    },
  },
  {
    label: "Errors & Warnings",
    getParams: () => ({
      level: ["ERROR", "WARN"],
    }),
  },
];

interface QuickFiltersProps {
  onApply: (params: {
    dateFrom?: string;
    dateTo?: string;
    level?: string | string[];
  }) => void;
}

export function QuickFilters({ onApply }: QuickFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {quickFilters.map((filter) => (
        <Button
          key={filter.label}
          onClick={() => onApply(filter.getParams())}
          variant="ghost"
          size="sm"
          className="text-xs"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

