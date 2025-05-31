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
    bg-white/50 dark:bg-gray-900/60
    backdrop-blur-md
    border-b border-gray-200 dark:border-gray-800
    shadow-sm
    sticky top-0 z-30
  "
>
  <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex items-center justify-between">
    {/* Logo + Title */}
    <div className="flex items-center gap-4">
      <BookOpen
        className="w-10 h-10 text-sky-600 dark:text-sky-400 flex-shrink-0"
        aria-hidden="true"
      />
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-400">
          PassagePrep
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">
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
        p-2 rounded-xl border border-sky-400 dark:border-sky-800
        bg-white/40 dark:bg-gray-800/40
        backdrop-blur-md
        hover:border-sky-500 dark:hover:border-sky-400
        text-sky-700 dark:text-sky-300
        hover:!text-sky-900 dark:hover:!text-white
        focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-300
      "
    >
      {mode === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </button>
  </div>
</header>
  );
}
