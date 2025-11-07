"use client";

import { useAuth } from "../../providers/AuthProvider";

export function LogoutButton() {
  const { signOut, user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  return (
    <button
      onClick={signOut}
      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
    >
      Sign Out
    </button>
  );
}
