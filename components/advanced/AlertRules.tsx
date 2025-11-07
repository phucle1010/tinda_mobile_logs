"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import type { LogLevel } from "@/types/log";

interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: {
    level?: LogLevel;
    threshold?: number;
    timeWindow?: number; // minutes
    messagePattern?: string;
  };
  notification: {
    type: "browser" | "email";
    recipients?: string[];
  };
}

const ALERT_RULES_KEY = "tinda_logs_alert_rules";

export function AlertRules() {
  const [rules, setRules] = useState<AlertRule[]>(() => {
    try {
      const saved = localStorage.getItem(ALERT_RULES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<AlertRule>>({
    name: "",
    enabled: true,
    condition: {
      level: "ERROR",
      threshold: 10,
      timeWindow: 5,
    },
    notification: {
      type: "browser",
    },
  });

  const saveRules = (updatedRules: AlertRule[]) => {
    setRules(updatedRules);
    localStorage.setItem(ALERT_RULES_KEY, JSON.stringify(updatedRules));
  };

  const handleAddRule = () => {
    if (!newRule.name) return;

    const rule: AlertRule = {
      id: Date.now().toString(),
      name: newRule.name,
      enabled: newRule.enabled ?? true,
      condition: newRule.condition || {
        level: "ERROR",
        threshold: 10,
        timeWindow: 5,
      },
      notification: newRule.notification || { type: "browser" },
    };

    saveRules([...rules, rule]);
    setNewRule({
      name: "",
      enabled: true,
      condition: { level: "ERROR", threshold: 10, timeWindow: 5 },
      notification: { type: "browser" },
    });
    setShowAddForm(false);
  };

  const handleToggleRule = (id: string) => {
    saveRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const handleDeleteRule = (id: string) => {
    saveRules(rules.filter((rule) => rule.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Alert Rules
        </h3>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="primary"
          size="sm"
        >
          {showAddForm ? "Cancel" : "+ Add Rule"}
        </Button>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rule Name
            </label>
            <input
              type="text"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="e.g., High Error Rate"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Log Level
              </label>
              <Select
                value={newRule.condition?.level || "ERROR"}
                onChange={(value) =>
                  setNewRule({
                    ...newRule,
                    condition: {
                      ...newRule.condition,
                      level: value as LogLevel,
                    },
                  })
                }
                options={[
                  { value: "ERROR", label: "ERROR" },
                  { value: "WARN", label: "WARN" },
                  { value: "INFO", label: "INFO" },
                  { value: "DEBUG", label: "DEBUG" },
                ]}
                size="sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Threshold (count)
              </label>
              <input
                type="number"
                value={newRule.condition?.threshold || 10}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    condition: {
                      ...newRule.condition,
                      threshold: parseInt(e.target.value) || 10,
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time Window (minutes)
            </label>
            <input
              type="number"
              value={newRule.condition?.timeWindow || 5}
              onChange={(e) =>
                setNewRule({
                  ...newRule,
                  condition: {
                    ...newRule.condition,
                    timeWindow: parseInt(e.target.value) || 5,
                  },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          <Button onClick={handleAddRule} variant="primary" size="md">
            Add Rule
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={rule.enabled}
                  onChange={() => handleToggleRule(rule.id)}
                  size="sm"
                />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {rule.name}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Alert when {rule.condition.level} logs exceed {rule.condition.threshold} in {rule.condition.timeWindow} minutes
              </p>
            </div>
            <Button
              onClick={() => handleDeleteRule(rule.id)}
              variant="ghost"
              size="sm"
              className="text-red-600 dark:text-red-400"
            >
              Delete
            </Button>
          </div>
        ))}

        {rules.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No alert rules configured. Click "Add Rule" to create one.
          </p>
        )}
      </div>
    </div>
  );
}

