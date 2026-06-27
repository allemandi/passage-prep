import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-app-surface border-2 border-app-border rounded-[2rem] shadow-xl p-8 sm:p-10',
        'transition-all duration-500 hover:border-primary-300 dark:hover:border-primary-700/50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
