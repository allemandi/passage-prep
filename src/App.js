import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider, createTheme, Tabs, Tab, Box, Container, CssBaseline, IconButton, Tooltip, useMediaQuery, Paper, Typography } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import './App.css';
import RequestForm from './components/RequestForm';
import ContributeForm from './components/ContributeForm';
import AdminForm from './components/AdminForm';
import StudyModal from './components/StudyModal';
import { getBooks, getQuestions } from './data/dataService';
import { createAppTheme } from './theme/theme';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [studyData, setStudyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
  
  // Use saved theme mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    } else {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode]);
  
  // Save theme mode to localStorage
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  // Create theme instance with proper palette configuration
  const theme = useMemo(() => {
    const baseTheme = createAppTheme(mode);
    return createTheme({
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        mode,
        divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
    });
  }, [mode]);
  
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };
  
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
        }}
      >
        {/* Modern Header Section */}
        <Box 
          component="header"
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            py: { xs: 3, sm: 4 },
            px: { xs: 2, sm: 3, md: 4 },
            mb: 4,
            boxShadow: mode === 'dark' 
              ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
              : '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ 
                fontWeight: 700,
                mb: 1,
                letterSpacing: '-0.5px'
              }}>
                PassagePrep
              </Typography>
              <Typography variant="subtitle1" sx={{ 
                opacity: 0.9,
                fontSize: '1.05rem',
                lineHeight: 1.3
              }}>
                Build reusable Bible studies in seconds.
              </Typography>
            </Box>
            
            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton 
                onClick={toggleColorMode} 
                color="inherit" 
                aria-label="toggle light/dark mode"
                sx={{
                  bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                  width: 50,
                  height: 50,
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  boxShadow: 3,
                  '&:hover': {
                    bgcolor: mode === 'dark' ? '#ffffff' : '#000000',
                    transform: 'scale(1.1)',
                    boxShadow: 4
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.6rem',
                    color: mode === 'dark' ? theme.palette.getContrastText('#ffffff') 
                                          : theme.palette.getContrastText('#000000')
                  }
                }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </Container>
        </Box>

        <Container 
          maxWidth="xl" 
          sx={{ 
            px: { xs: 2, sm: 3, md: 4 }
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 4 }}
          >
            <Tab label="Search & Format" />
            <Tab label="Contribute" />
            <Tab label="Admin" />
          </Tabs>

          {tabValue === 0 && (
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
          )}
          {tabValue === 1 && (
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
          )}
          {tabValue === 2 && (
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
              <AdminForm />
            </Paper>
          )}

          <StudyModal 
            show={showModal} 
            onHide={() => setShowModal(false)} 
            data={studyData}
          />
        </Container>
        
        <Box 
          component="footer" 
          sx={{ 
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            py: 2,
            px: { xs: 2, sm: 3 },
            bgcolor: 'background.paper',
            borderTop: `1px solid ${theme.palette.divider}`,
            boxShadow: mode === 'dark' 
              ? '0 -2px 8px rgba(0, 0, 0, 0.3)' 
              : '0 -2px 8px rgba(0, 0, 0, 0.05)',
            zIndex: 1
          }}
        >
          <Container maxWidth="xl" sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.875rem',
                opacity: 0.8
              }}
            >
              Copyright &copy; {new Date().getFullYear()} allemandi, All Rights Reserved
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;