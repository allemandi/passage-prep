/**
 * Groups questions by book and then by theme.
 */
export const groupQuestionsByBookAndTheme = (questions) => {
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

/**
 * Generates plain text content for a study.
 */
export const generatePlainTextContent = (data, groupedQuestions, orderedBooksList) => {
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

/**
 * Generates markdown content for a study.
 */
export const generateMarkdownContent = (data, groupedQuestions, orderedBooksList) => {
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

/**
 * Generates rich text (HTML) content for a study.
 */
export const generateRichTextContent = (data, groupedQuestions, orderedBooksList) => {
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
