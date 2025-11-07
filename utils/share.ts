/**
 * Generate shareable URL for current filters
 */
export function generateShareableUrl(params: Record<string, string | number | null | undefined>): string {
  const url = new URL(window.location.href);
  const baseUrl = url.origin + url.pathname;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return `${baseUrl}?${searchParams.toString()}`;
}

/**
 * Copy shareable URL to clipboard
 */
export async function copyShareableUrl(params: Record<string, string | number | null | undefined>): Promise<void> {
  const url = generateShareableUrl(params);
  try {
    await navigator.clipboard.writeText(url);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = url;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}

/**
 * Generate shareable URL for a specific log
 */
export function generateLogShareableUrl(logId: string): string {
  const url = new URL(window.location.href);
  const baseUrl = url.origin + url.pathname;
  return `${baseUrl}?logId=${logId}`;
}

