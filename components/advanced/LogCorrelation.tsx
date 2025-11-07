"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import type { Log } from "@/types/log";

interface LogCorrelationProps {
  logs: Log[];
  onGroupSelect?: (groupedLogs: Log[]) => void;
}

export function LogCorrelation({ logs, onGroupSelect }: LogCorrelationProps) {
  // Group logs by error message pattern
  const errorGroups = useMemo(() => {
    const groups: Record<string, Log[]> = {};
    
    logs.forEach((log) => {
      if (log.level === "ERROR") {
        // Extract error pattern (first 50 chars of message)
        const pattern = log.message.substring(0, 50).trim();
        if (!groups[pattern]) {
          groups[pattern] = [];
        }
        groups[pattern].push(log);
      }
    });

    return Object.entries(groups)
      .filter(([_, logs]) => logs.length > 1)
      .sort(([_, a], [__, b]) => b.length - a.length)
      .slice(0, 10); // Top 10 error patterns
  }, [logs]);

  // Group logs by session/user
  const sessionGroups = useMemo(() => {
    const groups: Record<string, Log[]> = {};
    
    logs.forEach((log) => {
      const sessionId = (log.meta as Record<string, unknown>)?.sessionId || 
                       (log.meta as Record<string, unknown>)?.userId      
      if (sessionId) {
        const key = String(sessionId);
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(log);
      }
    });

    return Object.entries(groups)
      .filter(([_, logs]) => logs.length > 1)
      .sort(([_, a], [__, b]) => b.length - a.length)
      .slice(0, 10);
  }, [logs]);

  if (errorGroups.length === 0 && sessionGroups.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {errorGroups.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Recurring Errors ({errorGroups.length})
          </h3>
          <div className="space-y-2">
            {errorGroups.map(([pattern, groupLogs]) => (
              <div
                key={pattern}
                className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">
                    {pattern}...
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                    {groupLogs.length} occurrences
                  </p>
                </div>
                <Button
                  onClick={() => onGroupSelect?.(groupLogs)}
                  variant="ghost"
                  size="sm"
                >
                  View All
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessionGroups.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Active Sessions ({sessionGroups.length})
          </h3>
          <div className="space-y-2">
            {sessionGroups.map(([sessionId, groupLogs]) => (
              <div
                key={sessionId}
                className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                    Session: {sessionId.substring(0, 20)}...
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                    {groupLogs.length} logs
                  </p>
                </div>
                <Button
                  onClick={() => onGroupSelect?.(groupLogs)}
                  variant="ghost"
                  size="sm"
                >
                  View All
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

