import React from 'react';
import clsx from 'clsx';

const SectionHeader = React.forwardRef(({ children, className, centered = true, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      {...props}
      className={clsx(
        'text-2xl font-bold text-primary-600 dark:text-primary-400 border-b-4 border-primary-500/20 pb-4 mb-8 tracking-tight',
        centered ? 'text-center' : 'text-left',
        className
      )}
    >
      {children}
    </h2>
  );
});

SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
