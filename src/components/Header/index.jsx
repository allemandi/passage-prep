import { Sun, Moon, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [mode, setMode] = useState('light');

  // Optional: sync with localStorage and html class for persistence
  useEffect(() => {
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
      className="bg-lightBg dark:bg-darkBg
                 text-lightText dark:text-darkText
                 shadow-md-light dark:shadow-md-dark
                 border-b border-gray-200 dark:border-gray-800
                 transition-colors duration-300"
    >
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-5 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-4">
          <BookOpen
            className="w-12 h-12 text-primary-500 dark:text-primary-300 flex-shrink-0 transition-colors duration-300"
            aria-hidden="true"
          />
          <div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              PassagePrep
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Build reusable Bible studies in seconds.
            </p>
          </div>
        </div>

        {/* Dark mode toggle */}
        <button
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          type="button"
          className="p-2 sm:p-3 rounded-xl border border-primary-100 dark:border-gray-700
                     bg-white/40 dark:bg-gray-800/40
                     backdrop-blur hover:border-primary-500 dark:hover:border-primary-400
                     text-primary-700 dark:text-primary-200 hover:text-primary-600 dark:hover:text-primary-300
                     transition-colors duration-300
                     focus:outline-none focus:ring-2 focus:ring-primary-400 dark:focus:ring-primary-300"
        >
          {mode === 'dark' ? (
            <Sun className="w-6 h-6" />
          ) : (
            <Moon className="w-6 h-6" />
          )}
        </button>
      </div>
    </header>
  );
}
