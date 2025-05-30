import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
    Paper,
    Alert,
    Snackbar,
    Container,
    Grid,
} from '@mui/material';


import { useTheme } from '@mui/material/styles';
import ReviewApprove from './ReviewApprove';

import Upload from './Upload';
import EditDelete from './EditDelete';
import Login from './Login';
import Download from './Download';


const SESSION_TIMEOUT_MINUTES = 30;
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000;


const AdminForm = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [activeButton, setActiveButton] = useState(null);
    const [logoutSuccess, setLogoutSuccess] = useState(false);

    const logoutTimerRef = useRef(null);



    const theme = useTheme();

    const handleLogout = useCallback((reason) => {
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
        }

        setIsLoggedIn(false);
        sessionStorage.removeItem('isLoggedIn');

        if (reason === 'inactivity') {
            setShowError(true);
            setErrorMessage('Logged out due to inactivity');
        } else if (reason === 'manual') {
            setLogoutSuccess(true);
        }
    }, []);

    const resetLogoutTimer = useCallback(() => {
        if (logoutTimerRef.current) {
            clearTimeout(logoutTimerRef.current);
        }
        logoutTimerRef.current = setTimeout(() => {
            handleLogout('inactivity');
        }, SESSION_TIMEOUT_MS);
    }, [handleLogout]);

    useEffect(() => {
        if (isLoggedIn) {
            resetLogoutTimer();
            const handleActivity = () => resetLogoutTimer();
            window.addEventListener('mousemove', handleActivity);
            window.addEventListener('keydown', handleActivity);

            return () => {
                if (logoutTimerRef.current) {
                    clearTimeout(logoutTimerRef.current);
                }
                window.removeEventListener('mousemove', handleActivity);
                window.removeEventListener('keydown', handleActivity);
            };
        }
    }, [isLoggedIn, resetLogoutTimer]);

    useEffect(() => {
        const storedLogin = sessionStorage.getItem('isLoggedIn');
        if (storedLogin === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    const handleButtonClick = (buttonName) => {
        setActiveButton(buttonName);
    };

   
    return (
        <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 6 }, pb: { xs: 2, md: 6 }, px: { xs: 0, md: 4 } }}>
            <Paper
                elevation={2}
                sx={{
                    p: { xs: 2, sm: 4, md: 6 },
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: `1.5px solid ${theme.palette.divider}`,
                    width: '100%',
                    maxWidth: 'none',
                    mx: 'auto',
                }}
            >
                {!isLoggedIn ? (<Login setIsLoggedIn={setIsLoggedIn} setShowError={setShowError} setErrorMessage={setErrorMessage} />
                ) : (
                    <Box sx={{ width: '100%' }}>
                        <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 700, letterSpacing: 1 }}>
                            Admin Mode
                        </Typography>
                        <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 5, width: '100%' }}>
                            <Grid item xs={12} sm={4} md={3}>
                                <Button
                                    variant={activeButton === 'edit' ? 'contained' : 'outlined'}
                                    onClick={() => handleButtonClick('edit')}
                                    fullWidth
                                    size="large"
                                    sx={{ py: 2, fontWeight: 600 }}
                                >
                                    Edit/Delete
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                                <Button
                                    variant={activeButton === 'review' ? 'contained' : 'outlined'}
                                    onClick={() => handleButtonClick('review')}
                                    fullWidth
                                    size="large"
                                    sx={{ py: 2, fontWeight: 600 }}
                                >
                                    Review/Approve
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                                <Button
                                    variant={activeButton === 'download' ? 'contained' : 'outlined'}
                                    onClick={() => handleButtonClick('download')}
                                    fullWidth
                                    size="large"
                                    sx={{ py: 2, fontWeight: 600 }}
                                >
                                    Download
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                                <Button
                                    variant={activeButton === 'upload' ? 'contained' : 'outlined'}
                                    onClick={() => handleButtonClick('upload')}
                                    fullWidth
                                    size="large"
                                    sx={{ py: 2, fontWeight: 600 }}
                                >
                                    Bulk Upload
                                </Button>
                            </Grid>
                        </Grid>

                        {activeButton === 'edit' && (<EditDelete />)}
                        {activeButton === 'review' && (<ReviewApprove />)}
                        {activeButton === 'download' && (
                            <Download />)}

                        {activeButton === 'upload' && (<Upload />)}
                        <Button variant="outlined" onClick={() => handleLogout('manual')} fullWidth size="large" sx={{ mt: 4, py: 2, fontWeight: 600 }}>
                            Logout
                        </Button>
                    </Box>
                )}
            </Paper>

            <Snackbar
                open={showError}
                autoHideDuration={6000}
                onClose={() => setShowError(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setShowError(false)} severity="error">
                    {errorMessage}
                </Alert>
            </Snackbar>

            <Snackbar
                open={logoutSuccess}
                autoHideDuration={6000}
                onClose={() => setLogoutSuccess(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="success">Logged out successfully</Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminForm;