import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Grid,
} from '@mui/material';
import ScriptureCombobox from '../../ScriptureCombobox';
import { getBibleBooks } from '../../../utils/bibleData';
import { fetchAllQuestions } from '../../../services/dataService';
import { getChaptersForBook, getVersesForChapter, getSortedQuestions } from '../../../utils/bibleData';
import { downloadAllCSV, downloadFilteredCSV } from '../../../utils/download';
import { useToast } from '../../ToastMessage/Toast';

const Download = () => {
    const showToast = useToast();

    const excludeFields = ['_id', '__v'];
    const [downloadRef, setDownloadRef] = useState({
        selectedBook: '',
        selectedChapter: '',
        verseStart: '',
        verseEnd: '',
        availableChapters: [],
        availableVerses: [],
    });

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

    return (

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
    )
};

export default Download;