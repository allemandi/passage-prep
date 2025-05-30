export default function Tabs({ tabValue, setTabValue }) {
  return (
    <nav
      className="flex justify-center border-b border-gray-300 dark:border-gray-700 mb-8 overflow-x-auto no-scrollbar"
      role="tablist"
      aria-label="Main tabs"
    >
      {[ 'Search & Format', 'Contribute', 'Admin' ].map((label, id) => (
        <button
          key={id}
          role="tab"
          aria-selected={tabValue === id}
          aria-controls={`tabpanel-${id}`}
          id={`tab-${id}`}
          onClick={() => setTabValue(id)}
          className={`w-[140px] py-3 mx-3 font-semibold tracking-wide text-center whitespace-nowrap transition
            ${
              tabValue === id
                ? 'border-b-4 border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
            }
          `}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
