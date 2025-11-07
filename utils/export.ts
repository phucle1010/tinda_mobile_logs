import type { Log } from "@/types/log";

/**
 * Export logs to CSV format
 */
export function exportToCSV(logs: Log[]): void {
  if (logs.length === 0) {
    alert("No logs to export");
    return;
  }

  const headers = ["ID", "Created At", "Level", "Message", "Meta"];
  const rows = logs.map((log) => [
    log.id,
    log.created_at,
    log.level,
    log.message.replace(/"/g, '""'), // Escape quotes
    JSON.stringify(log.meta),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `logs_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export logs to JSON format
 */
export function exportToJSON(logs: Log[]): void {
  if (logs.length === 0) {
    alert("No logs to export");
    return;
  }

  const jsonContent = JSON.stringify(logs, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `logs_${new Date().toISOString().split("T")[0]}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy log to clipboard as formatted text
 */
export async function copyLogToClipboard(log: Log): Promise<void> {
  const formatted = `ID: ${log.id}
Created At: ${log.created_at}
Level: ${log.level}
Message: ${log.message}
Meta: ${JSON.stringify(log.meta, null, 2)}`;

  try {
    await navigator.clipboard.writeText(formatted);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = formatted;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}

/**
 * Copy log ID to clipboard
 */
export async function copyLogId(logId: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(logId);
  } catch (err) {
    const textArea = document.createElement("textarea");
    textArea.value = logId;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}

