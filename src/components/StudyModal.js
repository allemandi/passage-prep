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
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const StudyModal = ({ show, onHide, data }) => {
  const theme = useTheme();
  const [showSnackbar, setShowSnackbar] = useState(false);
  
  // Safety check for data initialization
  if (!data || !data.filteredQuestions) {
    return null; // or you can return a loading state or a message
  }

  // Safety check for theme initialization
  if (!theme?.palette) {
    return null;
  }

  const borderColor = theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(0, 0, 0, 0.12)';

  // Function to group questions by book and theme
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

  // Function to generate markdown content
  const generateMarkdownContent = () => {
    let markdown = '';

    // Bible References
    markdown += '## Bible References\n';
    if (data?.refArr && data.refArr.filter(ref => ref).length > 0) {
      data.refArr.filter(ref => ref).forEach(reference => {
        markdown += `- ${reference}\n`;
      });
    } else {
      markdown += 'No Bible references specified.\n';
    }
    markdown += '\n';

    // General Context
    markdown += '## General Context\n';
    if (data?.contextArr && data.contextArr.length > 0) {
      data.contextArr.forEach(context => {
        markdown += `- ${context}\n`;
      });
    } else {
      markdown += 'No context information available.\n';
    }
    markdown += '\n';

    // Questions by Book and Theme
    markdown += '## Questions by Book and Theme\n';
    if (Object.keys(groupedQuestions).length > 0) {
      Object.entries(groupedQuestions).forEach(([book, themes]) => {
        markdown += `### ${book}\n`;
        Object.entries(themes).forEach(([theme, questions]) => {
          markdown += `- **${theme}**\n`;
          questions.forEach(question => {
            markdown += `  - ${question.question}\n`;
          });
        });
        markdown += '\n';
      });
    } else {
      markdown += 'No questions available.\n';
    }

    return markdown;
  };

  // Function to generate HTML content for rich text
  const generateRichTextContent = () => {
    let html = '<div style="font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.4;">';

    // Bible References
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

    // General Context
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

    // Questions by Book and Theme
    html += '<h3 style="color: #1976d2; font-size: 1rem; font-weight: 600; margin: 0.7rem 0 0.3rem; border-bottom: 1px solid #e0e0e0; padding-bottom: 0.2rem;">Questions by Book and Theme</h3>';
    if (Object.keys(groupedQuestions).length > 0) {
      Object.entries(groupedQuestions).forEach(([book, themes]) => {
        html += `<h4 style="font-size: 0.95rem; font-weight: 500; margin: 0.6rem 0 0.25rem; color: #1976d2;">${book}</h4>`;
        Object.entries(themes).forEach(([theme, questions]) => {
          html += `<p style="margin: 0.4rem 0 0.15rem 0.6rem; font-weight: 500; font-size: 0.9rem;">${theme}</p>`;
          html += '<ul style="margin: 0.15rem 0 0.6rem 1.2rem; padding-left: 0.6rem;">';
          questions.forEach(question => {
            html += `<li style="margin-bottom: 0.15rem; list-style-type: circle; font-size: 0.9rem;">${question.question}</li>`;
          });
          html += '</ul>';
        });
      });
    } else {
      html += '<p style="margin: 0.3rem 0 0.7rem; font-size: 0.9rem;">No questions available.</p>';
    }

    html += '</div>';
    return html;
  };

  // Function to copy rich text to clipboard
  const copyRichText = async () => {
    const html = generateRichTextContent();
    const blob = new Blob([html], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({ 'text/html': blob });
    
    try {
      await navigator.clipboard.write([clipboardItem]);
      setShowSnackbar(true);
    } catch (err) {
      console.error('Failed to copy rich text:', err);
      // Fallback to plain text if rich text fails
      const plainText = generateMarkdownContent();
      navigator.clipboard.writeText(plainText).then(() => {
        setShowSnackbar(true);
      });
    }
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
            {Object.entries(groupedQuestions).map(([book, themes]) => (
              <React.Fragment key={book}>
                <Typography variant="h6" sx={{ mt: 3, mb: 1.5 }}>
                  {book}
                </Typography>
                {Object.entries(themes).map(([theme, questions]) => (
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
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            No questions available.
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
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            onClick={() => {
              const markdownContent = generateMarkdownContent();
              navigator.clipboard.writeText(markdownContent).then(() => {
                setShowSnackbar(true);
              });
            }}
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
            Copy Markdown
          </Button>
          <Button 
            onClick={copyRichText}
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
            Copy Rich Text
          </Button>
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