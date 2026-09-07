import React from 'react';
import clsx from 'clsx';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-stone-300 dark:disabled:bg-stone-800 shadow-sm focus-visible:ring-primary-500',
  secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 disabled:bg-stone-300 dark:disabled:bg-stone-800 shadow-sm focus-visible:ring-secondary-500',
  outline: 'border border-primary-600/80 text-primary-700 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-200 dark:hover:bg-primary-950/40 disabled:opacity-50 focus-visible:ring-primary-500',
  ghost: 'text-app-text-muted hover:bg-stone-100 hover:text-app-text dark:hover:bg-stone-800/60 disabled:opacity-50 focus-visible:ring-primary-500',
};

const sizes = {
  sm: 'px-3.5 py-2 text-sm min-h-[40px]',
  md: 'px-5 py-2.5 text-base min-h-[44px]',
  lg: 'px-7 py-3 text-lg min-h-[52px]',
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
        'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20 disabled:cursor-not-allowed select-none',
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
