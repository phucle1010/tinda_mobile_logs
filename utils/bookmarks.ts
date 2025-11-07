/**
 * Bookmark management utilities
 */

import type { LogBookmark } from "@/types/log";

const BOOKMARKS_KEY = "tinda_logs_bookmarks";

export function getBookmarks(): LogBookmark[] {
  try {
    const data = localStorage.getItem(BOOKMARKS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addBookmark(logId: string, note?: string): LogBookmark {
  const bookmarks = getBookmarks();
  const bookmark: LogBookmark = {
    id: Date.now().toString(),
    logId,
    createdAt: new Date().toISOString(),
    note,
  };
  bookmarks.push(bookmark);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  return bookmark;
}

export function removeBookmark(logId: string): void {
  const bookmarks = getBookmarks().filter((b) => b.logId !== logId);
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

export function isBookmarked(logId: string): boolean {
  return getBookmarks().some((b) => b.logId === logId);
}

export function getBookmarkNote(logId: string): string | undefined {
  const bookmark = getBookmarks().find((b) => b.logId === logId);
  return bookmark?.note;
}

