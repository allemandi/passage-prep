import React, { useState } from 'react';
import { X, MoreVertical, Copy, FileText, FileCode, CheckCircle } from 'lucide-react';
const StudyModal = ({ show, onHide, data }) => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
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

  if (!show) return null; // Early return if modal is not visible

  return (

    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onHide} 
      aria-labelledby="study-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal panel */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-background-paper dark:bg-dark-background-paper rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Modal Header (formerly DialogTitle) */}
        <div
          id="study-modal-title"
          className="bg-primary-DEFAULT dark:bg-dark-primary-DEFAULT text-text-DEFAULT dark:text-dark-text-DEFAULT py-4 px-6 flex justify-between items-center"
        >
          <h2 className="text-h5 font-medium"> {/* Replaced Typography variant="h5" */}
            Bible Study Preparation
          </h2>
          <button
            aria-label="close"
            onClick={onHide}
            className="text-text-DEFAULT dark:text-dark-text-DEFAULT hover:bg-white/10 p-1 rounded-full"
          >
            <X size={24} /> {/* Replaced CloseIcon */}
          </button>
        </div>

        {/* Modal Content (formerly DialogContent) */}
        <div
          id="study-modal-content"
          className="overflow-y-auto p-6 sm:p-8 bg-background-default dark:bg-dark-background-default text-text-DEFAULT dark:text-dark-text-DEFAULT"
        >
          <h3
            className="text-h6 text-primary-DEFAULT dark:text-dark-primary-DEFAULT font-medium pb-2 border-b-2 border-primary-DEFAULT dark:border-dark-primary-DEFAULT mb-6"
          >
            Bible References
          </h3>

          {data?.refArr && data.refArr.filter(ref => ref).length > 0 ? (
            <ul className="list-disc pl-5 mb-8 space-y-2"> {/* Replaced List and ListItem */}
              {data.refArr.filter(ref => ref).map((reference, index) => (
                <li key={index} className="text-base font-normal"> {/* Replaced Typography */}
                  {reference}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-8 ml-2 opacity-80">
              No Bible references specified.
            </p>
          )}

          <h3
             className="text-h6 text-primary-DEFAULT dark:text-dark-primary-DEFAULT font-medium pb-2 border-b-2 border-primary-DEFAULT dark:border-dark-primary-DEFAULT mb-6"
          >
            General Context
          </h3>

          {data?.contextArr && data.contextArr.length > 0 ? (
            <ul className="list-disc pl-5 mb-8 space-y-2"> {/* Replaced List and ListItem */}
              {data.contextArr.map((context, index) => (
                <li key={index} className="text-base font-normal"> {/* Replaced Typography */}
                  {context}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-8 ml-2 opacity-80">
              No context information available.
            </p>
          )}

          <h3
             className="text-h6 text-primary-DEFAULT dark:text-dark-primary-DEFAULT font-medium pb-2 border-b-2 border-primary-DEFAULT dark:border-dark-primary-DEFAULT mb-6"
          >
            Questions by Book and Theme
          </h3>

          {Object.keys(groupedQuestions).length > 0 ? (
            <div className="space-y-6"> 
              {orderedBooksList.map(book => (
                <div key={book}> 
                  <h4 className="text-h6 font-medium mt-6 mb-3 text-text-DEFAULT dark:text-dark-text-DEFAULT"> {/* Replaced Typography variant="h6" */}
                    {book}
                  </h4>
                  {Object.entries(groupedQuestions[book]).map(([theme, questions]) => (
                    <div key={theme} className="ml-4 mb-3"> {/* Replaced Box */}
                      <h5 className="text-lg font-medium mb-2 text-text-secondary dark:text-dark-text-secondary"> {/* Replaced Typography variant="subtitle1" */}
                        {theme}
                      </h5>
                      <ul className="list-disc pl-5 space-y-1"> 
                        {questions.map((question, qIndex) => (
                          <li key={qIndex} className="text-sm"> 
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
            <p className="italic opacity-80">
              {noQuestionString}
            </p>
          )}
        </div>
        <hr className="border-divider dark:border-dark-divider" />
        <div
          className="p-6 flex justify-between items-center bg-background-default dark:bg-dark-background-default"
        >
          <button
            onClick={onHide}
            className="px-4 py-2 rounded-md border border-primary-DEFAULT dark:border-dark-primary-DEFAULT text-primary-DEFAULT dark:text-dark-primary-DEFAULT hover:bg-primary-light/10 dark:hover:bg-dark-primary-light/10 font-medium focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT dark:focus:ring-dark-primary-DEFAULT"
          >
            Close
          </button>
          <div className="flex gap-2 relative"> {/* Replaced Box */}
            <button
              onClick={async () => {
                const plainText = generatePlainTextContent();
                const richText = generateRichTextContent();
                try {
                  const blob = new Blob([richText], { type: 'text/html' });
                  const clipboardItem = new ClipboardItem({ 'text/html': blob, 'text/plain': new Blob([plainText], { type: 'text/plain' }) });
                  await navigator.clipboard.write([clipboardItem]);
                  setShowSnackbar(true);
                } catch (err) {
                  console.error('Failed to copy rich text:', err);
                  navigator.clipboard.writeText(plainText).then(() => {
                    setShowSnackbar(true);
                  });
                }
              }}
              className="px-4 py-2 rounded-md bg-primary-DEFAULT dark:bg-dark-primary-DEFAULT text-white dark:text-dark-text-DEFAULT hover:bg-primary-dark dark:hover:bg-dark-primary-dark font-medium flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT dark:focus:ring-dark-primary-DEFAULT"
            >
              <Copy size={18} /> Copy
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCopyMenu(!showCopyMenu);
              }}
              className="p-2 rounded-md bg-primary-DEFAULT dark:bg-dark-primary-DEFAULT text-white dark:text-dark-text-DEFAULT hover:bg-primary-dark dark:hover:bg-dark-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT dark:focus:ring-dark-primary-DEFAULT"
            >
              <MoreVertical size={24} />
            </button>
            {showCopyMenu && (
              <div
                className="absolute right-0 bottom-full mb-2 w-56 bg-background-paper dark:bg-dark-background-paper rounded-md shadow-lg z-10 border border-divider dark:border-dark-divider overflow-hidden"
              >
                <button
                  onClick={async () => {
                    const plainText = generatePlainTextContent();
                    navigator.clipboard.writeText(plainText).then(() => {
                      setShowSnackbar(true);
                      setShowCopyMenu(false);
                    });
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-text-DEFAULT dark:text-dark-text-DEFAULT hover:bg-background-default dark:hover:bg-dark-background-default flex items-center gap-2"
                >
                  <FileText size={16} className="text-text-secondary dark:text-dark-text-secondary" /> Copy as Plain Text
                </button>
                <button
                  onClick={async () => {
                    const markdown = generateMarkdownContent();
                    navigator.clipboard.writeText(markdown).then(() => {
                      setShowSnackbar(true);
                      setShowCopyMenu(false);
                    });
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-text-DEFAULT dark:text-dark-text-DEFAULT hover:bg-background-default dark:hover:bg-dark-background-default flex items-center gap-2"
                >
                  <FileCode size={16} className="text-text-secondary dark:text-dark-text-secondary" /> Copy as Markdown
                </button>
                <button
                  onClick={async () => {
                    const richText = generateRichTextContent();
                    try {
                      const blob = new Blob([richText], { type: 'text/html' });
                      const clipboardItem = new ClipboardItem({ 'text/html': blob });
                      await navigator.clipboard.write([clipboardItem]);
                      setShowSnackbar(true);
                      setShowCopyMenu(false);
                    } catch (err) {
                      console.error('Failed to copy rich text:', err);
                      setShowCopyMenu(false);
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-text-DEFAULT dark:text-dark-text-DEFAULT hover:bg-background-default dark:hover:bg-dark-background-default flex items-center gap-2"
                >
                  <Copy size={16} className="text-text-secondary dark:text-dark-text-secondary" /> Copy as Rich Text
                </button>
              </div>
            )}
          </div>
        </div>

        {showSnackbar && (
          <div
            className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-success-DEFAULT dark:bg-dark-success-DEFAULT text-white dark:text-dark-text-DEFAULT px-6 py-3 rounded-md shadow-lg flex items-center gap-2 animate-slideIn"
            role="alert"
          >
            <CheckCircle size={20} />
            <span>Content copied to clipboard!</span>
            <button
              onClick={() => setShowSnackbar(false)}
              className="ml-4 text-lg font-semibold hover:opacity-75"
              aria-label="Close notification"
            >
              &times;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyModal;
