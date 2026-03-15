import React from 'react';
import clsx from 'clsx';

const variants = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 disabled:bg-primary-300 shadow-sm transition-all duration-200',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 disabled:bg-secondary-300 shadow-sm transition-all duration-200',
  outline: 'border-2 border-primary-400 text-primary-600 hover:bg-primary-50 dark:border-primary-500/50 dark:text-primary-300 dark:hover:bg-primary-900/20 disabled:opacity-50 transition-all duration-200',
  ghost: 'text-app-text-muted hover:bg-app-surface hover:text-app-text disabled:opacity-50 transition-all duration-200',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-8 py-3.5 text-lg',
};

const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  ...props
}) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
