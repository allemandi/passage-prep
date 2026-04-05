import React from 'react';
import clsx from 'clsx';

const FormField = ({
  label,
  id,
  error,
  helperText,
  className,
  as: Component = 'input',
  ...props
}) => {
  const isTextarea = Component === 'textarea';

  return (
    <div className={clsx('w-full group', className)}>
      {label && (
        <label
          htmlFor={id}
          className={clsx(
            "block mb-1.5 text-sm font-semibold transition-colors duration-200",
            error ? "text-secondary-600 dark:text-secondary-400" : "text-app-text group-focus-within:text-primary-600 dark:group-focus-within:text-primary-400"
          )}
        >
          {label} {props.required && <span className="text-secondary-600 font-bold" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        <Component
          id={id}
          aria-invalid={!!error}
          aria-describedby={clsx(
            error && `${id}-error`,
            helperText && `${id}-helper`
          )}
          className={clsx(
            'w-full border-2 rounded-xl p-2.5 bg-app-surface text-app-text transition-all duration-200 shadow-sm',
            'focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500',
            isTextarea && 'p-4 resize-none min-h-[120px]',
            error
              ? 'border-secondary-400 focus:border-secondary-500 focus:ring-secondary-500/10 shadow-secondary-100/50'
              : 'border-app-border hover:border-primary-300',
            props.disabled && 'opacity-50 cursor-not-allowed bg-app-bg grayscale'
          )}
          {...props}
        />
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-xs text-secondary-600 dark:text-secondary-400 font-bold flex items-center gap-1 animate-in fade-in slide-in-from-top-1"
        >
          <span className="inline-block w-1 h-1 rounded-full bg-current" />
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${id}-helper`} aria-live="polite" className="mt-1.5 text-xs text-app-text-muted flex items-center gap-1">
           <span className="inline-block w-1 h-1 rounded-full bg-current opacity-50" />
           {helperText}
        </p>
      )}
    </div>
  );
};

export default FormField;
