"use client";

import { Button } from "@/components/ui/Button";
import type { Log, LogLevel } from "@/types/log";
import { formatDate, parseMetadata } from "@/utils/format";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/providers/ThemeProvider";

interface LogComparisonProps {
  log1: Log | null;
  log2: Log | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LogComparison({
  log1,
  log2,
  isOpen,
  onClose,
}: LogComparisonProps) {
  const { theme } = useTheme();

  if (!isOpen || !log1 || !log2) return null;

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "ERROR":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "WARN":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "INFO":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "DEBUG":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const metadata1 = parseMetadata(log1.meta);
  const metadata2 = parseMetadata(log2.meta);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed z-[9999] inset-0 bg-black/50 backdrop-blur-xs transition-all duration-200 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Comparison Modal */}
      <div
        className={`fixed z-[9999] inset-0 flex items-center justify-center p-4 transition-all duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Compare Logs
            </h2>
            <Button onClick={onClose} variant="ghost" size="sm">
              ×
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Log 1 */}
              <div className="space-y-4">
                <div className="sticky top-0 bg-white dark:bg-gray-800 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Log 1
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      ID:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {log1.id}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created At:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(log1.created_at)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Level:
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(
                        log1.level
                      )}`}
                    >
                      {log1.level}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Message:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 break-words">
                      {log1.message}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Metadata:
                    </span>
                    <div className="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                      <SyntaxHighlighter
                        language="json"
                        style={theme === "dark" ? vscDarkPlus : vs}
                        customStyle={{
                          margin: 0,
                          padding: 0,
                          background: "transparent",
                          fontSize: "0.75rem",
                        }}
                      >
                        {JSON.stringify(metadata1, null, 2)}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              </div>

              {/* Log 2 */}
              <div className="space-y-4">
                <div className="sticky top-0 bg-white dark:bg-gray-800 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Log 2
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      ID:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {log2.id}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created At:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {formatDate(log2.created_at)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Level:
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(
                        log2.level
                      )}`}
                    >
                      {log2.level}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Message:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 break-words">
                      {log2.message}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Metadata:
                    </span>
                    <div className="mt-1 text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                      <SyntaxHighlighter
                        language="json"
                        style={theme === "dark" ? vscDarkPlus : vs}
                        customStyle={{
                          margin: 0,
                          padding: 0,
                          background: "transparent",
                          fontSize: "0.75rem",
                        }}
                      >
                        {JSON.stringify(metadata2, null, 2)}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

