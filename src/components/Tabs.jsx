import { Tab, TabList } from '@headlessui/react';
import clsx from 'clsx';

export default function Tabs() {
  const tabs = ['Search & Format', 'Contribute'];

  return (
    <TabList className="flex justify-center items-center gap-2 overflow-x-auto no-scrollbar bg-app-surface/80 backdrop-blur-md rounded-2xl border border-app-border shadow-2xs p-1.5">
      {tabs.map((label) => (
        <Tab
          key={label}
          className={({ selected }) =>
            clsx(
              'flex-grow min-w-[130px] md:min-w-0 px-5 py-2.5',
              'text-sm md:text-base font-bold tracking-tight rounded-xl',
              'text-center whitespace-nowrap transition-all duration-200 cursor-pointer select-none',
              'focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 active:scale-[0.98]',
              selected
                ? 'bg-primary-600 text-white shadow-sm dark:bg-primary-500'
                : 'text-app-text-muted hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-app-text'
            )
          }
        >
          {label}
        </Tab>
      ))}
    </TabList>
  );
}
