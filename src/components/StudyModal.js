import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  Divider, 
  IconButton, 
  Snackbar, 
  Alert,
  Paper,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const StudyModal = ({ show, onHide, data }) => {
  const theme = useTheme();
  const [copySuccess, setCopySuccess] = useState(false);
  
  if (!data) {
    return null;
  }
  
  // Calculate total questions
  let totalQuestions = 0;
  if (data.questionArr) {
    data.questionArr.forEach(questions => {
      totalQuestions += questions.length;
    });
  }
  
  const generateTextContent = () => {
    // Format the study content for clipboard
    let content = "Bible Study Preparation\n\n";
    
    // Add references
    content += "Bible References:\n";
    if (data.refArr && data.refArr.filter(ref => ref).length > 0) {
      data.refArr.filter(ref => ref).forEach(reference => {
        content += `- ${reference}\n`;
      });
    } else {
      content += "- No Bible references specified.\n";
    }
    
    // Add context
    content += "\nGeneral Context:\n";
    if (data.contextArr && data.contextArr.length > 0) {
      data.contextArr.forEach(context => {
        content += `- ${context}\n`;
      });
    } else {
      content += "- No context information available.\n";
    }
    
    // Add questions
    content += "\nQuestions:\n";
    if (totalQuestions > 0) {
      data.themeArr.filter(theme => theme).forEach((theme, themeIndex) => {
        content += `\n${theme}:\n`;
        if (data.questionArr[themeIndex] && data.questionArr[themeIndex].length > 0) {
          data.questionArr[themeIndex].forEach(question => {
            content += `- ${question}\n`;
          });
        } else {
          content += "- No questions found for this theme.\n";
        }
      });
    } else {
      content += "- No questions found that match your criteria.\n";
    }
    
    return content;
  };
  
  const copyToClipboard = () => {
    try {
      const content = generateTextContent();
      
      // Modern way - try navigator.clipboard first
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(content)
          .then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
          })
          .catch(err => {
            console.error('Clipboard API error:', err);
            fallbackCopyMethod(content);
          });
      } else {
        // Fallback for older browsers
        fallbackCopyMethod(content);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      alert('Failed to copy text. Please try manually selecting and copying the content.');
    }
  };
  
  const fallbackCopyMethod = (text) => {
    // Create a temporary textarea element
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Make it non-visible
    textArea.style.position = "fixed";  
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    
    // Focus and select the text
    textArea.focus();
    textArea.select();
    
    let succeeded = false;
    try {
      // Execute the copy command
      succeeded = document.execCommand('copy');
    } catch (err) {
      console.error('execCommand error', err);
      succeeded = false;
    }
    
    // Clean up
    document.body.removeChild(textArea);
    
    // Show success or failure message
    if (succeeded) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } else {
      alert('Copy failed. Please try manually selecting and copying the content.');
    }
  };
  
  return (
    <>
      <Dialog 
        open={show} 
        onClose={onHide}
        fullWidth
        maxWidth="md"
        scroll="paper"
        aria-labelledby="study-modal-title"
        PaperProps={{
          elevation: 6,
          sx: { 
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper
          }
        }}
      >
        <DialogTitle 
          id="study-modal-title" 
          sx={{ 
            bgcolor: 'primary.main', 
            color: theme.palette.mode === 'dark' ? 'white' : 'white',
            py: 2.5,
            px: 3
          }}
        >
          <Typography variant="h5" component="div" sx={{ fontWeight: 'medium' }}>
            Bible Study Preparation
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onHide}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'white',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            color="primary.main"
            sx={{ 
              fontWeight: 'medium',
              pb: 1,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              mb: 3
            }}
          >
            Bible References
          </Typography>
          
          {data.refArr && data.refArr.filter(ref => ref).length > 0 ? (
            <List disablePadding sx={{ mb: 4, pl: 2 }}>
              {data.refArr.filter(ref => ref).map((reference, index) => (
                <ListItem key={index} sx={{ py: 0.75 }}>
                  <Typography variant="body1">• {reference}</Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" sx={{ mb: 4, ml: 2 }}>
              No Bible references specified.
            </Typography>
          )}
          
          <Typography 
            variant="h6" 
            gutterBottom 
            color="primary.main"
            sx={{ 
              fontWeight: 'medium',
              pb: 1,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              mb: 3
            }}
          >
            General Context
          </Typography>
          
          {data.contextArr && data.contextArr.length > 0 ? (
            <List disablePadding sx={{ mb: 4, pl: 2 }}>
              {data.contextArr.map((context, index) => (
                <ListItem key={index} sx={{ py: 0.75 }}>
                  <Typography variant="body1">• {context}</Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" sx={{ mb: 4, ml: 2 }}>
              No context information available.
            </Typography>
          )}
          
          <Typography 
            variant="h6" 
            gutterBottom 
            color="primary.main"
            sx={{ 
              fontWeight: 'medium',
              pb: 1,
              borderBottom: `2px solid ${theme.palette.primary.main}`,
              mb: 3
            }}
          >
            Questions
          </Typography>
          
          {totalQuestions > 0 ? (
            data.themeArr.filter(theme => theme).map((theme, themeIndex) => (
              <Box key={themeIndex} sx={{ mb: 4 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: 2,
                    color: 'primary.light'
                  }}
                >
                  {theme}
                </Typography>
                
                {data.questionArr[themeIndex] && data.questionArr[themeIndex].length > 0 ? (
                  <List disablePadding sx={{ pl: 2 }}>
                    {data.questionArr[themeIndex].map((question, qIndex) => (
                      <ListItem key={qIndex} sx={{ py: 0.75 }}>
                        <Typography variant="body1">• {question}</Typography>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.12)' : 'warning.light', 
                      borderRadius: 2
                    }}
                  >
                    <Typography>No questions found for this theme.</Typography>
                  </Paper>
                )}
                
                {themeIndex < data.themeArr.filter(t => t).length - 1 && (
                  <Divider sx={{ my: 3 }} />
                )}
              </Box>
            ))
          ) : (
            <Paper 
              sx={{ 
                p: 3, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.12)' : 'warning.light', 
                borderRadius: 2
              }}
            >
              <Typography>
                No questions found that match your criteria. Try different themes or subcategory settings.
              </Typography>
            </Paper>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={onHide}
            sx={{ px: 4, py: 1, borderRadius: 3 }}
          >
            Close
          </Button>
          <Button 
            variant="contained" 
            onClick={copyToClipboard}
            startIcon={<ContentCopyIcon />}
            sx={{ px: 4, py: 1, borderRadius: 3 }}
            disableElevation
          >
            {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          Study content copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default StudyModal; 