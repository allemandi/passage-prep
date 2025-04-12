const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'build')));

// Helper function to escape CSV values
const escapeCSV = (value) => {
  // If the value contains commas, quotes, or newlines, wrap it in quotes and escape any quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

// API endpoint to save a question to Questions.csv
app.post('/api/save-question', (req, res) => {
  try {
    const { file, newData } = req.body;
    
    if (!file || !newData || !newData.Theme || !newData.Question || !newData.Subcategory) {
      return res.status(400).json({ error: 'Missing required question data' });
    }
    
    console.log('Received request to save question:', newData);
    
    // Extract filename from path
    const filename = file.split('/').pop();
    const filePath = path.join(__dirname, 'public', 'document', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return res.status(404).json({ error: `File ${filename} not found` });
    }
    
    // Escape each field to handle special characters in CSV
    const escapedTheme = escapeCSV(newData.Theme);
    const escapedQuestion = escapeCSV(newData.Question);
    const escapedSubcategory = escapeCSV(newData.Subcategory);
    
    // Format the new line with proper CSV formatting
    const newLine = `\n${escapedTheme},${escapedQuestion},${escapedSubcategory}`;
    
    // Append new data to the CSV file
    fs.appendFileSync(filePath, newLine);
    
    console.log(`Question successfully added to ${filename}:`, newData);
    
    res.status(200).json({ success: true, message: 'Question saved successfully' });
  } catch (error) {
    console.error('Error saving question:', error);
    res.status(500).json({ error: 'Failed to save question', details: error.message });
  }
});

// API endpoint to test if the server is reachable
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/save-question`);
}); 