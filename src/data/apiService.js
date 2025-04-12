// API Service for handling server requests

/**
 * Generic fetch wrapper with error handling
 * @param {string} url - The URL to fetch from
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} - The response data
 */
const fetchWithErrorHandling = async (url, options = {}, retries = 2) => {
  try {
    console.log(`Sending ${options.method || 'GET'} request to ${url}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData?.error || errorMessage;
        console.error('Error response:', errorData);
      } catch (e) {
        console.error('Could not parse error response as JSON');
      }
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying request to ${url}, ${retries} retries left`);
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithErrorHandling(url, options, retries - 1);
    }
    console.error(`Error fetching from ${url}:`, error);
    throw error;
  }
};

/**
 * Check if server is available
 * @returns {Promise<boolean>} - Whether the server is reachable
 */
export const checkServerHealth = async () => {
  try {
    console.log('Checking server health...');
    const result = await fetch('/api/health', { method: 'GET' });
    const isOk = result.ok;
    console.log('Health check result:', isOk ? 'OK' : 'Failed');
    return isOk;
  } catch (error) {
    console.error('Server health check failed:', error);
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
      console.warn('Server is not reachable');
      return false;
    }
    
    console.log('Sending question data to server:', data);
    
    const requestBody = JSON.stringify({ newData: data });
    console.log('Request body:', requestBody);
    
    const result = await fetchWithErrorHandling('/api/save-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    if (result.success) {
      console.log('Question saved successfully to MongoDB');
      return true;
    } else {
      console.warn('Server returned success:false', result);
      return false;
    }
  } catch (error) {
    console.error('Error saving question to MongoDB:', error);
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
    
    console.log('CSV file downloaded successfully');
    return true;
  } catch (error) {
    console.error('Error downloading CSV:', error);
    return false;
  }
}; 