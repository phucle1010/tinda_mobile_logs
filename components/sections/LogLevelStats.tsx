"use client";

import type { LogLevel } from "@/types/log";

export interface LogStats {
  ERROR: number;
  WARN: number;
  INFO: number;
  DEBUG: number;
  total: number;
}

interface LogLevelStatsProps {
  stats: LogStats;
}

export function LogLevelStats({ stats }: LogLevelStatsProps) {
  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "ERROR":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "WARN":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "INFO":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "DEBUG":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";
      default:
        return "";
    }
  };

  const levels: LogLevel[] = ["ERROR", "WARN", "INFO", "DEBUG"];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {levels.map((level) => {
        const count = stats[level];
        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

        return (
          <div
            key={level}
            className={`
              p-4 rounded-lg border-2 transition-all
              ${getLevelColor(level)}
            `}
          >
            <div className="text-xs font-medium uppercase tracking-wider mb-1">
              {level}
            </div>
            <div className="text-2xl font-bold mb-1">{count}</div>
            <div className="text-xs opacity-75">{percentage.toFixed(1)}%</div>
            {/* Progress bar */}
            <div className="mt-2 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  level === "ERROR"
                    ? "bg-red-600 dark:bg-red-400"
                    : level === "WARN"
                      ? "bg-yellow-600 dark:bg-yellow-400"
                      : level === "INFO"
                        ? "bg-blue-600 dark:bg-blue-400"
                        : "bg-gray-600 dark:bg-gray-400"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
