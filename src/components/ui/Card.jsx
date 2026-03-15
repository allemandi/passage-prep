import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-app-surface border border-app-border rounded-xl shadow-sm p-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
