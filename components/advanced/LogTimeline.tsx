"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Log, LogLevel } from "@/types/log";
import { formatDate } from "@/utils/format";

interface LogTimelineProps {
  logs: Log[];
  onLogSelect?: (log: Log) => void;
}

export function LogTimeline({ logs, onLogSelect }: LogTimelineProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const sortedLogs = useMemo(() => {
    return [...logs].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [logs]);

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "ERROR":
        return "bg-red-500";
      case "WARN":
        return "bg-yellow-500";
      case "INFO":
        return "bg-blue-500";
      case "DEBUG":
        return "bg-gray-500";
    }
  };

  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    let index = currentIndex;

    const interval = setInterval(() => {
      if (index < sortedLogs.length - 1) {
        index++;
        setCurrentIndex(index);
        onLogSelect?.(sortedLogs[index]);
      } else {
        setIsPlaying(false);
        clearInterval(interval);
      }
    }, 500); // 500ms per log

    return () => clearInterval(interval);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Log Timeline
        </h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlay}
            variant={isPlaying ? "danger" : "primary"}
            size="sm"
          >
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button onClick={handleReset} variant="ghost" size="sm">
            Reset
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-700" />
        <div className="space-y-4">
          {sortedLogs.map((log, index) => {
            const isActive = index === currentIndex;
            const isPast = index < currentIndex;

            return (
              <div
                key={log.id}
                className={`relative flex items-start gap-4 ${
                  isActive ? "opacity-100" : isPast ? "opacity-50" : "opacity-30"
                }`}
              >
                <div
                  className={`relative z-10 w-8 h-8 rounded-full ${getLevelColor(
                    log.level
                  )} border-4 border-white dark:border-gray-800 ${
                    isActive ? "ring-2 ring-blue-500" : ""
                  }`}
                />
                <div
                  className={`flex-1 p-4 rounded-lg border ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  } cursor-pointer hover:shadow-md transition-all`}
                  onClick={() => {
                    setCurrentIndex(index);
                    onLogSelect?.(log);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        log.level === "ERROR"
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : log.level === "WARN"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : log.level === "INFO"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {log.level}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                    {log.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
        Showing {currentIndex + 1} of {sortedLogs.length} logs
      </div>
    </div>
  );
}

