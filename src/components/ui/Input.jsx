import React from 'react';
import clsx from 'clsx';

const Input = ({ label, id, error, className, isRequired, ...props }) => {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block mb-1.5 text-sm font-medium text-app-text"
        >
          {label} {isRequired && <span className="text-secondary-500">*</span>}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'w-full border rounded-lg p-2.5 bg-app-surface text-app-text focus:outline-none focus:ring-2 focus:ring-primary-500 transition',
          error
            ? 'border-secondary-500 focus:ring-secondary-500'
            : 'border-app-border focus:border-primary-500',
          props.disabled && 'opacity-50 cursor-not-allowed bg-app-bg'
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
