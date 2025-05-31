export default function Tabs({ tabValue, setTabValue }) {
  return (
    <nav
      className="
        flex justify-center gap-1 mb-8 overflow-x-auto no-scrollbar
        bg-white/50 dark:bg-gray-900/60
        backdrop-blur-md
        rounded-lg
        border border-gray-200 dark:border-gray-800
        shadow-sm
        px-1 py-1
      "
      role="tablist"
      aria-label="Main tabs"
    >
      {['Search & Format', 'Contribute', 'Admin'].map((label, id) => {
        const isSelected = tabValue === id;
        return (
          <button
            key={id}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`tabpanel-${id}`}
            id={`tab-${id}`}
            onClick={() => setTabValue(id)}
            className={`
              flex-grow
              min-w-[100px]
              md:min-w-0
              px-3 sm:px-5
              py-2
              text-xs sm:text-sm md:text-base
              font-semibold tracking-wide
              rounded-lg
              border-2
              ring-1 ring-gray-200 dark:ring-gray-700
              text-center
              whitespace-nowrap
              transition
              focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2
              ${
                isSelected
                  ? `
                    bg-sky-100 text-sky-700 border-sky-600 ring-sky-600
                    dark:bg-sky-700 dark:text-white dark:border-sky-400 dark:ring-sky-400
                  `
                  : `
                    bg-white text-gray-900 border-transparent
                    dark:bg-gray-900 dark:text-gray-400 dark:border-transparent
                    hover:bg-gray-100 hover:text-sky-600
                    dark:hover:bg-gray-800 dark:hover:text-sky-400
                  `
              }
            `}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
