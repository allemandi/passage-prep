import { Sun, Moon, BookOpen } from 'lucide-react';

export default function Header({ mode, setMode }) {
  return (
    <header className="bg-primary-600 dark:bg-primary-700 text-white shadow-md">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-5 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-4">
          <BookOpen className="w-12 h-12 text-primary-300 flex-shrink-0" />
          <div>
            <h1 className="text-3xl font-semibold leading-tight">PassagePrep</h1>
            <p className="text-sm text-primary-200 mt-1">Build reusable Bible studies in seconds.</p>
          </div>
        </div>

        {/* Dark mode toggle */}
        <button
          aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
          className="p-3 rounded-md border-2 border-white/80 hover:border-primary-300 transition flex items-center justify-center text-white hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
          type="button"
        >
          {mode === 'dark' ? (
            <Sun className="w-6 h-6 transition-colors duration-300" />
          ) : (
            <Moon className="w-6 h-6 transition-colors duration-300" />
          )}
        </button>
      </div>
    </header>
  );
}
