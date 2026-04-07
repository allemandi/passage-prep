import { Sun, Moon, BookOpen, Shield } from 'lucide-react';
import React from 'react';
import clsx from 'clsx';

export default function Header({ mode, setMode, tabValue, setTabValue }) {
  const isAdminActive = tabValue === 2;

  const toggleAdmin = () => {
    setTabValue(isAdminActive ? 0 : 2);
  };

  return (
 <header
  className="
    bg-app-surface/60
    backdrop-blur-xl
    border-b border-app-border
    shadow-sm
    sticky top-0 z-30
  "
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
    {/* Logo + Title */}
    <div className="flex items-center gap-4">
      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl border-2 border-primary-200 dark:border-primary-800">
        <BookOpen
            className="w-7 h-7 text-primary-600 dark:text-primary-400 flex-shrink-0"
            aria-hidden="true"
        />
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-app-text">
          PassagePrep
        </h1>
        <p className="text-xs sm:text-sm text-app-text-muted mt-0.5 font-medium">
          Build reusable Bible studies in seconds.
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
    <button
      aria-label={isAdminActive ? 'Exit admin mode' : 'Enter admin mode'}
      title={isAdminActive ? 'Exit admin mode' : 'Enter admin mode'}
      onClick={toggleAdmin}
      type="button"
      className={clsx(
        "p-2.5 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-400/20 backdrop-blur-md",
        isAdminActive
          ? "bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20"
          : "bg-app-surface/40 border-primary-200 dark:border-primary-800 text-primary-600 dark:text-primary-400 hover:border-primary-400 dark:hover:border-primary-600"
      )}
    >
      <Shield className="w-6 h-6" />
    </button>

    <button
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
      type="button"
      className="
        p-2.5 rounded-xl border-2 border-primary-200 dark:border-primary-800
        bg-app-surface/40
        backdrop-blur-md
        hover:border-primary-400 dark:hover:border-primary-600
        text-primary-600 dark:text-primary-400
        transition-all duration-200
        focus:outline-none focus:ring-4 focus:ring-primary-400/20
      "
    >
      {mode === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </button>
    </div>
  </div>
</header>
  );
}
