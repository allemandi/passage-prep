import React from 'react';
import clsx from 'clsx';

const SectionHeader = ({ children, className, centered = true }) => {
  return (
    <h2
      className={clsx(
        'text-2xl font-bold text-primary-600 dark:text-primary-400 border-b-4 border-primary-500/20 pb-4 mb-8 tracking-tight',
        centered ? 'text-center' : 'text-left',
        className
      )}
    >
      {children}
    </h2>
  );
};

export default SectionHeader;
