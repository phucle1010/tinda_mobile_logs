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
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {levels.map((level) => {
        const count = stats[level];
        const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

        return (
          <div
            key={level}
            className={`
              p-4 sm:p-5 rounded-xl border-2 transition-all
              hover:scale-[1.02] hover:shadow-lg
              ${getLevelColor(level)}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
                {level}
              </div>
              <div className={`text-xs sm:text-sm font-bold ${
                level === "ERROR" ? "text-red-700 dark:text-red-400"
                : level === "WARN" ? "text-yellow-700 dark:text-yellow-400"
                : level === "INFO" ? "text-blue-700 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-400"
              }`}>
                {percentage.toFixed(1)}%
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold mb-3">{count.toLocaleString()}</div>
            {/* Progress bar */}
            <div className="h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  level === "ERROR"
                    ? "bg-gradient-to-r from-red-500 to-red-600 dark:from-red-400 dark:to-red-500"
                    : level === "WARN"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500"
                      : level === "INFO"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500"
                        : "bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-500"
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
