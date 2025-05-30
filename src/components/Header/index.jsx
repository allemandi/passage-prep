import React from 'react';
import { Sun, Moon, BookOpen } from 'lucide-react';

export default function Header({ mode, setMode }) {
  return (
    <header className="bg-primary-600 dark:bg-primary-700 text-white shadow-md">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-5 sm:py-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <BookOpen className="w-10 h-10 sm:w-14 sm:h-14 text-primary-300" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight">PassagePrep</h1>
            <p className="text-sm sm:text-base text-primary-200">Build reusable Bible studies in seconds.</p>
          </div>
        </div>
        <button
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-md border-2 border-white/80 hover:border-primary-300 transition flex items-center justify-center text-white hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          {mode === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>
    </header>
  );
}
