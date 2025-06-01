import { useState } from 'react';
import { X, MoreVertical, Copy, FileText, FileCode } from 'lucide-react';
import { useToast } from './ToastMessage/Toast';


const StudyModal = ({ show, onHide, data }) => {
    const [showCopyMenu, setShowCopyMenu] = useState(false);
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
        markdown += '## Bible References\n';
        if (data?.refArr && data.refArr.filter(ref => ref).length > 0) {
            data.refArr.filter(ref => ref).forEach(reference => {
                markdown += `- ${reference}\n`;
            });
        } else {
            markdown += 'No Bible references specified.\n';
        }
        markdown += '\n';
        markdown += '## General Context\n';
        if (data?.contextArr && data.contextArr.length > 0) {
            data.contextArr.forEach(context => {
                markdown += `- ${context}\n`;
            });
        } else {
            markdown += 'No context information available.\n';
        }
        markdown += '\n';
        markdown += '## Questions by Book and Theme\n';
        if (Object.keys(groupedQuestions).length > 0) {
            orderedBooksList.forEach(book => {
                markdown += `### ${book}\n`;
                Object.entries(groupedQuestions[book]).forEach(([theme, questions]) => {
                    markdown += `- **${theme}**\n`;
                    questions.forEach(question => {
                        markdown += `  - ${question.question}\n`;
                    });
                });
                markdown += '\n';
            });
        } else {
            markdown += '';
        }

        return markdown;
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

    if (!show) return null;

    return (

        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4 pt-12"
            onClick={onHide}
            aria-labelledby="study-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="
      relative w-full max-w-[1200px] max-h-[90vh]
      flex flex-col
      bg-white/50 dark:bg-gray-900/60
      border border-gray-200 dark:border-gray-800
      rounded-xl shadow-sm backdrop-blur-md
      overflow-hidden
    "
                onClick={(e) => e.stopPropagation()}
                style={{ transform: 'translateY(-25px)' }}
            >
                {/* Modal Header */}
                <div
                    id="study-modal-title"
                    className="
        bg-white/80 dark:bg-gray-900/80
        border-b border-gray-200 dark:border-gray-800
        text-sky-700 dark:text-sky-400
        py-4 px-6
        flex justify-between items-center
        font-semibold text-lg
        select-none
      "
                >
                    Bible Study Preparation
                    <button
                        aria-label="close"
                        onClick={onHide}
                        className="
          text-sky-700 dark:text-sky-400
          hover:bg-sky-100 dark:hover:bg-sky-700/30
          p-2 rounded-full
          transition
          focus:outline-none focus:ring-2 focus:ring-sky-400
        "
                    >
                        <X size={24} />
                    </button>
                </div>
                <div
                    id="study-modal-content"
                    className="
        overflow-y-auto
        p-8
        bg-white/60 dark:bg-gray-900/60
        text-gray-900 dark:text-gray-300
        flex flex-col gap-10
      "
                    style={{ WebkitOverflowScrolling: 'touch', paddingBottom: '5rem' }}
                >
                    <section>
                        <h3
                            className="
    text-2xl font-semibold
    text-sky-700 dark:text-sky-400
    border-b-2 border-sky-700 dark:border-sky-400
    pb-2 mb-6
    text-left
  "
                        >
                            Bible References
                        </h3>

                        {data?.refArr && data.refArr.filter(Boolean).length > 0 ? (
                            <ul className="list-disc pl-6 mb-8 space-y-2">
                                {data.refArr.filter(Boolean).map((reference, index) => (
                                    <li key={index} className="text-base font-normal">
                                        {reference}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mb-8 ml-2 opacity-80">
                                No Bible references specified.
                            </p>
                        )}
                    </section>
                    <section>
                        <h3
                            className="
    text-2xl font-semibold
    text-sky-700 dark:text-sky-400
    border-b-2 border-sky-700 dark:border-sky-400
    pb-2 mb-6
    text-left
  "
                        >
                            General Context
                        </h3>

                        {data?.contextArr && data.contextArr.length > 0 ? (
                            <ul className="list-disc pl-6 mb-8 space-y-2">
                                {data.contextArr.map((context, index) => (
                                    <li key={index} className="text-base font-normal">
                                        {context}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="mb-8 ml-2 opacity-80">
                                No context information available.
                            </p>
                        )}
                    </section>
                    <section>
                        <h3
                            className="
    text-2xl font-semibold
    text-sky-700 dark:text-sky-400
    border-b-2 border-sky-700 dark:border-sky-400
    pb-2 mb-6
    text-left
  "
                        >
                            Questions by Book and Theme
                        </h3>

                        {Object.keys(groupedQuestions).length > 0 ? (
                            <div className="space-y-8">
                                {orderedBooksList.map((book) => (
                                    <div key={book}>
                                        <h4 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-300">
                                            {book}
                                        </h4>
                                        {Object.entries(groupedQuestions[book]).map(([theme, questions]) => (
                                            <div key={theme} className="px-4 mb-6">
                                                <h5 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-400">
                                                    {theme}
                                                </h5>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {questions.map((question, qIndex) => (
                                                        <li key={qIndex} className="text-sm text-gray-800 dark:text-gray-300">
                                                            {question.question}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="italic opacity-80 text-center">
                                {noQuestionString}
                            </p>
                        )}
                    </section>
                </div>
                <hr className="border-gray-200 dark:border-gray-800" />
                <div
                    className="
        p-6
        bg-white/80 dark:bg-gray-900/80
        flex justify-between items-center
        border-t border-gray-200 dark:border-gray-800
      "
                >
                    <button
                        onClick={onHide}
                        className="
          px-4 py-2 rounded-lg
          border border-sky-600 text-sky-600
          hover:bg-sky-100 dark:hover:bg-sky-700/30
          font-semibold
          transition
          focus:outline-none focus:ring-2 focus:ring-sky-400
        "
                    >
                        Close
                    </button>
                    <div className="flex gap-3 relative">
                        <button
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
                            className="
            px-4 py-2 rounded-lg
            bg-sky-600 text-white
            hover:bg-sky-700
            font-semibold
            flex items-center gap-2
            focus:outline-none focus:ring-2 focus:ring-sky-400
            transition
          "
                        >
                            <Copy size={18} /> Copy
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowCopyMenu(!showCopyMenu);
                            }}
                            className="
            p-2 rounded-lg
            bg-sky-600 text-white
            hover:bg-sky-700
            focus:outline-none focus:ring-2 focus:ring-sky-400
            transition
          "
                        >
                            <MoreVertical size={24} />
                        </button>

                        {showCopyMenu && (
                            <div
                                className="
              absolute right-0 bottom-full mb-2 w-56
              bg-white/90 dark:bg-gray-900/90
              border border-gray-200 dark:border-gray-800
              rounded-lg shadow-lg
              overflow-hidden
              z-20
            "
                            >
                                <button
                                    onClick={async () => {
                                        const plainText = generatePlainTextContent();
                                        navigator.clipboard.writeText(plainText).then(() => {
                                            showToast('Successfully copied plain text', 'success');
                                            setShowCopyMenu(false);
                                        });
                                    }}
                                    className="
                w-full text-left px-4 py-2 text-gray-900 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                flex items-center gap-2 text-sm
              "
                                >
                                    <FileText size={16} className="text-gray-500 dark:text-gray-400" /> Copy as Plain Text
                                </button>
                                <button
                                    onClick={async () => {
                                        const markdown = generateMarkdownContent();
                                        navigator.clipboard.writeText(markdown).then(() => {
                                            showToast('Successfully copied markdown', 'success');
                                            setShowCopyMenu(false);
                                        });
                                    }}
                                    className="
                w-full text-left px-4 py-2 text-gray-900 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                flex items-center gap-2 text-sm
              "
                                >
                                    <FileCode size={16} className="text-gray-500 dark:text-gray-400" /> Copy as Markdown
                                </button>
                                <button
                                    onClick={async () => {
                                        const richText = generateRichTextContent();
                                        try {
                                            const blob = new Blob([richText], { type: 'text/html' });
                                            const clipboardItem = new ClipboardItem({ 'text/html': blob });
                                            await navigator.clipboard.write([clipboardItem]);
                                            showToast('Successfully copied rich text', 'success');
                                            setShowCopyMenu(false);
                                        } catch (err) {
                                            showToast(err.message, 'error');
                                            setShowCopyMenu(false);
                                        }
                                    }}
                                    className="
                w-full text-left px-4 py-2 text-gray-900 dark:text-gray-300
                hover:bg-gray-100 dark:hover:bg-gray-800
                flex items-center gap-2 text-sm
              "
                                >
                                    <Copy size={16} className="text-gray-500 dark:text-gray-400" /> Copy as Rich Text
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default StudyModal;
