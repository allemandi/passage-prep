import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider, createTheme, Tabs, Tab, Box, Container, CssBaseline, IconButton, Tooltip, useMediaQuery, Typography } from '@mui/material';
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
  const [studyData, setStudyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(() => {
    const savedMode = sessionStorage.getItem('themeMode');
    return savedMode || (prefersDarkMode ? 'dark' : 'light');
  });

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

  useEffect(() => {
    sessionStorage.setItem('themeMode', mode);
  }, [mode]);

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([getBooks(), getQuestions()]);
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  const handleShowStudy = useCallback((data) => {
    setStudyData(data);
  }, []);

  useEffect(() => {
    const authChannel = new BroadcastChannel('auth');
    const handleTabChange = () => {
      authChannel.postMessage({ type: 'LOGOUT' });
    };

    window.addEventListener('beforeunload', handleTabChange);
    return () => {
      window.removeEventListener('beforeunload', handleTabChange);
      authChannel.close();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: { xs: 8, sm: 10 },
      }}>
        <Box component="header" sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          mb: 4,
          boxShadow: 3
        }}>
          <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
                PassagePrep
              </Typography>
              <Typography variant="subtitle1">
                Build reusable Bible studies in seconds.
              </Typography>
            </Box>
            
            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton 
                onClick={() => setMode(prev => prev === 'light' ? 'dark' : 'light')} 
                color="inherit"
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} variant="fullWidth" sx={{ mb: 4 }}>
            <Tab label="Search & Format" />
            <Tab label="Contribute" />
            <Tab label="Admin" />
          </Tabs>

          {tabValue === 0 && <RequestForm onStudyGenerated={handleShowStudy} isLoading={isLoading} />}
          {tabValue === 1 && <ContributeForm isLoading={isLoading} />}
          {tabValue === 2 && <AdminForm />}

          <StudyModal 
            show={!!studyData} 
            onHide={() => setStudyData(null)} 
            data={studyData} 
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;