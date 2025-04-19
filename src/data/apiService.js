// API Service for handling server requests

/**
 * Gets the correct API URL based on the environment
 * @param {string} endpoint - The API endpoint path
 * @returns {string} - The full API URL
 */
const getApiUrl = (endpoint) => {
  // In production with Netlify, use /.netlify/functions/
  // In development, use /api/
  const base = import.meta.env.MODE === 'production' 
    ? '/.netlify/functions'
    : '/api';
  
  return `${base}/${endpoint}`;
};

/**
 * Check if server is available
 * @returns {Promise<boolean>} - Whether the server is reachable
 */
export const checkServerHealth = async () => {
  try {
    const result = await fetch(getApiUrl('health'), { method: 'GET' });
    return result.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Create and download a CSV file in the browser
 * @param {Object} data - The data to convert to CSV
 * @param {string} filename - The name of the file to download
 * @returns {Promise<boolean>} - Whether the download was successful
 */
export const downloadCSV = async (data, filename = 'question.csv') => {
  try {
    // Import Papa dynamically to avoid issues if it's not loaded yet
    const Papa = (await import('papaparse')).default;
    
    // Prepare the CSV data
    const csv = Papa.unparse([data]);
    
    // Create a temporary link element
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set properties for downloading
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // Add to document, trigger click, and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    return false;
  }
}; 