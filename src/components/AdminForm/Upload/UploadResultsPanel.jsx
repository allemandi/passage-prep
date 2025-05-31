const UploadResultsPanel = ({ results, themes }) => {
  if (!results) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4 sm:p-6 w-full max-w-full sm:max-w-2xl mt-6 shadow-md mx-auto break-words">
      <h2 className="text-lg sm:text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 mb-4 break-words">
        Upload Results
      </h2>

      <p className="text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base break-words">
        Total questions: <span className="font-medium">{results.totalQuestions}</span>
      </p>
      <p className="text-green-600 dark:text-green-400 font-medium mb-1 text-sm sm:text-base break-words">
        Successfully uploaded: {results.successful}
      </p>
      <p className="text-red-600 dark:text-red-400 font-medium mb-4 text-sm sm:text-base break-words">
        Failed to upload: {results.failed}
      </p>

      {results.errors.length > 0 && (
        <div className="mt-4">
          <h3 className="text-blue-600 font-bold mb-2 text-sm sm:text-base break-words">Errors:</h3>
          <div className="max-h-56 sm:max-h-72 overflow-y-auto border border-gray-300 dark:border-gray-700 rounded-md p-3 sm:p-4 space-y-3 text-sm sm:text-base break-words whitespace-normal">
            {results.errors.map((error, index) => (
              <div
                key={index}
                className={`pb-2 ${index < results.errors.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
              >
                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1 break-words">{error.question}</p>
                <p className="text-red-600 dark:text-red-400 break-words whitespace-normal">
                  <strong>Error:</strong> {error.error}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 italic text-xs sm:text-sm break-words">
            Tip: Make sure your CSV has the correct headers (theme, question, book, chapter,
            verseStart, verseEnd) and that values match the expected formats. For themes, use
            one of: {themes.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};


export default UploadResultsPanel;
