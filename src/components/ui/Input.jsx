import React from 'react';
import clsx from 'clsx';

const Input = ({ label, id, error, className, isRequired, ...props }) => {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label} {isRequired && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        className={clsx(
          'w-full border rounded-lg p-2.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition',
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:border-sky-500',
          props.disabled && 'opacity-50 cursor-not-allowed'
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
