import { Tab, TabList } from '@headlessui/react';
import clsx from 'clsx';

export default function Tabs() {
  const tabs = ['Search & Format', 'Contribute'];

  return (
    <TabList
      className="
        flex justify-center items-center gap-2 mb-2 overflow-x-auto no-scrollbar
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
              'flex-grow min-w-[120px] md:min-w-0 px-4 sm:px-6 py-3',
              'text-xs sm:text-sm md:text-base font-bold tracking-tight rounded-xl',
              'text-center whitespace-nowrap transition-all duration-500',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/20',
              'active:scale-95',
              selected
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 dark:bg-primary-600 scale-105 z-10'
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
