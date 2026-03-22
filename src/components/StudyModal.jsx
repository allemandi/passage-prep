import React, { Fragment } from 'react';
import { X, MoreVertical, Copy, FileText, FileCode } from 'lucide-react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { useToast } from './ToastMessage/Toast';
import Button from './ui/Button';
import SectionHeader from './ui/SectionHeader';
import clsx from 'clsx';

const StudyModal = ({ show, onHide, data }) => {
    const showToast = useToast();
    const noQuestionString = 'Notice: Questions were not selected. Use Search and tick checkboxes against table questions to fill this space, or use the Contribute section to submit your own questions.'

    if (!data || !data.filteredQuestions) {
        return null;
    }

    const groupQuestionsByBookAndTheme = (questions) => {
        const grouped = {};
        questions.forEach(question => {
            if (!grouped[question.book]) {
                grouped[question.book] = {};
            }

            if (!grouped[question.book][question.theme]) {
                grouped[question.book][question.theme] = [];
            }

            grouped[question.book][question.theme].push(question);
        });
        return grouped;
    };

    const groupedQuestions = groupQuestionsByBookAndTheme(data.filteredQuestions || []);

    const bookOrder = (data.refArr || [])
        .map(ref => {
            const match = ref.match(/^((?:\d+\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)/i);
            return match ? match[1].trim() : null;
        })
        .filter(Boolean);

    const uniqueBookOrder = [...new Set(bookOrder)];

    const orderedBooksList = [...Object.keys(groupedQuestions)].sort((a, b) => {
        const indexA = uniqueBookOrder.indexOf(a);
        const indexB = uniqueBookOrder.indexOf(b);

        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        }

        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        return a.localeCompare(b);
    });

    const generatePlainTextContent = () => {
        let plainText = '';
        plainText += 'Bible References:\n';
        if (data?.refArr && data.refArr.filter(ref => ref).length > 0) {
            data.refArr.filter(ref => ref).forEach(reference => {
                plainText += `- ${reference}\n`;
            });
        } else {
            plainText += 'No Bible references specified.\n';
        }
        plainText += '\n';
        plainText += 'General Context:\n';
        if (data?.contextArr && data.contextArr.length > 0) {
            data.contextArr.forEach(context => {
                plainText += `- ${context}\n`;
            });
        } else {
            plainText += 'No context information available.\n';
        }
        plainText += '\n';

        plainText += 'Questions by Book and Theme:\n';
        if (Object.keys(groupedQuestions).length > 0) {
            orderedBooksList.forEach(book => {
                plainText += `${book}:\n`;
                Object.entries(groupedQuestions[book]).forEach(([theme, questions]) => {
                    plainText += `  ${theme}:\n`;
                    questions.forEach(question => {
                        plainText += `    - ${question.question}\n`;
                    });
                });
                plainText += '\n';
            });
        } else {
            plainText += '';
        }

        return plainText;
    };

    const generateMarkdownContent = () => {
        let markdown = '';
        markdown += '## Bible References\n\n';
        if (data?.refArr && data.refArr.filter(ref => ref).length > 0) {
            data.refArr.filter(ref => ref).forEach(reference => {
                markdown += `- ${reference}\n`;
            });
        } else {
            markdown += '_No Bible references specified._\n';
        }
        markdown += '\n## General Context\n\n';
        if (data?.contextArr && data.contextArr.length > 0) {
            data.contextArr.forEach(context => {
                markdown += `- ${context}\n`;
            });
        } else {
            markdown += '_No context information available._\n';
        }
        markdown += '\n## Questions by Book and Theme\n\n';
        if (Object.keys(groupedQuestions).length > 0) {
            orderedBooksList.forEach(book => {
                markdown += `### ${book}\n`;
                Object.entries(groupedQuestions[book]).forEach(([theme, questions]) => {
                    markdown += `#### ${theme}\n`;
                    questions.forEach(question => {
                        markdown += `- ${question.question}\n`;
                    });
                    markdown += '\n';
                });
            });
        } else {
            markdown += '_No questions available._\n';
        }
        return markdown.trim();
    };


    const generateRichTextContent = () => {
        let html = '<div style="font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.4;">';

        html += '<h3 style="color: #1976d2; font-size: 1rem; font-weight: 600; margin: 0.7rem 0 0.3rem; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.2rem;">Bible References</h3>';
        if (data?.refArr && data.refArr.filter(ref => ref).length > 0) {
            html += '<ul style="margin: 0.3rem 0 0.7rem; padding-left: 1rem;">';
            data.refArr.filter(ref => ref).forEach(reference => {
                html += `<li style="margin-bottom: 0.15rem; font-size: 0.9rem;">${reference}</li>`;
            });
            html += '</ul>';
        } else {
            html += '<p style="margin: 0.3rem 0 0.7rem; font-size: 0.9rem;">No Bible references specified.</p>';
        }

        html += '<h3 style="color: #1976d2; font-size: 1rem; font-weight: 600; margin: 0.7rem 0 0.3rem; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.2rem;">General Context</h3>';
        if (data?.contextArr && data.contextArr.length > 0) {
            html += '<ul style="margin: 0.3rem 0 0.7rem; padding-left: 1rem;">';
            data.contextArr.forEach(context => {
                html += `<li style="margin-bottom: 0.15rem; font-size: 0.9rem;">${context}</li>`;
            });
            html += '</ul>';
        } else {
            html += '<p style="margin: 0.3rem 0 0.7rem; font-size: 0.9rem;">No context information available.</p>';
        }

        html += '<h3 style="color: #1976d2; font-size: 1rem; font-weight: 600; margin: 0.7rem 0 0.3rem; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.2rem;">Questions by Book and Theme</h3>';
        if (Object.keys(groupedQuestions).length > 0) {
            orderedBooksList.forEach(book => {
                html += `<h4 style="font-size: 0.95rem; font-weight: 500; margin: 0.6rem 0 0.25rem; color: #1976d2;">${book}</h4>`;
                Object.entries(groupedQuestions[book]).forEach(([theme, questions]) => {
                    html += `<p style="margin: 0.4rem 0 0.15rem 0.6rem; font-weight: 500; font-size: 0.9rem;">${theme}</p>`;
                    html += '<ul style="margin: 0.15rem 0 0.6rem 1.2rem; padding-left: 0.6rem;">';
                    questions.forEach(question => {
                        html += `<li style="margin-bottom: 0.15rem; list-style-type: circle; font-size: 0.9rem;">${question.question}</li>`;
                    });
                    html += '</ul>';
                });
            });
        } else {
            html += '';
        }

        html += '</div>';
        return html;
    };

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
                            <DialogPanel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-app-surface p-0 text-left align-middle shadow-2xl border-2 border-app-border transition-all flex flex-col max-h-[90vh]">
                                {/* Modal Header */}
                                <div className="bg-app-surface/80 border-b-2 border-app-border py-4 px-6 flex justify-between items-center select-none">
                                    <DialogTitle as="h2" className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                        Bible Study Preparation
                                    </DialogTitle>
                                    <button
                                        aria-label="close"
                                        onClick={onHide}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="overflow-y-auto p-6 sm:p-10 bg-app-surface/20 text-app-text flex flex-col gap-12" style={{ WebkitOverflowScrolling: 'touch' }}>
                                    <section>
                                        <SectionHeader centered={false}>Bible References</SectionHeader>
                                        {data?.refArr && data.refArr.filter(Boolean).length > 0 ? (
                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none">
                                                {data.refArr.filter(Boolean).map((reference, index) => (
                                                    <li key={index} className="flex items-center gap-2 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-200 border-2 border-primary-100 dark:border-primary-800/50">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                        {reference}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="italic opacity-70">No Bible references specified.</p>
                                        )}
                                    </section>

                                    <section>
                                        <SectionHeader centered={false}>General Context</SectionHeader>
                                        {data?.contextArr && data.contextArr.length > 0 ? (
                                            <ul className="space-y-3 list-none">
                                                {data.contextArr.map((context, index) => (
                                                    <li key={index} className="p-4 rounded-xl bg-app-bg dark:bg-app-bg/40 border-2 border-app-border text-app-text">
                                                        {context}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="italic opacity-70">No context information available.</p>
                                        )}
                                    </section>

                                    <section>
                                        <SectionHeader centered={false}>Questions by Book and Theme</SectionHeader>
                                        {Object.keys(groupedQuestions).length > 0 ? (
                                            <div className="space-y-10">
                                                {orderedBooksList.map((book) => (
                                                    <div key={book} className="space-y-4">
                                                        <h4 className="text-xl font-bold text-app-text flex items-center gap-2">
                                                            <div className="w-2 h-6 bg-primary-500 rounded-full" />
                                                            {book}
                                                        </h4>
                                                        <div className="grid grid-cols-1 gap-6">
                                                            {Object.entries(groupedQuestions[book]).map(([theme, questions]) => (
                                                                <div key={theme} className="ml-4 p-5 rounded-2xl border-2 border-app-border bg-app-surface/40">
                                                                    <h5 className="text-lg font-bold mb-4 text-primary-600 dark:text-primary-400">
                                                                        {theme}
                                                                    </h5>
                                                                    <ul className="space-y-3 list-disc pl-5">
                                                                        {questions.map((question, qIndex) => (
                                                                            <li key={qIndex} className="text-app-text leading-relaxed">
                                                                                {question.question}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="italic opacity-70 text-center py-10 bg-gray-50 dark:bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                                                {noQuestionString}
                                            </p>
                                        )}
                                    </section>
                                </div>

                                <div className="p-6 bg-app-surface/80 border-t-2 border-app-border flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <Button variant="outline" onClick={onHide} className="w-full sm:w-auto">
                                        Close
                                    </Button>
                                    <div className="flex gap-3 w-full sm:w-auto relative">
                                        <Button
                                            onClick={async () => {
                                                const plainText = generatePlainTextContent();
                                                const richText = generateRichTextContent();
                                                try {
                                                    const blob = new Blob([richText], { type: 'text/html' });
                                                    const clipboardItem = new ClipboardItem({
                                                        'text/html': blob,
                                                        'text/plain': new Blob([plainText], { type: 'text/plain' }),
                                                    });
                                                    await navigator.clipboard.write([clipboardItem]);
                                                    showToast('Successfully copied to clipboard', 'success');
                                                } catch (err) {
                                                    showToast(err.message, 'error');
                                                    navigator.clipboard.writeText(plainText).then(() => showToast('Successfully copied plain text', 'success'));
                                                }
                                            }}
                                            className="flex-grow sm:flex-grow-0"
                                        >
                                            <Copy size={18} /> Copy Study
                                        </Button>

                                        <Menu as="div" className="relative inline-block text-left">
                                            <MenuButton as={Fragment}>
                                                <Button
                                                    variant="outline"
                                                    className="px-3 h-full"
                                                >
                                                    <MoreVertical size={20} />
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
                                                <MenuItems className="absolute right-0 bottom-full mb-3 w-64 origin-bottom-right bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-20 focus:outline-none">
                                                    <div className="py-1">
                                                        <MenuItem>
                                                            {({ focus }) => (
                                                                <button
                                                                    onClick={async () => {
                                                                        const plainText = generatePlainTextContent();
                                                                        navigator.clipboard.writeText(plainText).then(() => {
                                                                            showToast('Successfully copied plain text', 'success');
                                                                        });
                                                                    }}
                                                                    className={clsx(
                                                                        focus ? 'bg-gray-100 dark:bg-gray-800' : '',
                                                                        'w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 flex items-center gap-3 transition-colors'
                                                                    )}
                                                                >
                                                                    <FileText size={18} className="text-gray-400" />
                                                                    <span>Copy as Plain Text</span>
                                                                </button>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem>
                                                            {({ focus }) => (
                                                                <button
                                                                    onClick={async () => {
                                                                        const markdown = generateMarkdownContent();
                                                                        navigator.clipboard.writeText(markdown).then(() => {
                                                                            showToast('Successfully copied markdown', 'success');
                                                                        });
                                                                    }}
                                                                    className={clsx(
                                                                        focus ? 'bg-gray-100 dark:bg-gray-800' : '',
                                                                        'w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 flex items-center gap-3 transition-colors border-t border-gray-100 dark:border-gray-800'
                                                                    )}
                                                                >
                                                                    <FileCode size={18} className="text-gray-400" />
                                                                    <span>Copy as Markdown</span>
                                                                </button>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem>
                                                            {({ focus }) => (
                                                                <button
                                                                    onClick={async () => {
                                                                        const richText = generateRichTextContent();
                                                                        try {
                                                                            const blob = new Blob([richText], { type: 'text/html' });
                                                                            const clipboardItem = new ClipboardItem({ 'text/html': blob });
                                                                            await navigator.clipboard.write([clipboardItem]);
                                                                            showToast('Successfully copied rich text', 'success');
                                                                        } catch (err) {
                                                                            showToast(err.message, 'error');
                                                                        }
                                                                    }}
                                                                    className={clsx(
                                                                        focus ? 'bg-gray-100 dark:bg-gray-800' : '',
                                                                        'w-full text-left px-4 py-3 text-gray-700 dark:text-gray-300 flex items-center gap-3 transition-colors border-t border-gray-100 dark:border-gray-800'
                                                                    )}
                                                                >
                                                                    <Copy size={18} className="text-gray-400" />
                                                                    <span>Copy as Rich Text</span>
                                                                </button>
                                                            )}
                                                        </MenuItem>
                                                    </div>
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
