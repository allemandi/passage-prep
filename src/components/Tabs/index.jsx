export default function Tabs({ tabValue, setTabValue }) {
  return (
    <nav
      className="
        flex justify-center gap-2 mb-2 overflow-x-auto no-scrollbar
        bg-app-surface/50
        backdrop-blur-md
        rounded-2xl
        border-2 border-app-border
        shadow-sm
        p-2
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
              min-w-[110px]
              md:min-w-0
              px-4 sm:px-6
              py-3
              text-xs sm:text-sm md:text-base
              font-bold tracking-tight
              rounded-xl
              text-center
              whitespace-nowrap
              transition-all duration-300
              focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/20
              ${
                isSelected
                  ? `
                    bg-primary-500 text-white shadow-md shadow-primary-500/20
                    dark:bg-primary-600
                  `
                  : `
                    bg-transparent text-app-text-muted
                    hover:bg-primary-50 hover:text-primary-600
                    dark:hover:bg-primary-900/30 dark:hover:text-primary-400
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
