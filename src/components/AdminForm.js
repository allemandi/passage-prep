import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography,
  Paper, 
  Alert, 
  Snackbar,
  Container,
  Grid,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import QuestionTable from './QuestionTable';

const AdminForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeButton, setActiveButton] = useState(null);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      setIsLoggedIn(true);
    } catch (error) {
      setShowError(true);
      setErrorMessage(error.message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setActiveButton(null);
  };

  const closeError = () => {
    setShowError(false);
  };

  const handleButtonClick = (buttonName) => {
    setActiveButton(buttonName);
  };

  const handleQuestionSelect = (index, isSelected) => {
    setSelectedQuestions(prev => 
      isSelected ? [...prev, index] : prev.filter(i => i !== index)
    );
  };

  // Mock data for demonstration
  const mockQuestions = [
    { book: 'Genesis', chapter: 1, verseStart: 1, verseEnd: 1, theme: 'Creation', question: 'Who created the heavens and the earth?' },
    { book: 'John', chapter: 3, verseStart: 16, verseEnd: 16, theme: 'Salvation', question: 'What does John 3:16 say about salvation?' },
  ];

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 3, textAlign: 'center' }}>
          Admin Login
        </Typography>

        {!isLoggedIn ? (
          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
              Admin Mode
            </Typography>
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
              <Grid item>
                <Button 
                  variant={activeButton === 'edit' ? 'contained' : 'outlined'} 
                  onClick={() => handleButtonClick('edit')}
                >
                  Edit/Delete
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant={activeButton === 'review' ? 'contained' : 'outlined'} 
                  onClick={() => handleButtonClick('review')}
                >
                  Review/Approve
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant={activeButton === 'download' ? 'contained' : 'outlined'} 
                  onClick={() => handleButtonClick('download')}
                >
                  Download
                </Button>
              </Grid>
            </Grid>

            {activeButton === 'edit' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Filter for Editing/Deleting Questions
                </Typography>
                <TextField
                  label="Search by Theme"
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <QuestionTable
                  questions={mockQuestions}
                  selectedQuestions={selectedQuestions}
                  onQuestionSelect={handleQuestionSelect}
                  showActions
                />
                <Button variant="contained" color="error" sx={{ mt: 2 }}>
                  Delete Selected
                </Button>
              </Box>
            )}

            {activeButton === 'review' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Filter for Reviewing/Approving Questions
                </Typography>
                <TextField
                  label="Search by Status"
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <QuestionTable
                  questions={mockQuestions}
                  selectedQuestions={selectedQuestions}
                  onQuestionSelect={handleQuestionSelect}
                  showActions
                />
                <Button variant="contained" color="success" sx={{ mt: 2 }}>
                  Approve Selected
                </Button>
              </Box>
            )}

            {activeButton === 'download' && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Download Options
                </Typography>
                <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }}>
                  Download All Questions
                </Button>
                <Button variant="contained" color="secondary" fullWidth>
                  Download Selected Questions
                </Button>
              </Box>
            )}

            <Button variant="outlined" onClick={handleLogout} fullWidth>
              Logout
            </Button>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={closeError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={closeError} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminForm;