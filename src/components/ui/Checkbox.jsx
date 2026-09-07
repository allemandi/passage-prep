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
    <div className={clsx("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-3.5 group cursor-pointer min-h-[44px]">
        <div className="relative flex items-center justify-center flex-shrink-0">
          <input
            id={id}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            className={clsx(
              "peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 transition-all duration-200",
              "border-app-border bg-app-surface",
              "checked:bg-primary-600 checked:border-primary-600 dark:checked:bg-primary-500 dark:checked:border-primary-500",
              "indeterminate:bg-primary-600 indeterminate:border-primary-600 dark:indeterminate:bg-primary-500 dark:indeterminate:border-primary-500",
              "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-400/30",
              "hover:border-primary-500 dark:hover:border-primary-400"
            )}
            {...props}
          />
          <Check
            size={16}
            className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none stroke-[3]"
          />
          <Minus
            size={16}
            className="absolute text-white opacity-0 peer-indeterminate:opacity-100 transition-opacity pointer-events-none stroke-[3]"
          />
        </div>
        {label && (
          <label
            htmlFor={id}
            className={clsx(
              "text-base font-bold select-none cursor-pointer transition-colors duration-200 leading-snug",
              "text-app-text group-hover:text-primary-700 dark:group-hover:text-primary-300"
            )}
          >
            {label}
          </label>
        )}
      </div>
      {helperText && (
        <p className="text-sm text-app-text-muted ml-9 transition-opacity duration-200 font-medium">
          {helperText}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
