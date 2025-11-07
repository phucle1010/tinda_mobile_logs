/**
 * Highlight search terms in text
 */
export function highlightText(text: string, searchTerm: string): string {
  if (!searchTerm || !text) return text;

  try {
    // Try regex first if it looks like a regex pattern
    const isRegex = /^\/.+\/[gimuy]*$/.test(searchTerm.trim());
    let regex: RegExp;

    if (isRegex) {
      // Extract pattern and flags from regex string like "/pattern/flags"
      const match = searchTerm.trim().match(/^\/(.+)\/([gimuy]*)$/);
      if (match) {
        const [, pattern, flags] = match;
        regex = new RegExp(pattern, flags || "gi");
      } else {
        regex = new RegExp(searchTerm, "gi");
      }
    } else {
      // Escape special regex characters for plain text search
      const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      regex = new RegExp(`(${escaped})`, "gi");
    }

    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  } catch {
    // If regex fails, do simple string replacement
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
  }
}

/**
 * Check if a string is a valid regex pattern
 */
export function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

