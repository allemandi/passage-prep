import React, { useState, useRef } from 'react';
import {
    Box,
    Button,
    Typography,
} from '@mui/material';
import  UploadResultsPanel from './UploadResultsPanel';
import themes from '../../../data/themes.json';
import { bulkUploadQuestions } from '../../../utils/upload';
import { useToast } from '../../ToastMessage/Toast';

const Upload = () => {
        const [isUploading, setIsUploading] = useState(false);
            const fileInputRef = useRef(null);
        const [uploadResults, setUploadResults] = useState(null);
        const showToast = useToast();

        const handleBulkUpload = (e) =>
        bulkUploadQuestions({
            e,
            fileInputRef,
            setIsUploading,
            setUploadResults,
            showToast,
        });
    return (
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
    )
}

export default Upload;