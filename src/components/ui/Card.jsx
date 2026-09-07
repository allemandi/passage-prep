import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-app-surface border border-app-border/80 rounded-2xl shadow-sm hover:shadow-md p-6 sm:p-8',
        'transition-all duration-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
