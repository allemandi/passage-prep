export default function Tabs({ tabValue, setTabValue }) {
  return (
    <nav
      className="
        flex justify-center gap-2 mb-8 overflow-x-auto no-scrollbar
        bg-light-bg dark:bg-dark-bg
        rounded-lg p-1
        border border-gray-300 dark:border-gray-700
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
              flex-1
              py-2 px-6
              text-center
              whitespace-nowrap
              font-semibold tracking-wide
              rounded-lg
              transition
              border
              focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2
              ${
                isSelected
                  ? `
                    bg-primary-100 text-light-text border-primary-600
                    dark:bg-primary-700 dark:text-dark-text dark:border-primary-400
                  `
                  : `
                    bg-white text-light-text border-transparent
                    dark:bg-dark-bg dark:text-dark-text dark:border-transparent
                    hover:bg-gray-100 hover:text-primary-600
                    dark:hover:bg-gray-700 dark:hover:text-primary-400
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
