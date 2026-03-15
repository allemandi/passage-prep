import React from 'react';
import clsx from 'clsx';

const SectionHeader = ({ children, className, centered = true }) => {
  return (
    <h2
      className={clsx(
        'text-2xl font-semibold text-sky-700 dark:text-sky-400 border-b-2 border-sky-700 dark:border-sky-400 pb-2 mb-8 tracking-wide',
        centered ? 'text-center' : 'text-left',
        className
      )}
    >
      {children}
    </h2>
  );
};

export default SectionHeader;
