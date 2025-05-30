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

import { fetchAllQuestions } from '../../services/dataService';
import ScriptureCombobox from '../ScriptureCombobox';
import { getBibleBooks, getChaptersForBook, getVersesForChapter, getSortedQuestions } from '../../utils/bibleData';
import themes from '../../data/themes.json';
import { useTheme } from '@mui/material/styles';
import ReviewApprove from '../Admin/ReviewApprove';
import { downloadAllCSV, downloadFilteredCSV } from '../../utils/download';
import { bulkUploadQuestions } from '../../utils/upload'
import UploadResultsPanel from './UploadResultsPanel';
import EditDelete from './EditDelete';
import Login from './LoginPanel';
import { useToast } from '../ToastMessage/Toast';

const SESSION_TIMEOUT_MINUTES = 30;
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000;
const excludeFields = ['_id', '__v'];

const AdminForm = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [activeButton, setActiveButton] = useState(null);
    const [logoutSuccess, setLogoutSuccess] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState(null);
    const fileInputRef = useRef(null);
    const showToast = useToast();
    const logoutTimerRef = useRef(null);

    const [downloadRef, setDownloadRef] = useState({
        selectedBook: '',
        selectedChapter: '',
        verseStart: '',
        verseEnd: '',
        availableChapters: [],
        availableVerses: [],
    });

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

    const updateDownloadRef = (updates) => {
        setDownloadRef(prev => {
            const newRef = { ...prev, ...updates };

            if (updates.selectedBook !== undefined) {
                newRef.availableChapters = getChaptersForBook(updates.selectedBook);
                newRef.selectedChapter = '';
                newRef.verseStart = '';
                newRef.verseEnd = '';
                newRef.availableVerses = [];
            }
            if (updates.selectedChapter !== undefined) {
                newRef.availableVerses = Array.from(
                    { length: getVersesForChapter(prev.selectedBook, updates.selectedChapter) },
                    (_, i) => (i + 1).toString()
                );
                newRef.verseStart = '';
                newRef.verseEnd = '';
            }

            return newRef;
        });
    };

    const handleDownloadFilteredCSV = () => {
        downloadFilteredCSV({
            fetchAllQuestions,
            downloadRef,
            excludeFields,
            getSortedQuestions,
            showToast,
        });
    };

    const handleDownloadAllCSV = () => {
        downloadAllCSV({
            fetchAllQuestions,
            excludeFields,
            getSortedQuestions,
            showToast,
        });
    };

    const handleBulkUpload = (e) =>
        bulkUploadQuestions({
            e,
            fileInputRef,
            setIsUploading,
            setUploadResults,
            showToast,
        });

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
                {!isLoggedIn ? (
                    <Login 
                        setIsLoggedIn={setIsLoggedIn} 
                        setShowError={setShowError} 
                        setErrorMessage={setErrorMessage} 
                    />
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
                            <Box sx={{ mb: 5, width: '100%' }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                    Download Options
                                </Typography>
                                <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
                                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                                            <ScriptureCombobox
                                                label="Book"
                                                value={downloadRef.selectedBook}
                                                onChange={(book) => updateDownloadRef({ selectedBook: book })}
                                                options={getBibleBooks()}
                                                placeholder="Select a book"
                                                sx={{ width: '100%' }}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                                            <ScriptureCombobox
                                                label="Chapter"
                                                value={downloadRef.selectedChapter}
                                                onChange={(chapter) => updateDownloadRef({ selectedChapter: chapter })}
                                                options={downloadRef.availableChapters}
                                                disabled={!downloadRef.selectedBook}
                                                placeholder={downloadRef.selectedBook ? "Select chapter" : "Select book first"}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                                            <ScriptureCombobox
                                                label="Start Verse"
                                                value={downloadRef.verseStart}
                                                onChange={(verse) => updateDownloadRef({ verseStart: verse })}
                                                options={downloadRef.availableVerses}
                                                disabled={!downloadRef.selectedChapter}
                                                placeholder={downloadRef.selectedChapter ? "Select start verse" : "Select chapter first"}
                                            />
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                                            <ScriptureCombobox
                                                label="End Verse"
                                                value={downloadRef.verseEnd}
                                                onChange={(verse) => updateDownloadRef({ verseEnd: verse })}
                                                options={downloadRef.availableVerses}
                                                disabled={!downloadRef.selectedChapter}
                                                placeholder={downloadRef.selectedChapter ? "Select end verse" : "Select chapter first"}
                                                isEndVerse
                                                startVerseValue={downloadRef.verseStart}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleDownloadFilteredCSV}
                                        sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 260 } }}
                                        disabled={!downloadRef.selectedBook}
                                        size="large"
                                    >
                                        Download Filtered Questions
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={handleDownloadAllCSV}
                                        sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 260 } }}
                                        size="large"
                                    >
                                        Download All Questions
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {activeButton === 'upload' && (
                            <Box sx={{ mb: 5, width: '100%' }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                    Bulk Upload Questions
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, mb: 4 }}>
                                    <Typography variant="body1" sx={{ textAlign: 'center', maxWidth: 760 }}>
                                        Upload a CSV file with questions. The file must:
                                        <ul style={{ textAlign: 'left', margin: '10px 0' }}>
                                            <li>Have headers: <code>theme</code>, <code>question</code>, <code>book</code>, <code>chapter</code>, <code>verseStart</code>, <code>verseEnd</code> (optional), <code>isApproved</code> (optional)</li>
                                            <li>Use valid themes: {themes.join(', ')}</li>
                                            <li>Include only valid Bible books, chapters, and verse numbers</li>
                                            <li>Use quotation marks for values containing commas</li>
                                        </ul>
                                        Download the template below for a properly formatted example.
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        href="/questions-template.csv"
                                        download
                                        sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 260 } }}
                                        size="large"
                                    >
                                        Download Template
                                    </Button>
                                </Box>

                                <Box component="form" onSubmit={handleBulkUpload} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <Box sx={{ width: '100%', maxWidth: 600 }}>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv"
                                            id="csv-upload"
                                            style={{ display: 'none' }}
                                        />
                                        <label htmlFor="csv-upload">
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                fullWidth
                                                size="large"
                                                sx={{ py: 1.5, mb: 2 }}
                                            >
                                                Select CSV File
                                            </Button>
                                        </label>
                                    </Box>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        sx={{ py: 1.5, fontSize: '1.1rem', width: { xs: '100%', sm: 260 } }}
                                        size="large"
                                    >
                                        {'Upload Questions'}
                                    </Button>

                                    <UploadResultsPanel results={uploadResults} themes={themes} />
                                </Box>
                            </Box>
                        )}

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