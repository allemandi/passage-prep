import { AlertCircle, XCircle, Info } from 'lucide-react';

const UploadResultsPanel = ({ results, themes }) => {
  if (!results) return null;

  return (
    <div
      className="bg-app-surface border border-app-border rounded-2xl overflow-hidden mt-6 shadow-xl max-w-2xl mx-auto"
      role="region"
      aria-labelledby="upload-results-title"
    >
      <div className="bg-primary-600 dark:bg-primary-700 px-6 py-4">
        <h2
          id="upload-results-title"
          className="text-xl font-bold text-white flex items-center gap-2"
        >
          <Info className="w-5 h-5" />
          Upload Summary
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-8" aria-live="polite">
          <div className="flex flex-col items-center p-3 bg-secondary-50/60 dark:bg-stone-900/50 rounded-xl border border-app-border">
            <span className="text-xs text-app-text-muted font-bold uppercase tracking-wider mb-1">Total</span>
            <span className="text-2xl font-black text-app-text">{results.totalQuestions}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider mb-1">Success</span>
            <span className="text-2xl font-black">{results.successful}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-rose-50 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400">
            <span className="text-xs font-bold uppercase tracking-wider mb-1">Failed</span>
            <span className="text-2xl font-black">{results.failed}</span>
          </div>
        </div>

        {results.errors?.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-app-border pb-2">
              <h3 className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Error Details
              </h3>
              <span className="text-xs font-medium text-app-text-muted bg-secondary-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
                {results.errors.length} {results.errors.length === 1 ? 'error' : 'errors'}
              </span>
            </div>

            <div
              className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar"
              role="list"
            >
              {results.errors.map((error, index) => (
                <div
                  key={index}
                  className="group flex flex-col gap-1 p-4 bg-app-bg/50 rounded-xl border border-app-border hover:border-rose-300 dark:hover:border-rose-900/40 transition-colors"
                  role="listitem"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-app-text leading-tight break-words flex-grow">
                      {error.question}
                    </p>
                    <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-sm text-rose-600 dark:text-rose-400 mt-1 leading-relaxed bg-rose-50/50 dark:bg-rose-950/20 px-3 py-2 rounded-lg border border-rose-200/50 dark:border-rose-900/30">
                    {error.error}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(themes) && themes.length > 0 && (
          <div className="mt-8 pt-6 border-t border-app-border">
            <p className="text-app-text-muted italic text-sm text-center leading-relaxed max-w-md mx-auto">
              Tip: For bulk uploads, use valid themes: <span className="font-semibold text-primary-600 dark:text-primary-400">{themes.slice(0, 3).join(', ')}...</span> and ensure CSV headers match the exact template.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadResultsPanel;
