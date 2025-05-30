import React, { useState } from 'react';
import { Box, TextField, Button, Snackbar, Alert } from '@mui/material';

const authChannel = new BroadcastChannel('auth');

const Login = ({ setIsLoggedIn, setShowError, setErrorMessage }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) throw new Error('Invalid credentials');

            setIsLoggedIn(true);
            sessionStorage.setItem('isLoggedIn', 'true');
            authChannel.postMessage({ type: 'LOGIN' });
        } catch (error) {
            setShowError(true);
            setErrorMessage(error.message);
        }
    };

    return (
        <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 480, mx: 'auto', width: '100%' }}>
            <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
                size="large"
                sx={{ mb: 2 }}
            />
            <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                size="large"
                sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth size="large" sx={{ py: 2, fontSize: '1.1rem' }}>
                Login
            </Button>
        </Box>
    );
};

export default Login;