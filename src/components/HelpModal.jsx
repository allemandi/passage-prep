import React, { Fragment } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import Button from './ui/Button';

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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-app-surface border-2 border-app-border p-0 text-left align-middle shadow-2xl transition-all max-h-[90vh] overflow-y-auto focus:outline-none">
                {/* Header */}
                <div className="bg-app-surface/80 border-b-2 border-app-border py-4 px-6 flex justify-between items-center select-none">
                  <DialogTitle
                    as="h2"
                    className="text-xl font-bold text-primary-600 dark:text-primary-400"
                  >
                    🖥️ Usage &amp; Guide
                  </DialogTitle>
                  <button
                    aria-label="close"
                    onClick={onClose}
                    className="text-app-text-muted hover:text-app-text hover:bg-app-bg p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-8 text-app-text">
                  <section>
                    <h3 className="text-lg font-bold mb-3 text-app-text flex items-center gap-2">
                      <div className="w-2 h-5 bg-primary-500 rounded-full" />
                      Search &amp; Format
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-app-text-muted leading-relaxed pl-2">
                      <li>Add scripture references.</li>
                      <li>Click Search Questions.</li>
                      <li>Select questions, then Generate Study to preview/copy.</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold mb-3 text-app-text flex items-center gap-2">
                      <div className="w-2 h-5 bg-primary-500 rounded-full" />
                      Contribute
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-app-text-muted leading-relaxed pl-2">
                      <li>Select a theme.</li>
                      <li>Enter a Bible reference.</li>
                      <li>Write your question.</li>
                      <li>Submit for review.</li>
                    </ul>
                  </section>
                </div>

                {/* Actions */}
                <div className="p-6 bg-app-surface/80 border-t-2 border-app-border flex justify-end">
                  <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                    Close
                  </Button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
