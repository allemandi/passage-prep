import React from 'react';
import { Check } from 'lucide-react';
import clsx from 'clsx';

const Checkbox = ({
  id,
  label,
  checked,
  onChange,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onChange(!checked)}
      >
        <div className="relative flex items-center justify-center">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className={clsx(
              "peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 transition-all duration-200",
              "border-app-border bg-app-surface",
              "checked:bg-primary-500 checked:border-primary-500",
              "focus:outline-none focus:ring-4 focus:ring-primary-500/10",
              "hover:border-primary-400 dark:hover:border-primary-600"
            )}
            {...props}
          />
          <Check
            size={14}
            className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none stroke-[3]"
          />
        </div>
        {label && (
          <label
            htmlFor={id}
            className={clsx(
              "text-base font-bold select-none cursor-pointer transition-colors duration-200",
              "text-app-text group-hover:text-primary-600 dark:group-hover:text-primary-400"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {label}
          </label>
        )}
      </div>
      {helperText && (
        <p className="text-xs text-app-text-muted ml-8 transition-opacity duration-200">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Checkbox;
