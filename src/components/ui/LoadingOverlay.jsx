import React from 'react';
import { LoaderCircle } from 'lucide-react';
import clsx from 'clsx';

const LoadingOverlay = ({
  isLoading,
  children,
  className,
  spinnerSize = 40,
  minHeight = "200px"
}) => {
  return (
    <div className={clsx("relative w-full", className)} style={{ minHeight: isLoading ? minHeight : 'auto' }}>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-app-bg/60 z-20 rounded-2xl backdrop-blur-md animate-fade-in"
          role="status"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-4 animate-zoom-in">
            <div className="relative">
              <LoaderCircle
                className="text-primary-500 animate-spin"
                size={spinnerSize}
              />
              <div className="absolute inset-0 blur-xl bg-primary-400/20 animate-pulse rounded-full" />
            </div>
            <span className="text-sm font-bold text-primary-600 dark:text-primary-400 tracking-wider uppercase animate-pulse">
                Loading
            </span>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default LoadingOverlay;
