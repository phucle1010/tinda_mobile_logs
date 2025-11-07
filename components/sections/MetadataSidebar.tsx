"use client";

import { useEffect, useRef, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";

import { useTheme } from "@/providers/ThemeProvider";

import type { Log, LogLevel } from "@/types/log";

import { Button } from "@/components/ui/Button";

import { formatDate, parseMetadata } from "@/utils/format";
import { copyLogToClipboard, copyLogId } from "@/utils/export";

interface MetadataSidebarProps {
  log: Log | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MetadataSidebar({
  log,
  isOpen,
  onClose,
}: MetadataSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleCopyLog = async () => {
    if (!log) return;
    await copyLogToClipboard(log);
    setCopySuccess("log");
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleCopyId = async () => {
    if (!log) return;
    await copyLogId(log.id);
    setCopySuccess("id");
    setTimeout(() => setCopySuccess(null), 2000);
  };

  if (!log) return null;

  const metadata = parseMetadata(log.meta);

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

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed z-[9999] inset-0 bg-black/50 backdrop-blur-xs z-40 transition-all duration-200 ease-in-out ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        onClick={(e) => e.stopPropagation()}
        className={`fixed z-[9999] right-0 top-0 h-full w-full max-w-3xl bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-all duration-500 ease-out overflow-y-auto will-change-transform ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
        style={{
          transitionTimingFunction: isOpen
            ? "cubic-bezier(0.16, 1, 0.3, 1)"
            : "cubic-bezier(0.4, 0, 1, 1)",
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Log Metadata
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopyLog}
              variant="ghost"
              size="sm"
              className="p-2"
              title="Copy log details"
              leftIcon={
                copySuccess === "log" ? (
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )
              }
            />
            <Button
              onClick={handleCopyId}
              variant="ghost"
              size="sm"
              className="p-2"
              title="Copy log ID"
              leftIcon={
                copySuccess === "id" ? (
                  <svg
                    className="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                    />
                  </svg>
                )
              }
            />
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="p-2"
              aria-label="Close sidebar"
              leftIcon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              }
            />
          </div>
        </div>

        {/* Content */}
        <div
          className={`p-6 space-y-6 transition-opacity duration-500 delay-100 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Log Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Log Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Level:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}
                    >
                      {log.level}
                    </span>
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Message:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100 text-right max-w-[70%] break-words">
                    {log.message}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Created At:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Metadata
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                {Object.entries(metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-3 last:pb-0"
                  >
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {key}
                    </div>
                    <div className="text-sm text-gray-900 dark:text-gray-100 break-words">
                      {typeof value === "object" && value !== null ? (
                        <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
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
                            {JSON.stringify(value, null, 2)}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <span>{String(value)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
