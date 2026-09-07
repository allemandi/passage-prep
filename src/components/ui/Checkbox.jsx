import React from 'react';
import { Check, Minus } from 'lucide-react';
import clsx from 'clsx';

const Checkbox = React.forwardRef(({
  id,
  label,
  checked,
  onChange,
  helperText,
  className,
  ...props
}, ref) => {
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-3 cursor-pointer min-h-[44px]">
        <div className="relative flex items-center justify-center flex-shrink-0">
          <input
            id={id}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            className={clsx(
              "peer h-5 w-5 cursor-pointer appearance-none rounded-md border transition-all duration-200",
              "border-stone-300 dark:border-stone-700 bg-app-surface",
              "checked:bg-primary-600 checked:border-primary-600 dark:checked:bg-primary-500 dark:checked:border-primary-500",
              "indeterminate:bg-primary-600 indeterminate:border-primary-600 dark:indeterminate:bg-primary-500 dark:indeterminate:border-primary-500",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/20",
              "hover:border-primary-500 dark:hover:border-primary-400"
            )}
            {...props}
          />
          <Check
            size={14}
            className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none stroke-[3]"
          />
          <Minus
            size={14}
            className="absolute text-white opacity-0 peer-indeterminate:opacity-100 transition-opacity pointer-events-none stroke-[3]"
          />
        </div>
        {label && (
          <label
            htmlFor={id}
            className={clsx(
              "text-base font-semibold select-none cursor-pointer transition-colors duration-200 leading-snug",
              "text-app-text hover:text-primary-600 dark:hover:text-primary-400"
            )}
          >
            {label}
          </label>
        )}
      </div>
      {helperText && (
        <p className="text-sm text-app-text-muted ml-8 transition-opacity duration-200 font-normal">
          {helperText}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
