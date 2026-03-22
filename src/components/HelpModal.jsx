import React, { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';

export default function HelpModal({ open, onClose }) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-white/30 dark:bg-gray-900/60 backdrop-blur-md" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 p-0 text-left align-middle shadow-lg transition-all max-h-[90vh] overflow-y-auto focus:outline-none">
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
                  <DialogTitle
                    as="h2"
                    className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-300"
                  >
                    🖥️ Usage
                  </DialogTitle>
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
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
