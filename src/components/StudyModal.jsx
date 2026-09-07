import React, { Fragment, useMemo } from 'react';
import { X, EllipsisVertical, Copy, FileText, FileCode } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useToast } from './ToastMessage/Toast';
import Button from './ui/Button';
import SectionHeader from './ui/SectionHeader';
import clsx from 'clsx';
import {
    groupQuestionsByBookAndTheme,
    generatePlainTextContent,
    generateMarkdownContent,
    generateRichTextContent
} from '../utils/studyUtils';
import { BIBLE_BOOK_REGEX, formatReference } from '../utils/bibleData';

const StudyModal = ({ show, onHide, data }) => {
    const showToast = useToast();
    const noQuestionString = 'Notice: No questions were selected. Please search and select questions to build your study guide.'

    if (!data || !data.filteredQuestions) {
        return null;
    }

    const groupedQuestions = useMemo(() =>
        groupQuestionsByBookAndTheme(data.filteredQuestions || [])
    , [data.filteredQuestions]);

    const orderedBooksList = useMemo(() => {
        const bookOrder = (data.refArr || [])
            .map(ref => {
                const match = ref.match(BIBLE_BOOK_REGEX);
                return match ? match[1].trim() : null;
            })
            .filter(Boolean);

        const uniqueBookOrder = [...new Set(bookOrder)];

        return [...Object.keys(groupedQuestions)].sort((a, b) => {
            const indexA = uniqueBookOrder.indexOf(a);
            const indexB = uniqueBookOrder.indexOf(b);

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }

            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            return a.localeCompare(b);
        });
    }, [data.refArr, groupedQuestions]);

    const plainTextContent = useMemo(() =>
        generatePlainTextContent(data, groupedQuestions, orderedBooksList, data.includeReferences)
    , [data, groupedQuestions, orderedBooksList]);

    const markdownContent = useMemo(() =>
        generateMarkdownContent(data, groupedQuestions, orderedBooksList, data.includeReferences)
    , [data, groupedQuestions, orderedBooksList]);

    const richTextContent = useMemo(() =>
        generateRichTextContent(data, groupedQuestions, orderedBooksList, data.includeReferences)
    , [data, groupedQuestions, orderedBooksList]);

    return (
        <Transition show={show} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onHide}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md" />
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
                            <DialogPanel className="w-full max-w-5xl transform overflow-hidden rounded-3xl bg-app-surface p-0 text-left align-middle shadow-2xl border-2 border-app-border transition-all flex flex-col max-h-[90vh]">
                                {/* Modal Header */}
                                <div className="bg-app-surface border-b-2 border-app-border py-5 px-8 flex justify-between items-center select-none">
                                    <div>
                                        <DialogTitle as="h2" className="text-2xl font-bold text-app-text">
                                            Your Bible Study Guide
                                        </DialogTitle>
                                        <p className="text-sm font-medium text-app-text-muted mt-0.5">
                                            Ready to review, print, or copy for distribution.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        aria-label="Close modal"
                                        onClick={onHide}
                                        className="text-app-text-muted hover:text-app-text hover:bg-app-bg p-2.5 rounded-2xl transition-colors focus:outline-none focus:ring-4 focus:ring-primary-500/20 min-h-[48px] min-w-[48px] flex items-center justify-center"
                                    >
                                        <X size={28} />
                                    </button>
                                </div>

                                <div className="overflow-y-auto p-6 sm:p-10 bg-app-bg/30 text-app-text flex flex-col gap-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                                    <section>
                                        <SectionHeader centered={false}>Selected Passages</SectionHeader>
                                        {data?.refArr && data.refArr.filter(Boolean).length > 0 ? (
                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none">
                                                {data.refArr.filter(Boolean).map((reference, index) => (
                                                    <li key={index} className="flex items-center gap-3 p-4 rounded-xl bg-primary-100/80 dark:bg-primary-900/40 text-primary-900 dark:text-primary-100 border-2 border-primary-300 dark:border-primary-800 font-bold text-base">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                                                        {reference}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="italic opacity-80 text-base">No Bible passages specified.</p>
                                        )}
                                    </section>

                                    <section>
                                        <SectionHeader centered={false}>Passage Context & Background</SectionHeader>
                                        {data?.contextArr && data.contextArr.length > 0 ? (
                                            <ul className="space-y-4 list-none">
                                                {data.contextArr.map((context, index) => (
                                                    <li key={index} className="p-5 rounded-2xl bg-app-surface border-2 border-app-border text-app-text text-base leading-relaxed font-medium shadow-sm">
                                                        {context}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="italic opacity-80 text-base">No background notes found for these passages.</p>
                                        )}
                                    </section>

                                    <section>
                                        <SectionHeader centered={false}>Study Discussion Questions</SectionHeader>
                                        {Object.keys(groupedQuestions).length > 0 ? (
                                            <div className="space-y-8">
                                                {orderedBooksList.map((book) => (
                                                    <div key={book} className="space-y-4">
                                                        <h4 className="text-xl font-extrabold text-app-text flex items-center gap-3">
                                                            <div className="w-2.5 h-7 bg-primary-600 rounded-full" />
                                                            {book}
                                                        </h4>
                                                        <div className="grid grid-cols-1 gap-6">
                                                            {Object.entries(groupedQuestions[book]).map(([theme, questions]) => (
                                                                <div key={theme} className="ml-2 sm:ml-4 p-6 rounded-2xl border-2 border-app-border bg-app-surface shadow-sm">
                                                                    <h5 className="text-lg font-bold mb-4 text-primary-700 dark:text-primary-300 border-b border-app-border pb-2">
                                                                        Theme: {theme}
                                                                    </h5>
                                                                    <ol className="space-y-4 list-decimal pl-6">
                                                                        {questions.map((question, qIndex) => (
                                                                            <li key={qIndex} className="text-app-text text-base leading-relaxed font-medium pl-2">
                                                                                {data.includeReferences && (
                                                                                    <span className="font-bold text-primary-800 dark:text-primary-200 mr-2 bg-primary-100 dark:bg-primary-900/50 px-2 py-0.5 rounded border border-primary-300 dark:border-primary-700">
                                                                                        {formatReference(question.book, question.chapter, question.verseStart, question.verseEnd)}
                                                                                    </span>
                                                                                )}
                                                                                {question.question}
                                                                            </li>
                                                                        ))}
                                                                    </ol>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="italic opacity-80 text-center py-10 bg-app-surface rounded-2xl border-2 border-dashed border-app-border text-base">
                                                {noQuestionString}
                                            </p>
                                        )}
                                    </section>
                                </div>

                                <div className="p-6 bg-app-surface border-t-2 border-app-border flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <Button variant="outline" onClick={onHide} className="w-full sm:w-auto text-base font-bold py-3.5 px-6">
                                        Close Window
                                    </Button>
                                    <div className="flex gap-3 w-full sm:w-auto relative">
                                        <Button
                                            onClick={async () => {
                                                try {
                                                    const blob = new Blob([richTextContent], { type: 'text/html' });
                                                    const clipboardItem = new ClipboardItem({
                                                        'text/html': blob,
                                                        'text/plain': new Blob([plainTextContent], { type: 'text/plain' }),
                                                    });
                                                    await navigator.clipboard.write([clipboardItem]);
                                                    showToast('Successfully copied study to clipboard!', 'success');
                                                } catch (err) {
                                                    showToast(err.message, 'error');
                                                    navigator.clipboard.writeText(plainTextContent).then(() => showToast('Successfully copied plain text', 'success'));
                                                }
                                            }}
                                            className="flex-grow sm:flex-grow-0 text-base font-bold py-3.5 px-8"
                                        >
                                            <Copy size={20} /> Copy Study Guide
                                        </Button>

                                        <Menu as="div" className="relative inline-block text-left">
                                            <MenuButton as={Fragment}>
                                                <Button
                                                    variant="outline"
                                                    className="px-4 h-full min-h-[48px]"
                                                    aria-label="More copy format options"
                                                >
                                                    <EllipsisVertical size={22} />
                                                </Button>
                                            </MenuButton>

                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <MenuItems className="absolute right-0 bottom-full mb-3 w-72 origin-bottom-right bg-app-surface border-2 border-app-border rounded-2xl shadow-2xl overflow-hidden z-20 focus:outline-none p-1.5">
                                                    <MenuItem>
                                                        {({ focus }) => (
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    navigator.clipboard.writeText(plainTextContent).then(() => {
                                                                        showToast('Successfully copied plain text', 'success');
                                                                    });
                                                                }}
                                                                className={clsx(
                                                                    focus ? 'bg-primary-100 dark:bg-primary-900/40' : '',
                                                                    'w-full text-left px-4 py-3.5 text-app-text font-bold text-base flex items-center gap-3 rounded-xl transition-colors min-h-[48px]'
                                                                )}
                                                            >
                                                                <FileText size={20} className="text-app-text-muted" />
                                                                <span>Copy as Plain Text</span>
                                                            </button>
                                                        )}
                                                    </MenuItem>
                                                    <MenuItem>
                                                        {({ focus }) => (
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    navigator.clipboard.writeText(markdownContent).then(() => {
                                                                        showToast('Successfully copied markdown', 'success');
                                                                    });
                                                                }}
                                                                className={clsx(
                                                                    focus ? 'bg-primary-100 dark:bg-primary-900/40' : '',
                                                                    'w-full text-left px-4 py-3.5 text-app-text font-bold text-base flex items-center gap-3 rounded-xl transition-colors border-t border-app-border min-h-[48px]'
                                                                )}
                                                            >
                                                                <FileCode size={20} className="text-app-text-muted" />
                                                                <span>Copy as Markdown</span>
                                                            </button>
                                                        )}
                                                    </MenuItem>
                                                    <MenuItem>
                                                        {({ focus }) => (
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    try {
                                                                        const blob = new Blob([richTextContent], { type: 'text/html' });
                                                                        const clipboardItem = new ClipboardItem({ 'text/html': blob });
                                                                        await navigator.clipboard.write([clipboardItem]);
                                                                        showToast('Successfully copied rich text', 'success');
                                                                    } catch (err) {
                                                                        showToast(err.message, 'error');
                                                                    }
                                                                }}
                                                                className={clsx(
                                                                    focus ? 'bg-primary-100 dark:bg-primary-900/40' : '',
                                                                    'w-full text-left px-4 py-3.5 text-app-text font-bold text-base flex items-center gap-3 rounded-xl transition-colors border-t border-app-border min-h-[48px]'
                                                                )}
                                                            >
                                                                <Copy size={20} className="text-app-text-muted" />
                                                                <span>Copy as Rich Text</span>
                                                            </button>
                                                        )}
                                                    </MenuItem>
                                                </MenuItems>
                                            </Transition>
                                        </Menu>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
};

export default StudyModal;
