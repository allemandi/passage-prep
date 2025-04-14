import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography,
  Paper, 
  Alert, 
  Snackbar,
  Container
} from '@mui/material';

const AdminForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setIsLoggedIn(true);
    } else {
      setShowError(true);
      setErrorMessage('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const closeError = () => {
    setShowError(false);
  };

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
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Welcome, Admin!
            </Typography>
            <Button variant="outlined" onClick={handleLogout}>
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