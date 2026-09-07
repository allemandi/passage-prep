import React from 'react';
import clsx from 'clsx';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-primary-900/40 shadow-sm focus-visible:ring-primary-500',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 disabled:bg-secondary-300 dark:disabled:bg-secondary-900/40 shadow-sm focus-visible:ring-secondary-500',
  outline: 'border-2 border-primary-500 text-primary-700 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-200 dark:hover:bg-primary-900/30 disabled:opacity-50 focus-visible:ring-primary-500',
  ghost: 'text-app-text-muted hover:bg-app-surface hover:text-app-text disabled:opacity-50 focus-visible:ring-primary-500',
};

const sizes = {
  sm: 'px-3.5 py-2 text-sm min-h-[40px]',
  md: 'px-5 py-3 text-base min-h-[48px]',
  lg: 'px-8 py-4 text-lg min-h-[56px]',
};

const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading,
  loadingText,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-2.5 rounded-xl font-bold transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:cursor-not-allowed',
        'active:scale-[0.98] hover:brightness-105 active:brightness-95 select-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
          <span>{loadingText || 'Loading...'}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
