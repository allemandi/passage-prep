import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-white/50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm backdrop-blur-md p-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
