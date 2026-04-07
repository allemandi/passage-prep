import { AlertCircle, XCircle, Info } from 'lucide-react';

const UploadResultsPanel = ({ results, themes }) => {
  if (!results) return null;

  return (
    <div
      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl overflow-hidden mt-6 shadow-xl max-w-2xl mx-auto"
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
          <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Total</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{results.totalQuestions}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400">
            <span className="text-xs font-bold uppercase tracking-wider mb-1">Success</span>
            <span className="text-2xl font-black">{results.successful}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400">
            <span className="text-xs font-bold uppercase tracking-wider mb-1">Failed</span>
            <span className="text-2xl font-black">{results.failed}</span>
          </div>
        </div>

        {results.errors.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <h3 className="text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Error Details
              </h3>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
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
                  className="group flex flex-col gap-1 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-900/30 transition-colors"
                  role="listitem"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight break-words flex-grow">
                      {error.question}
                    </p>
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1 leading-relaxed bg-red-50/50 dark:bg-red-900/10 px-3 py-2 rounded-lg border border-red-100/50 dark:border-red-900/20">
                    {error.error}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 italic text-sm text-center leading-relaxed max-w-md mx-auto">
            Tip: For bulk uploads, use themes: <span className="font-semibold text-primary-600 dark:text-primary-400">{themes.slice(0, 3).join(', ')}...</span> and ensure CSV headers are exactly as required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadResultsPanel;
