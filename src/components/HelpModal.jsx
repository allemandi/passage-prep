export default function HelpModal({ open, onClose }) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="
          fixed inset-0 
          bg-white/30 dark:bg-gray-900/60 
          backdrop-blur-md 
          z-40
        "
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-modal-title"
        tabIndex={-1}
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
      >
        <div
          className="
            bg-white/90 dark:bg-gray-900/90 
            backdrop-blur-md 
            border border-gray-200 dark:border-gray-800 
            rounded-xl 
            shadow-lg 
            max-w-lg w-full max-h-[90vh] 
            overflow-y-auto
            focus:outline-none
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
            <h2
              id="help-modal-title"
              className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-300"
            >
              🖥️ Usage
            </h2>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-8 text-gray-800 dark:text-gray-300">
            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                Search &amp; Format
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-400 leading-relaxed">
                <li>Add scripture references.</li>
                <li>Click Search Questions.</li>
                <li>Select questions, then Generate Study to preview/copy.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
                Contribute
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-400 leading-relaxed">
                <li>Select a theme.</li>
                <li>Enter a Bible reference.</li>
                <li>Write your question.</li>
                <li>Submit.</li>
              </ul>
            </section>
          </div>

          {/* Actions */}
          <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-800 flex justify-end">
            <button
              onClick={onClose}
              className="
                p-2.5 px-6 
                rounded-xl 
                border border-sky-100 dark:border-sky-800
                bg-white/40 dark:bg-gray-800/40
                backdrop-blur-md
                text-sky-700 dark:text-sky-300
                hover:border-sky-500 dark:hover:border-sky-400
                hover:!text-sky-900 dark:hover:!text-white
                font-semibold
                focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-300
                transition
              "
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
