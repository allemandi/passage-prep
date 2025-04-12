// API Service for handling server requests

/**
 * Gets the correct API URL based on the environment
 * @param {string} endpoint - The API endpoint path
 * @returns {string} - The full API URL
 */
const getApiUrl = (endpoint) => {
  // In production with Netlify, use /.netlify/functions/
  // In development, use /api/
  const base = process.env.NODE_ENV === 'production' 
    ? '/.netlify/functions'
    : '/api';
  
  return `${base}/${endpoint}`;
};

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - The API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - The response data
 */
const fetchWithErrorHandling = async (endpoint, options = {}, retries = 2) => {
  const url = getApiUrl(endpoint);
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.error || errorMessage;
      } catch (e) {
        // Could not parse error response as JSON
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithErrorHandling(endpoint, options, retries - 1);
    }
    throw error;
  }
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
 * Save a question to the server's MongoDB database
 * @param {Object} data - The question data to save
 * @returns {Promise<boolean>} - Whether the save was successful
 */
export const saveQuestionToServer = async (_, data) => {
  try {
    // First check if the server is available
    const isServerReachable = await checkServerHealth().catch(() => false);
    if (!isServerReachable) {
      return false;
    }
    
    const requestBody = JSON.stringify({ newData: data });
    
    const result = await fetchWithErrorHandling('save-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    return result.success === true;
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