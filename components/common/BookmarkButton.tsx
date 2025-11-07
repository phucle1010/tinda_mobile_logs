"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { addBookmark, removeBookmark, isBookmarked } from "@/utils/bookmarks";

interface BookmarkButtonProps {
  logId: string;
  onBookmarkChange?: (bookmarked: boolean) => void;
}

export function BookmarkButton({ logId, onBookmarkChange }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(logId));

  // Track the external logId value separately from internal state
  const externalLogIdRef = useRef<string>(logId);
  const isInternalUpdateRef = useRef(false);

  // Sync with external prop changes - use setTimeout to defer update outside effect
  useEffect(() => {
    // Skip if this is an internal update
    if (isInternalUpdateRef.current) {
      return;
    }

    // Only update if logId actually changed
    if (externalLogIdRef.current !== logId) {
      externalLogIdRef.current = logId;
      const isCurrentlyBookmarked = isBookmarked(logId);
      if (isCurrentlyBookmarked !== bookmarked) {
        // Defer state update to next tick to avoid synchronous setState in effect
        const timeoutId = setTimeout(() => {
          setBookmarked(isCurrentlyBookmarked);
        }, 0);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [logId, bookmarked]);

  const handleToggle = () => {
    isInternalUpdateRef.current = true;
    if (bookmarked) {
      removeBookmark(logId);
      setBookmarked(false);
      onBookmarkChange?.(false);
    } else {
      addBookmark(logId);
      setBookmarked(true);
      onBookmarkChange?.(true);
    }
    // Reset flag after state update completes
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  };

  return (
    <Button
      onClick={handleToggle}
      variant="ghost"
      size="sm"
      title={bookmarked ? "Remove bookmark" : "Add bookmark"}
      leftIcon={
        <svg
          className={`w-4 h-4 ${bookmarked ? "text-yellow-500 fill-yellow-500" : "text-gray-400"}`}
          fill={bookmarked ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      }
    />
  );
}

