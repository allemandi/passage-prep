import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { 
  Container, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Grid, 
  Box,
  CssBaseline,
  IconButton,
  Tooltip,
  useMediaQuery,
  Paper
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { darkTheme, lightTheme } from './theme/theme';
import './App.css';
import RequestForm from './components/RequestForm';
import ContributeForm from './components/ContributeForm';
import StudyModal from './components/StudyModal';
import { getBooks, getQuestions } from './data/dataService';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [studyData, setStudyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState('dark');
  
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    } else {
      setMode('dark');
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);
  
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };
  
  const theme = useMemo(() => {
    return mode === 'light' ? lightTheme : darkTheme;
  }, [mode]);
  
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([getBooks(), getQuestions()]);
      setIsLoading(false);
    };
    
    loadInitialData();
  }, []);
  
  const handleShowStudy = (data) => {
    setStudyData(data);
    setShowModal(true);
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          backgroundImage: mode === 'dark' 
            ? 'linear-gradient(rgba(18, 18, 18, 0.97), rgba(18, 18, 18, 0.95))'
            : 'linear-gradient(rgba(245, 245, 245, 0.97), rgba(245, 245, 245, 0.95))',
          backgroundAttachment: 'fixed',
          pb: { xs: 8, sm: 10 },
          position: 'relative'
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            pt: { xs: 3, sm: 4, md: 5 },
            px: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            mb: { xs: 2, sm: 3 }
          }}>
            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton 
                onClick={toggleColorMode} 
                color="inherit" 
                aria-label="toggle light/dark mode"
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': {
                    bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </Box>
          
          <Card 
            elevation={mode === 'dark' ? 4 : 2}
            sx={{ 
              mb: 5, 
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              boxShadow: mode === 'dark' 
                ? '0 8px 24px rgba(0, 0, 0, 0.4)' 
                : '0 8px 24px rgba(0, 0, 0, 0.05)'
            }}
          >
            <CardHeader 
              title={
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Bible Study Preparation
                </Typography>
              }
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText',
                py: { xs: 2, sm: 2.5 }
              }}
            />
            <CardContent sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
                Made with React + Material UI
              </Typography>
              <Typography variant="body1" paragraph sx={{ mb: 3, opacity: 0.9 }}>
                Bible References should be written in the format of Genesis 1:1, John 3:16-18, etc.
                Please spell correctly, with proper spacing. You must select at least one theme.
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                If no questions show up after submission, there are not enough questions for that theme against your subcategory settings. 
                Contribute questions to expand the pool.
              </Typography>
            </CardContent>
          </Card>
          
          <Paper 
            elevation={mode === 'dark' ? 4 : 1}
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              bgcolor: 'background.paper', 
              borderRadius: 3,
              boxShadow: mode === 'dark' 
                ? '0 6px 20px rgba(0, 0, 0, 0.3)' 
                : '0 6px 20px rgba(0, 0, 0, 0.05)',
              mb: 4,
              width: '100%'
            }}
          >
            <RequestForm onStudyGenerated={handleShowStudy} isLoading={isLoading} />
          </Paper>
          
          <Paper 
            elevation={mode === 'dark' ? 4 : 1}
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              bgcolor: 'background.paper', 
              borderRadius: 3,
              boxShadow: mode === 'dark' 
                ? '0 6px 20px rgba(0, 0, 0, 0.3)' 
                : '0 6px 20px rgba(0, 0, 0, 0.05)',
              width: '100%'
            }}
          >
            <ContributeForm isLoading={isLoading} />
          </Paper>
          
          <StudyModal 
            show={showModal} 
            onHide={() => setShowModal(false)} 
            data={studyData}
          />
        </Container>
        
        <Box 
          component="footer" 
          sx={{ 
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            py: 3,
            px: 2,
            mt: 6, 
            textAlign: 'center',
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Copyright &copy; {new Date().getFullYear()} allemandi, All Rights Reserved
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;