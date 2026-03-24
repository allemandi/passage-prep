import { useState, useRef } from 'react';
import { UploadCloud, Download as DownloadIcon, FileText, X } from 'lucide-react';
import UploadResultsPanel from './UploadResultsPanel';
import themes from '../../data/themes.json';
import { bulkUploadQuestions } from '../../utils/upload';
import { useToast } from '../ToastMessage/Toast';
import Button from '../ui/Button';
import clsx from 'clsx';

const Upload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadResults, setUploadResults] = useState(null);
  const showToast = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadResults(null);
      } else {
        showToast('Please select a valid CSV file', 'warning');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        setUploadResults(null);
        // Also update the input ref just in case
        if (fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;
        }
      } else {
        showToast('Please drop a valid CSV file', 'warning');
      }
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
        showToast('Please select a file first', 'info');
        return;
    }

    await bulkUploadQuestions({
      e,
      fileInputRef,
      setIsUploading,
      setUploadResults,
      showToast,
    });

    // Clear selected file after upload attempt
    setSelectedFile(null);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadResults(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
    // Set focus back to upload label for accessibility
    setTimeout(() => {
        const label = document.querySelector('label[for="csv-upload"]');
        if (label) label.focus();
    }, 0);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      <h2 className="text-2xl font-bold text-app-text mb-10 text-center">
        Bulk Upload Questions
      </h2>

      <div
        className="grid md:grid-cols-2 gap-12 items-start"
      >
        {/* Left section */}
        <section className="flex flex-col items-start gap-8 text-left bg-app-surface/40 p-8 rounded-2xl border-2 border-app-border">
          <div>
            <h3 className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-4">Instructions</h3>
            <p className="text-app-text text-sm md:text-base mb-4 font-medium">
                Upload a CSV file with questions. The file must:
            </p>
            <ul className="list-disc list-inside text-sm text-app-text-muted space-y-2 leading-relaxed">
                <li>
                Have headers:{' '}
                <code className="font-mono bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded px-1.5 py-0.5">
                    theme
                </code>,{' '}
                <code className="font-mono bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded px-1.5 py-0.5">
                    question
                </code>,{' '}
                <code className="font-mono bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded px-1.5 py-0.5">
                    book
                </code>,{' '}
                <code className="font-mono bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded px-1.5 py-0.5">
                    chapter
                </code>,{' '}
                <code className="font-mono bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded px-1.5 py-0.5">
                    verseStart
                </code>,{' '}
                <code className="font-mono bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded px-1.5 py-0.5">
                    verseEnd
                </code>,{' '}
                <code className="font-mono bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded px-1.5 py-0.5">
                    isApproved
                </code>
                </li>
                <li>Use valid themes: {themes.join(', ')}</li>
                <li>Include only valid Bible books, chapters, and verse numbers</li>
                <li>Use quotation marks for values containing commas</li>
            </ul>
          </div>
          <a
            href="/questions-template.csv"
            download
            className="w-full"
          >
            <Button variant="outline" className="w-full gap-2">
                <DownloadIcon size={18} />
                Download Template
            </Button>
          </a>
        </section>

        {/* Right section */}
        <section className="flex flex-col items-center gap-8 w-full">
          <form
            onSubmit={handleBulkUpload}
            noValidate
            className="w-full flex flex-col gap-6"
          >
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                id="csv-upload"
                className="hidden"
                onChange={handleFileChange}
            />

            {!selectedFile ? (
                <label
                    htmlFor="csv-upload"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            fileInputRef.current?.click();
                        }
                    }}
                    role="button"
                    aria-label="Select CSV file for upload"
                    className={clsx(
                        "flex flex-col items-center justify-center gap-4 cursor-pointer border-2 border-dashed rounded-2xl py-12 px-6 w-full transition-all duration-300 text-app-text text-center group focus:outline-none focus:ring-2 focus:ring-primary-500",
                        isDragging
                            ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 scale-[1.02]"
                            : "border-app-border hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10"
                    )}
                >
                    <div className="p-4 bg-primary-100 dark:bg-primary-900/40 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <UploadCloud className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                        <span className="text-lg font-bold block mb-1">Select CSV File</span>
                        <span className="text-sm text-app-text-muted">or drag and drop here</span>
                    </div>
                </label>
            ) : (
                <div className="flex flex-col items-center justify-center gap-4 border-2 border-primary-500/50 bg-primary-50/20 dark:bg-primary-900/10 rounded-2xl py-8 px-6 w-full text-app-text relative animate-in fade-in zoom-in duration-300">
                    <button
                        type="button"
                        onClick={clearSelection}
                        className="absolute top-4 right-4 text-app-text-muted hover:text-red-500 transition-colors"
                        aria-label="Clear selection"
                    >
                        <X size={20} />
                    </button>
                    <div className="p-4 bg-primary-100 dark:bg-primary-900/40 rounded-full">
                        <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="text-center">
                        <span className="text-lg font-bold block mb-1 truncate max-w-xs">{selectedFile.name}</span>
                        <span className="text-sm text-app-text-muted">{formatFileSize(selectedFile.size)}</span>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3">
                <Button
                    type="submit"
                    isLoading={isUploading}
                    size="lg"
                    className="w-full"
                    disabled={!selectedFile}
                >
                    {isUploading ? 'Uploading...' : 'Upload Questions'}
                </Button>

                {uploadResults && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={clearSelection}
                        className="w-full"
                id="reset-upload-button"
                    >
                        Reset & Upload Another
                    </Button>
                )}
            </div>
          </form>

          <div aria-live="polite" className="w-full">
            <UploadResultsPanel results={uploadResults} themes={themes} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Upload;
