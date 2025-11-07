import { useState, useRef, useEffect } from "react";
import type { SearchField } from "@/components/common/FieldSearch";

export function useLogSearch(initialSearch?: string) {
  const [searchInput, setSearchInput] = useState(initialSearch || "");
  const [searchRegex, setSearchRegex] = useState(false);
  const [searchField, setSearchField] = useState<SearchField>("all");

  // Track the external initialSearch value separately from internal state
  const externalSearchRef = useRef<string | undefined>(initialSearch);
  const isInternalUpdateRef = useRef(false);

  // Sync with external prop changes - use setTimeout to defer update outside effect
  useEffect(() => {
    // Skip if this is an internal update
    if (isInternalUpdateRef.current) {
      return;
    }

    // Only update if external search changed and is different from current state
    if (externalSearchRef.current !== initialSearch && initialSearch !== undefined) {
      externalSearchRef.current = initialSearch;
      if (initialSearch !== searchInput) {
        // Defer state update to next tick to avoid synchronous setState in effect
        const timeoutId = setTimeout(() => {
          setSearchInput(initialSearch);
        }, 0);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [initialSearch, searchInput]);

  const wrappedSetSearchInput = (value: string) => {
    isInternalUpdateRef.current = true;
    setSearchInput(value);
    // Reset flag after state update completes
    setTimeout(() => {
      isInternalUpdateRef.current = false;
    }, 0);
  };

  return {
    searchInput,
    setSearchInput: wrappedSetSearchInput,
    searchRegex,
    setSearchRegex,
    searchField,
    setSearchField,
  };
}

