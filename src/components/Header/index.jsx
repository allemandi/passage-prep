import { Sun, Moon, BookOpen } from 'lucide-react';
import React from 'react';

export default function Header({ mode, setMode }) {
  React.useEffect(() => {
    const root = window.document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [mode]);

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
</header>
  );
}
