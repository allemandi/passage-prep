import { Sun, Moon, BookOpen, Shield } from 'lucide-react';
import React from 'react';
import clsx from 'clsx';
import { SEO_CONFIG } from '../utils/seoConfig';

export default function Header({ mode, setMode, tabValue, setTabValue }) {
  const isAdminActive = tabValue === 2;

  const toggleAdmin = () => {
    setTabValue(isAdminActive ? 0 : 2);
  };

  return (
 <header
  className="
    bg-app-surface/80
    backdrop-blur-xl
    border-b border-app-border
    shadow-2xs
    sticky top-0 z-30
  "
>
  <div className="w-full px-4 sm:px-6 lg:px-12 py-3.5 flex items-center justify-between">
    {/* Logo + Title */}
    <div className="flex items-center gap-3.5">
      <div className="p-2 bg-primary-100 dark:bg-primary-950/60 rounded-xl border border-primary-200 dark:border-primary-800">
        <BookOpen
            className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0"
            aria-hidden="true"
        />
      </div>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-app-text">
          {SEO_CONFIG.title}
        </h1>
        <p className="text-xs sm:text-sm text-app-text-muted font-medium">
          {SEO_CONFIG.tagline}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
    <button
      aria-label={isAdminActive ? 'Exit admin mode' : 'Enter admin mode'}
      aria-pressed={isAdminActive}
      title={isAdminActive ? 'Exit admin mode' : 'Enter admin mode'}
      onClick={toggleAdmin}
      type="button"
      className={clsx(
        "p-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-400/20 backdrop-blur-md min-h-[40px] min-w-[40px] flex items-center justify-center",
        isAdminActive
          ? "bg-primary-600 border-primary-600 text-white shadow-sm"
          : "bg-app-surface/60 border-stone-200 dark:border-stone-800 text-primary-600 dark:text-primary-400 hover:border-primary-400 dark:hover:border-primary-600"
      )}
    >
      <Shield className="w-5 h-5" />
    </button>

    <button
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
      type="button"
      className="
        p-2 rounded-xl border border-stone-200 dark:border-stone-800
        bg-app-surface/60
        backdrop-blur-md
        hover:border-primary-400 dark:hover:border-primary-600
        text-primary-600 dark:text-primary-400
        transition-all duration-200
        focus:outline-none focus:ring-4 focus:ring-primary-400/20
        min-h-[40px] min-w-[40px] flex items-center justify-center
      "
    >
      {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
    </div>
  </div>
</header>
  );
}
