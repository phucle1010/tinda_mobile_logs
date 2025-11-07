"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export type SearchField = "message" | "metadata" | "all";

interface FieldSearchProps {
  onSearch: (query: string, field: SearchField) => void;
  initialValue?: string;
  initialField?: SearchField;
}

export function FieldSearch({
  onSearch,
  initialValue = "",
  initialField = "all",
}: FieldSearchProps) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [searchField, setSearchField] = useState<SearchField>(initialField);

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(searchValue, searchField);
    }
  };

  return (
    <div className="flex gap-2">
      <div className="w-32">
        <Select
          value={searchField}
          onChange={(value) => setSearchField(value as SearchField)}
          options={[
            { value: "all", label: "All Fields" },
            { value: "message", label: "Message" },
            { value: "metadata", label: "Metadata" },
          ]}
          size="md"
        />
      </div>
      <input
        type="text"
        placeholder={`Search in ${searchField === "all" ? "all fields" : searchField}...`}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
      />
      <Button onClick={handleSearch} variant="primary" size="md">
        Search
      </Button>
    </div>
  );
}

