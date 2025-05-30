
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';


const UploadResultsPanel = ({ results, themes }) => {
  if (!results) return null;

  return (
    <Paper elevation={1} sx={{ p: 3, width: '100%', maxWidth: 600, mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Upload Results
      </Typography>

      <Typography variant="body1">Total questions: {results.totalQuestions}</Typography>
      <Typography variant="body1" color="success.main" sx={{ fontWeight: 500 }}>
        Successfully uploaded: {results.successful}
      </Typography>
      <Typography variant="body1" color="error.main" sx={{ fontWeight: 500 }}>
        Failed to upload: {results.failed}
      </Typography>

      {results.errors.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Errors:
          </Typography>
          <Box
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              mt: 1,
              border: '1px solid #ddd',
              borderRadius: 1,
              p: 2,
            }}
          >
            {results.errors.map((error, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  pb: 2,
                  borderBottom:
                    index < results.errors.length - 1 ? '1px solid #eee' : 'none',
                }}
              >
                <Typography variant="body2" fontWeight="medium" gutterBottom>
                  {error.question}
                </Typography>
                <Typography variant="body2" color="error.main">
                  <strong>Error:</strong> {error.error}
                </Typography>
              </Box>
            ))}
          </Box>
          <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
            Tip: Make sure your CSV has the correct headers (theme, question, book, chapter,
            verseStart, verseEnd) and that values match the expected formats. For themes, use
            one of: {themes.join(', ')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default UploadResultsPanel;
