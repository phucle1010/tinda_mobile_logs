import { LogViewer } from "@/components/LogViewer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogoutButton } from "@/components/LogoutButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Tinda Mobile Logs
            </h1>
            <div className="flex items-center gap-4">
              {/* <ThemeToggle /> */}
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>
      <main className="py-8">
        <LogViewer />
      </main>
    </div>
  );
}
