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
          className="absolute inset-0 flex items-center justify-center bg-app-bg/50 z-10 rounded-lg backdrop-blur-[1px]"
          role="progressbar"
          aria-busy="true"
          aria-live="polite"
        >
          <LoaderCircle
            className="text-primary-500 animate-spin"
            size={spinnerSize}
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default LoadingOverlay;
