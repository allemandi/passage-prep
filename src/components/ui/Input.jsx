import React from 'react';
import clsx from 'clsx';

const Input = ({ label, id, error, className, ...props }) => {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block mb-1.5 text-sm font-medium text-app-text"
        >
          {label} {props.required && <span className="text-secondary-600 font-bold">*</span>}
        </label>
      )}
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={clsx(
          'w-full border-2 rounded-lg p-2.5 bg-app-surface text-app-text focus:outline-none focus:ring-4 focus:ring-primary-400/20 transition-all duration-200',
          error
            ? 'border-secondary-400 focus:border-secondary-500 focus:ring-secondary-400/20'
            : 'border-app-border focus:border-primary-400',
          props.disabled && 'opacity-50 cursor-not-allowed bg-app-bg'
        )}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-secondary-600 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
