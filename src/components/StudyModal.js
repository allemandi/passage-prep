import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Box,
  Button,
  List,
  ListItem,
  Paper,
  useTheme,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const StudyModal = ({ show, onHide, data }) => {
  const theme = useTheme();
  const totalQuestions = data?.questionArr?.reduce((acc, curr) => acc + curr.length, 0) || 0;
  
  // Safety check for theme initialization
  if (!theme?.palette) {
    return null;
  }

  const borderColor = theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(0, 0, 0, 0.12)';
  
  return (
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
                  px: 0
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 400 }}>
                  • {reference}
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
                  px: 0
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 400 }}>
                  • {context}
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
          Questions
        </Typography>

        {totalQuestions > 0 ? (
          data.themeArr.filter(theme => theme).map((theme, themeIndex) => (
            <Box key={themeIndex} sx={{ mb: themeIndex < data.themeArr.filter(t => t).length - 1 ? 4 : 0 }}>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 2.5,
                  color: 'primary.light',
                  fontSize: '1.1rem'
                }}
              >
                {theme}
              </Typography>
              
              {data.questionArr[themeIndex] && data.questionArr[themeIndex].length > 0 ? (
                <List disablePadding sx={{ pl: 2 }}>
                  {data.questionArr[themeIndex].map((question, qIndex) => (
                    <ListItem 
                      key={qIndex} 
                      sx={{ 
                        py: 1,
                        px: 0
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 400 }}>
                        • {question.question}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Paper 
                  sx={{ 
                    p: 2.5, 
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.12)' : 'warning.light', 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.warning.main}`
                  }}
                >
                  <Typography sx={{ color: 'warning.main' }}>
                    No questions found for this theme.
                  </Typography>
                </Paper>
              )}
              
              {themeIndex < data.themeArr.filter(t => t).length - 1 && (
                <Divider sx={{ my: 4, borderColor: borderColor }} />
              )}
            </Box>
          ))
        ) : (
          <Paper 
            sx={{ 
              p: 3, 
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.12)' : 'warning.light', 
              borderRadius: 2,
              border: `1px solid ${theme.palette.warning.main}`
            }}
          >
            <Typography sx={{ color: 'warning.main' }}>
              No questions found that match your criteria. Try selecting different themes or Bible references.
            </Typography>
          </Paper>
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
        <Button 
          onClick={() => window.print()} 
          variant="contained" 
          color="primary"
          sx={{ 
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 2px 8px rgba(144, 202, 249, 0.2)' 
              : '0 2px 8px rgba(25, 118, 210, 0.2)',
            '&:hover': {
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 12px rgba(144, 202, 249, 0.3)' 
                : '0 4px 12px rgba(25, 118, 210, 0.3)'
            }
          }}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StudyModal;