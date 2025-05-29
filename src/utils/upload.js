const bulkUploadQuestions = async ({
  e,
  fileInputRef,
  setIsUploading,
  setUploadResults,
  showToast,
}) => {
  e.preventDefault();
  const file = fileInputRef.current.files[0];

  if (!file) {
    showToast('Please select a CSV file to upload', 'info');
    return;
  }

  if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
    showToast('File must be a CSV file', 'warning');
    return;
  }

  setIsUploading(true);
  try {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const csvContent = event.target.result;

        const url =
          import.meta.env.MODE === 'production'
            ? '/.netlify/functions/bulk-upload'
            : '/api/bulk-upload';

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvText: csvContent }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to upload questions');
        }

        const results = await response.json();
        setUploadResults(results);

        if (results.successful > 0) {
          showToast(`${results.successful} question(s) uploaded successfully`, 'success');
        }

        if (results.failed > 0) {
          showToast(
            `${results.failed} question(s) failed to upload. Check results for details.`,
            'warning'
          );
        }

        fileInputRef.current.value = null;
      } catch (error) {
        showToast(error.message, 'error');
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      showToast('Error reading file', 'error');
      setIsUploading(false);
    };

    reader.readAsText(file);
  } catch (error) {
    showToast(error.message, 'error');
  }
};

export {
  bulkUploadQuestions,
};