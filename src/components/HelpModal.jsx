import React from 'react';

export default function HelpModal({ open, onClose }) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        tabIndex={-1}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-300 dark:border-gray-700 flex items-center gap-2">
            <h2 id="help-modal-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              🖥️ Usage
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-6 text-gray-800 dark:text-gray-300">
            <section>
              <h3 className="font-semibold mb-2">Search &amp; Format</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Add scripture references.</li>
                <li>Click Search Questions.</li>
                <li>Select questions, then Generate Study to preview/copy.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">Contribute</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Select a theme.</li>
                <li>Enter a Bible reference.</li>
                <li>Write your question.</li>
                <li>Submit.</li>
              </ul>
            </section>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-gray-300 dark:border-gray-700 flex justify-end">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
