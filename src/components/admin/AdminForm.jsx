import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Alert,
    Snackbar,
    Container,
    Grid
    // Checkbox, - REMOVED
    // ListItemText, - REMOVED
    // MenuItem - REMOVED
} from '@mui/material';
// import QuestionTable from '../QuestionTable'; - REMOVED
// import { searchQuestions, fetchAllQuestions, fetchUnapprovedQuestions } from '../../services/dataService'; - REMOVED
import { fetchAllQuestions } from '../../services/dataService'; // Added fetchAllQuestions
import ScriptureCombobox from '../ScriptureCombobox'; // Ensured ScriptureCombobox import
// import { getBibleBooks, getChaptersForBook, getVersesForChapter, getSortedQuestions } from '../../utils/bibleData'; - REMOVED
import { getBibleBooks, getChaptersForBook, getVersesForChapter, getSortedQuestions } from '../../utils/bibleData'; // Keep for Download and Upload
import themes from '../../data/themes.json'; // Keep for Upload
import { useTheme } from '@mui/material/styles';
import ReviewApprove from '../Admin/ReviewApprove';
import EditDelete from './EditDelete'; // Import the new component
import { downloadAllCSV, downloadFilteredCSV } from '../../utils/download';
import { bulkUploadQuestions } from '../../utils/upload'
import UploadResultsPanel from '../Admin/UploadResultsPanel';
const authChannel = new BroadcastChannel('auth');

const excludeFields = ['_id', '__v'];

const SESSION_TIMEOUT_MINUTES = 30; // Adjustable timeout in minutes
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_MINUTES * 60 * 1000; // Convert to milliseconds
import { useToast } from '../ToastMessage/Toast';


const AdminForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [activeButton, setActiveButton] = useState(null);
    // const [selectedQuestions, setSelectedQuestions] = useState([]); - REMOVED
    // const [scriptureRefs, setScriptureRefs] = useState([{ - REMOVED
    //     id: 1, - REMOVED
    //     selectedBook: '', - REMOVED
    //     selectedChapter: '', - REMOVED
    //     verseStart: '', - REMOVED
    //     verseEnd: '', - REMOVED
    //     availableChapters: [], - REMOVED
    //     availableVerses: [], - REMOVED
    // }]); - REMOVED
    // const [selectedThemes, setSelectedThemes] = useState(themes); - REMOVED
    // const [filteredQuestions, setFilteredQuestions] = useState([]); - REMOVED
    const [showSuccess, setShowSuccess] = useState(false);
    const [logoutSuccess, setLogoutSuccess] = useState(false);
    // const [hideUnapproved, setHideUnapproved] = useState(false); - REMOVED
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState(null);
    const fileInputRef = useRef(null);
    const showToast = useToast();

    // Use ref for logoutTimer to avoid dependency issues
    const logoutTimerRef = useRef(null);

    

    // Add state for download filters
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

        authChannel.postMessage({ type: 'LOGOUT' });
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
        const handleAuthMessage = (event) => {
            if (event.data.type === 'LOGIN') {
                setIsLoggedIn(true);
                sessionStorage.setItem('isLoggedIn', 'true');
                resetLogoutTimer();
            } else if (event.data.type === 'LOGOUT') {
                setIsLoggedIn(false);
                sessionStorage.removeItem('isLoggedIn');
                if (logoutTimerRef.current) {
                    clearTimeout(logoutTimerRef.current);
                    logoutTimerRef.current = null;
                }
            }
        };

        authChannel.addEventListener('message', handleAuthMessage);
        return () => authChannel.removeEventListener('message', handleAuthMessage);
    }, [resetLogoutTimer]);

    useEffect(() => {
        if (isLoggedIn) {
            const updateLastActivity = () => {
                sessionStorage.setItem('lastActivity', Date.now().toString());
            };

            const checkInactivity = () => {
                const lastActivity = sessionStorage.getItem('lastActivity');
                const now = Date.now();
                if (lastActivity && (now - parseInt(lastActivity) > SESSION_TIMEOUT_MS)) {
                    handleLogout('inactivity');
                }
            };

            window.addEventListener('mousemove', updateLastActivity);
            window.addEventListener('keydown', updateLastActivity);

            const intervalId = setInterval(checkInactivity, 60000);

            return () => {
                clearInterval(intervalId);
                window.removeEventListener('mousemove', updateLastActivity);
                window.removeEventListener('keydown', updateLastActivity);
            };
        }
    }, [isLoggedIn, handleLogout]);

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
        } catch (error) {
            setShowError(true);
            setErrorMessage(error.message);
        }
    };

    const closeError = () => {
        setShowError(false);
    };

    const handleButtonClick = (buttonName) => {
        setActiveButton(buttonName);
    };

    // const handleQuestionSelect = (indices, isSelected) => { - REMOVED
    //     setSelectedQuestions(prev => { - REMOVED
    //         if (!Array.isArray(indices)) indices = [indices]; - REMOVED
    //         if (indices.length === filteredQuestions.length) { - REMOVED
    //             return prev.length === filteredQuestions.length ? [] : indices; - REMOVED
    //         } - REMOVED
    //         if (indices.length === 0) { - REMOVED
    //             return prev.length === filteredQuestions.length ? [] : - REMOVED
    //                 Array.from({ length: filteredQuestions.length }, (_, i) => i); - REMOVED
    //         } - REMOVED
    //         return isSelected - REMOVED
    //             ? [...new Set([...prev, ...indices])] - REMOVED
    //             : prev.filter(i => !indices.includes(i)); - REMOVED
    //     }); - REMOVED
    // }; - REMOVED

    // const updateScriptureRef = (index, updates) => { - REMOVED
    //     setScriptureRefs(prev => { - REMOVED
    //         const newRefs = [...prev]; - REMOVED
    //         const currentRef = newRefs[index]; - REMOVED
    //         if (updates.verseStart !== undefined) { - REMOVED
    //             const newStart = updates.verseStart; - REMOVED
    //             const currentEnd = updates.verseEnd !== undefined ? updates.verseEnd : currentRef.verseEnd; - REMOVED
    //             if (currentEnd === undefined || currentEnd === '' || isNaN(Number(currentEnd))) { - REMOVED
    //                 updates.verseEnd = newStart; - REMOVED
    //             } else if (parseInt(currentEnd) < parseInt(newStart)) { - REMOVED
    //                 updates.verseEnd = newStart; - REMOVED
    //             } - REMOVED
    //         } - REMOVED
    //         if (updates.selectedBook !== undefined) { - REMOVED
    //             const chapters = getChaptersForBook(updates.selectedBook); - REMOVED
    //             newRefs[index] = { - REMOVED
    //                 ...currentRef, - REMOVED
    //                 ...updates, - REMOVED
    //                 selectedChapter: '', - REMOVED
    //                 verseStart: '', - REMOVED
    //                 verseEnd: '', - REMOVED
    //                 availableChapters: chapters, - REMOVED
    //                 availableVerses: [], - REMOVED
    //             }; - REMOVED
    //         } - REMOVED
    //         else if (updates.selectedChapter !== undefined) { - REMOVED
    //             const verses = Array.from( - REMOVED
    //                 { length: getVersesForChapter(currentRef.selectedBook, updates.selectedChapter) }, - REMOVED
    //                 (_, i) => (i + 1).toString() - REMOVED
    //             ); - REMOVED
    //             newRefs[index] = { - REMOVED
    //                 ...currentRef, - REMOVED
    //                 ...updates, - REMOVED
    //                 verseStart: '', - REMOVED
    //                 verseEnd: '', - REMOVED
    //                 availableVerses: verses, - REMOVED
    //             }; - REMOVED
    //         } - REMOVED
    //         else { - REMOVED
    //             newRefs[index] = { ...currentRef, ...updates }; - REMOVED
    //         } - REMOVED

    //         return newRefs; - REMOVED
    //     }); - REMOVED
    // }; - REMOVED

    // useEffect(() => { - REMOVED
    //     if (activeButton === 'review' && isLoggedIn) { - REMOVED
    //         (async () => { - REMOVED
    //             try { - REMOVED
    //                 const unapproved = await fetchUnapprovedQuestions(); - REMOVED
    //                 setFilteredQuestions(unapproved); - REMOVED
    //             } catch (error) { - REMOVED
    //                 setShowError(true); - REMOVED
    //                 setErrorMessage(error.message); - REMOVED
    //                 setFilteredQuestions([]); - REMOVED
    //             } - REMOVED
    //         })(); - REMOVED
    //     } - REMOVED
    //     if (activeButton === 'edit') { - REMOVED
    //         setFilteredQuestions([]); - REMOVED
    //     } - REMOVED
    // }, [activeButton, isLoggedIn]); - REMOVED


    // const applyApiFilters = useCallback(async () => { - REMOVED
    //     try { - REMOVED
    //         const ref = scriptureRefs[0]; - REMOVED
    //         if (activeButton === 'review') { - REMOVED
    //             const unapproved = await fetchUnapprovedQuestions(); - REMOVED
    //             let filtered = unapproved; - REMOVED
    //             if (ref.selectedBook) { - REMOVED
    //                 filtered = filtered.filter(q => q.book === ref.selectedBook); - REMOVED
    //             } - REMOVED
    //             if (ref.selectedChapter) { - REMOVED
    //                 filtered = filtered.filter(q => String(q.chapter) === String(ref.selectedChapter)); - REMOVED
    //             } - REMOVED
    //             if (ref.verseStart && ref.verseEnd && !isNaN(Number(ref.verseStart)) && !isNaN(Number(ref.verseEnd))) { - REMOVED
    //                 filtered = filtered.filter(q => - REMOVED
    //                     parseInt(q.verseStart) <= Number(ref.verseEnd) && - REMOVED
    //                     parseInt(q.verseEnd || q.verseStart) >= Number(ref.verseStart) - REMOVED
    //                 ); - REMOVED
    //             } else { - REMOVED
    //                 if (ref.verseStart && !isNaN(Number(ref.verseStart))) { - REMOVED
    //                     filtered = filtered.filter(q => parseInt(q.verseStart) >= Number(ref.verseStart)); - REMOVED
    //                 } - REMOVED
    //                 if (ref.verseEnd && !isNaN(Number(ref.verseEnd))) { - REMOVED
    //                     filtered = filtered.filter(q => parseInt(q.verseEnd || q.verseStart) <= Number(ref.verseEnd)); - REMOVED
    //                 } - REMOVED
    //             } - REMOVED
    //             if (selectedThemes.length !== themes.length) { - REMOVED
    //                 filtered = filtered.filter(q => selectedThemes.includes(q.theme)); - REMOVED
    //             } - REMOVED
    //             setFilteredQuestions(filtered); - REMOVED
    //             return; - REMOVED
    //         } - REMOVED
    //         const filter = {}; - REMOVED
    //         if (ref.selectedBook) filter.book = ref.selectedBook; - REMOVED
    //         filter.chapter = ref.selectedChapter || null; - REMOVED
    //         filter.verseStart = ref.verseStart || null; - REMOVED
    //         filter.verseEnd = ref.verseEnd || null; - REMOVED
    //         if (selectedThemes.length !== themes.length) filter.themeArr = selectedThemes; - REMOVED

    //         if (hideUnapproved) { - REMOVED
    //             filter.isApproved = true; - REMOVED
    //         } - REMOVED
    //         const results = await searchQuestions(filter); - REMOVED
    //         setFilteredQuestions(results); - REMOVED
    //     } catch (error) { - REMOVED
    //         setShowError(true); - REMOVED
    //         setErrorMessage(error.message); - REMOVED
    //         setFilteredQuestions([]); - REMOVED
    //     } - REMOVED
    // }, [scriptureRefs, selectedThemes, activeButton]); - REMOVED

    // const handleDeleteSelected = useCallback(async () => { - REMOVED
    //     if (selectedQuestions.length === 0) return; - REMOVED

    //     try { - REMOVED
    //         const questionIds = selectedQuestions.map(index => filteredQuestions[index]._id); - REMOVED
    //         const response = await fetch('/api/delete-questions', { - REMOVED
    //             method: 'POST', - REMOVED
    //             headers: { 'Content-Type': 'application/json' }, - REMOVED
    //             body: JSON.stringify({ questionIds }), - REMOVED
    //         }); - REMOVED

    //         if (!response.ok) throw new Error('Failed to delete questions'); - REMOVED

    //         setShowSuccess(true); - REMOVED
    //         setSelectedQuestions([]); - REMOVED
    //         await applyApiFilters(); - REMOVED
    //     } catch (error) { - REMOVED
    //         setShowError(true); - REMOVED
    //         setErrorMessage(error.message); - REMOVED
    //     } - REMOVED
    // }, [selectedQuestions, filteredQuestions, applyApiFilters]); - REMOVED

    // const handleQuestionUpdate = useCallback(async (questionId, updatedData) => { - REMOVED
    //     try { - REMOVED
    //         const response = await fetch('/api/update-question', { - REMOVED
    //             method: 'POST', - REMOVED
    //             headers: { 'Content-Type': 'application/json' }, - REMOVED
    //             body: JSON.stringify({ questionId, updatedData }), - REMOVED
    //         }); - REMOVED

    //         if (!response.ok) throw new Error('Failed to update question'); - REMOVED

    //         setShowSuccess(true); - REMOVED
    //         await applyApiFilters(); - REMOVED
    //     } catch (error) { - REMOVED
    //         setShowError(true); - REMOVED
    //         setErrorMessage(error.message); - REMOVED
    //     } - REMOVED
    // }, [applyApiFilters]); - REMOVED


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

                        {activeButton === 'edit' && (
                            <EditDelete />
                        )}

                        {activeButton === 'review' && ( <ReviewApprove />)}

                        {activeButton === 'download' && (
                            <Box sx={{ mb: 5, width: '100%' }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                    Download Options
                                </Typography>
                                <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap' }}>
                                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <Box sx={{ width: { xs: '100%', sm: 260 } }}>
                                            <ScriptureCombobox // This import was missing, but it seems the component is used. Re-adding for Download.
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
                                            <ScriptureCombobox // This import was missing, but it seems the component is used. Re-adding for Download.
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
                                            <ScriptureCombobox // This import was missing, but it seems the component is used. Re-adding for Download.
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
                                            <ScriptureCombobox // This import was missing, but it seems the component is used. Re-adding for Download.
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
                onClose={closeError}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={closeError} severity="error">
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

            <Snackbar
                open={showSuccess}
                autoHideDuration={6000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert severity="success">Operation successful</Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminForm;