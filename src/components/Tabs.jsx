import { Tab, TabList } from '@headlessui/react';
import clsx from 'clsx';

export default function Tabs() {
  const tabs = ['Search & Format', 'Contribute', 'Admin'];

  return (
    <TabList
      className="
        flex justify-center gap-2 mb-2 overflow-x-auto no-scrollbar
        bg-app-surface/60
        backdrop-blur-md
        rounded-2xl
        border-2 border-app-border
        shadow-md
        p-2
      "
    >
      {tabs.map((label) => (
        <Tab
          key={label}
          className={({ selected }) =>
            clsx(
              'flex-grow min-w-[110px] md:min-w-0 px-4 sm:px-6 py-3',
              'text-xs sm:text-sm md:text-base font-bold tracking-tight rounded-xl',
              'text-center whitespace-nowrap transition-all duration-300',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/20',
              selected
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20 dark:bg-primary-600'
                : 'bg-transparent text-app-text hover:bg-primary-100/50 hover:text-primary-700 dark:text-app-text-muted dark:hover:bg-primary-900/40 dark:hover:text-primary-300'
            )
          }
        >
          {label}
        </Tab>
      ))}
    </TabList>
  );
}
