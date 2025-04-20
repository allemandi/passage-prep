import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ThemeProvider, createTheme, Tabs, Tab, Box, Container, CssBaseline, IconButton, Tooltip, useMediaQuery, Typography } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import './App.css';
import RequestForm from './components/RequestForm';
import ContributeForm from './components/ContributeForm';
import AdminForm from './components/AdminForm';
import StudyModal from './components/StudyModal';
import { getBooks, getQuestions } from './data/dataService';
import { createAppTheme } from './theme/theme';
import Footer from './components/Footer';
import HelpModal from './components/HelpModal';


function App() {
  const [studyData, setStudyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(() => {
    const savedMode = sessionStorage.getItem('themeMode');
    return savedMode || (prefersDarkMode ? 'dark' : 'light');
  });
  const [helpOpen, setHelpOpen] = useState(false);
  const handleHelpClick = () => setHelpOpen(true);
  const handleHelpClose = () => setHelpOpen(false);

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
        pb: { xs: 8, sm: 10 },
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}>
        <Box component="header" sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: { xs: 3, sm: 4 },
          px: { xs: 2, sm: 3, md: 4 },
          mb: 4,
          boxShadow: 3,
        }}>
          <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' }, gap: { xs: 2, sm: 0 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                mb: { xs: 1, sm: 0 },
                gap: { xs: 0.5, sm: 1 },
              }}
            >
              <AutoStoriesIcon sx={{ fontSize: { xs: 40, sm: 60 }, color: 'inherit', mb: { xs: 0.5, sm: 0 }, mr: { xs: 0, sm: 1 } }} />
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600, fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 0 }}>
                  PassagePrep
                </Typography>
                <Typography variant="subtitle1" sx={{ mt: 0, fontSize: { xs: '0.9rem', sm: '1.10rem' } }}>
                  Build reusable Bible studies in seconds.
                </Typography>
              </Box>
            </Box>
            <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton
                onClick={() => setMode(prev => prev === 'light' ? 'dark' : 'light')}
                color="inherit"
                sx={{
                  border: `2px solid ${mode === 'dark' ? '#fff' : '#222'}`,
                  borderRadius: 2,
                  boxShadow: mode === 'dark'
                    ? '0 0 0 2px rgba(255,255,255,0.15)'
                    : '0 0 0 2px rgba(0,0,0,0.08)',
                  background: mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    borderColor: mode === 'dark' ? '#90caf9' : '#1976d2',
                    boxShadow: mode === 'dark'
                      ? '0 0 0 3px rgba(144,202,249,0.18)'
                      : '0 0 0 3px rgba(25,118,210,0.12)',
                  },
                  p: 1.2,
                  mt: { xs: 1, sm: 0 }
                }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
          </Container>
        </Box>
        <Box sx={{ flex: 1 }}>
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
        <Footer onHelpClick={() => setHelpOpen(true)} />
        <HelpModal open={helpOpen} onClose={handleHelpClose} />
      </Box>


    </ThemeProvider>
  );
}

export default App;