import React from 'react';
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
  Paper,
  useTheme,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const StudyModal = ({ show, onHide, data }) => {
  const theme = useTheme();
  
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

        {data.filteredQuestions && data.filteredQuestions.length > 0 ? (
          <List disablePadding>
            {data.filteredQuestions.map((question, index) => (
              <ListItem key={index}>
                <Typography variant="body1">
                  • {question.question}
                </Typography>
              </ListItem>
            ))}
          </List>
        ) : (
          <Paper>
            <Typography>
              No questions selected from Search Questions table.
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