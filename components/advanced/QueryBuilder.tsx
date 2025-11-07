"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export type QueryOperator = "AND" | "OR";
export type QueryField = "message" | "level" | "metadata" | "date";

interface QueryCondition {
  id: string;
  field: QueryField;
  operator: "contains" | "equals" | "startsWith" | "endsWith" | "regex";
  value: string;
}

interface QueryBuilderProps {
  onQueryChange: (query: {
    conditions: QueryCondition[];
    logic: QueryOperator;
  }) => void;
}

export function QueryBuilder({ onQueryChange }: QueryBuilderProps) {
  const [conditions, setConditions] = useState<QueryCondition[]>([
    {
      id: "1",
      field: "message",
      operator: "contains",
      value: "",
    },
  ]);
  const [logic, setLogic] = useState<QueryOperator>("AND");

  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      {
        id: Date.now().toString(),
        field: "message",
        operator: "contains",
        value: "",
      },
    ]);
  };

  const handleRemoveCondition = (id: string) => {
    setConditions(conditions.filter((c) => c.id !== id));
  };

  const handleUpdateCondition = (
    id: string,
    updates: Partial<QueryCondition>
  ) => {
    setConditions(
      conditions.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleApply = () => {
    onQueryChange({ conditions, logic });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
            Advanced Query Builder
          </h3>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-20 sm:w-24">
              <Select
                value={logic}
                onChange={(value) => setLogic(value as QueryOperator)}
                options={[
                  { value: "AND", label: "AND" },
                  { value: "OR", label: "OR" },
                ]}
                size="sm"
              />
            </div>
            <Button onClick={handleAddCondition} variant="ghost" size="sm">
              <span className="hidden sm:inline">+ Add Condition</span>
              <span className="sm:hidden">+ Add</span>
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {conditions.map((condition, index) => (
            <div
              key={condition.id}
              className="flex flex-col gap-3 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              {index > 0 && (
                <div className="flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    {logic}
                  </span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="w-full sm:w-32 flex-shrink-0">
                  <Select
                    value={condition.field}
                    onChange={(value) =>
                      handleUpdateCondition(condition.id, {
                        field: value as QueryField,
                      })
                    }
                    options={[
                      { value: "message", label: "Message" },
                      { value: "level", label: "Level" },
                      { value: "metadata", label: "Metadata" },
                      { value: "date", label: "Date" },
                    ]}
                    size="sm"
                  />
                </div>
                <div className="w-full sm:w-36 flex-shrink-0">
                  <Select
                    value={condition.operator}
                    onChange={(value) =>
                      handleUpdateCondition(condition.id, {
                        operator: value as QueryCondition["operator"],
                      })
                    }
                    options={[
                      { value: "contains", label: "Contains" },
                      { value: "equals", label: "Equals" },
                      { value: "startsWith", label: "Starts With" },
                      { value: "endsWith", label: "Ends With" },
                      { value: "regex", label: "Regex" },
                    ]}
                    size="sm"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) =>
                      handleUpdateCondition(condition.id, { value: e.target.value })
                    }
                    placeholder="Value..."
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                  {conditions.length > 1 && (
                    <Button
                      onClick={() => handleRemoveCondition(condition.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 dark:text-red-400 flex-shrink-0 px-2"
                      title="Remove condition"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleApply} variant="primary" size="md" className="w-full">
          Apply Query
        </Button>
      </div>
    </div>
  );
}

