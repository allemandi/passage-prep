import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={clsx(
        'bg-app-surface border-2 border-app-border rounded-2xl shadow-xl p-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
