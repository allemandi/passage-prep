import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  useTheme,
  Divider,
  Box,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const StudyModal = ({ show, onHide, data }) => {
  const theme = useTheme();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const noQuestionString = 'Notice: Questions were not selected. Use Search and tick checkboxes against table questions to fill this space, or use the Contribute section to submit your own questions.'
  if (!data || !data.filteredQuestions) {
    return null;
  }

  if (!theme?.palette) {
    return null;
  }

  const borderColor = theme.palette.mode === 'dark'
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(0, 0, 0, 0.12)';

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
    
    // If only one is in our list, prioritize it
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

  return (
    <Dialog
      open={show}
      onClose={onHide}
      fullWidth
      maxWidth="xl"
      scroll="paper"
      aria-labelledby="study-modal-title"
      PaperProps={{
        elevation: 6,
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.4)'
            : '0 8px 32px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <DialogTitle
        id="study-modal-title"
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 2.5,
          px: 3,
          position: 'relative'
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Bible Study Preparation
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onHide}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        id="study-modal-content"
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
          '& .MuiDialogContent-dividers': {
            borderColor: borderColor
          }
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          color="primary.main"
          sx={{
            fontWeight: 500,
            pb: 1.5,
            borderBottom: `2px solid ${theme.palette.primary.main}`,
            mb: 3.5
          }}
        >
          Bible References
        </Typography>

        {data?.refArr && data.refArr.filter(ref => ref).length > 0 ? (
          <List disablePadding sx={{ mb: 4, pl: 2 }}>
            {data.refArr.filter(ref => ref).map((reference, index) => (
              <ListItem
                key={index}
                sx={{
                  py: 1,
                  px: 0,
                  display: 'list-item',
                  listStyleType: 'disc'
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 400 }}>
                  {reference}
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" sx={{ mb: 4, ml: 2, opacity: 0.8 }}>
            No Bible references specified.
          </Typography>
        )}

        <Typography
          variant="h6"
          gutterBottom
          color="primary.main"
          sx={{
            fontWeight: 500,
            pb: 1.5,
            borderBottom: `2px solid ${theme.palette.primary.main}`,
            mb: 3.5
          }}
        >
          General Context
        </Typography>

        {data?.contextArr && data.contextArr.length > 0 ? (
          <List disablePadding sx={{ mb: 4, pl: 2 }}>
            {data.contextArr.map((context, index) => (
              <ListItem
                key={index}
                sx={{
                  py: 1,
                  px: 0,
                  display: 'list-item',
                  listStyleType: 'disc'
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 400 }}>
                  {context}
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body1" sx={{ mb: 4, ml: 2, opacity: 0.8 }}>
            No context information available.
          </Typography>
        )}

        <Typography
          variant="h6"
          gutterBottom
          color="primary.main"
          sx={{
            fontWeight: 500,
            pb: 1.5,
            borderBottom: `2px solid ${theme.palette.primary.main}`,
            mb: 3.5
          }}
        >
          Questions by Book and Theme
        </Typography>

        {Object.keys(groupedQuestions).length > 0 ? (
          <List disablePadding>
            {orderedBooksList.map(book => (
              <React.Fragment key={book}>
                <Typography variant="h6" sx={{ mt: 3, mb: 1.5 }}>
                  {book}
                </Typography>
                {Object.entries(groupedQuestions[book]).map(([theme, questions]) => (
                  <Box key={theme} sx={{ ml: 2, mb: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      {theme}
                    </Typography>
                    <List disablePadding sx={{ ml: 2 }}>
                      {questions.map((question, qIndex) => (
                        <ListItem key={qIndex} sx={{ py: 0.5, px: 0, display: 'list-item', listStyleType: 'circle' }}>
                          <Typography variant="body2">
                            {question.question}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body1" component="em" sx={{ opacity: 0.8 }}>
            {noQuestionString}
          </Typography>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: borderColor }} />

      <DialogActions
        sx={{
          p: 3,
          justifyContent: 'space-between',
          bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default'
        }}
      >
        <Button
          onClick={onHide}
          variant="outlined"
          color="primary"
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Close
        </Button>
        <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
          <Button
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
            variant="contained"
            color="primary"
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Copy
          </Button>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              const menu = document.getElementById('copy-menu');
              if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
            }}
            sx={{
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            <MoreVertIcon />
          </IconButton>
          <Box
            id="copy-menu"
            sx={{
              display: 'none',
              position: 'absolute',
              right: 0,
              bottom: '100%',
              bgcolor: 'background.paper',
              boxShadow: 3,
              borderRadius: 2,
              zIndex: 1,
              p: 1,
              minWidth: 200
            }}
          >
            <MenuItem
              onClick={async () => {
                const plainText = generatePlainTextContent();
                navigator.clipboard.writeText(plainText).then(() => {
                  setShowSnackbar(true);
                });
              }}
            >
              Copy as Plain Text
            </MenuItem>
            <MenuItem
              onClick={async () => {
                const markdown = generateMarkdownContent();
                navigator.clipboard.writeText(markdown).then(() => {
                  setShowSnackbar(true);
                });
              }}
            >
              Copy as Markdown
            </MenuItem>
            <MenuItem
              onClick={async () => {
                const richText = generateRichTextContent();
                try {
                  const blob = new Blob([richText], { type: 'text/html' });
                  const clipboardItem = new ClipboardItem({ 'text/html': blob });
                  await navigator.clipboard.write([clipboardItem]);
                  setShowSnackbar(true);
                } catch (err) {
                  console.error('Failed to copy rich text:', err);
                }
              }}
            >
              Copy as Rich Text
            </MenuItem>
          </Box>
        </Box>
      </DialogActions>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={() => setShowSnackbar(false)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          Content copied to clipboard!
        </MuiAlert>
      </Snackbar>
    </Dialog>
  );
};

export default StudyModal;
