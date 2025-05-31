import { useState, useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import UploadResultsPanel from './UploadResultsPanel';
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
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2 mb-8 text-center">
        Bulk Upload Questions
      </h2>

      <form
        onSubmit={handleBulkUpload}
        noValidate
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-6 md:p-8 shadow-md grid md:grid-cols-[1fr_1fr] gap-y-10 gap-x-12"
      >
        {/* Left section */}
        <section className="flex flex-col items-start gap-6 text-left">
          <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
            Upload a CSV file with questions. The file must:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>
              Have headers:{' '}
              <code className="font-mono bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                theme
              </code>,{' '}
              <code className="font-mono bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                question
              </code>,{' '}
              <code className="font-mono bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                book
              </code>,{' '}
              <code className="font-mono bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                chapter
              </code>,{' '}
              <code className="font-mono bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                verseStart
              </code>{' '}
              (optional),{' '}
              <code className="font-mono bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                verseEnd
              </code>{' '}
              (optional),{' '}
              <code className="font-mono bg-gray-100 dark:bg-gray-700 rounded px-1 py-0.5">
                isApproved
              </code>{' '}
              (optional)
            </li>
            <li>Use valid themes: {themes.join(', ')}</li>
            <li>Include only valid Bible books, chapters, and verse numbers</li>
            <li>Use quotation marks for values containing commas</li>
          </ul>
          <a
            href="/questions-template.csv"
            download
            className="w-full py-3 rounded-lg text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow text-center"
          >
            Download Template
          </a>
        </section>

        {/* Right section */}
        <section className="flex flex-col items-center gap-6 w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            id="csv-upload"
            className="hidden"
          />
          <label
            htmlFor="csv-upload"
            className="flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer border border-gray-300 dark:border-gray-600 rounded-lg py-4 px-6 w-full hover:border-blue-600 transition text-gray-700 dark:text-gray-300 text-center"
          >
            <UploadCloud className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-medium">Select CSV File</span>
          </label>

          <button
            type="submit"
            disabled={isUploading}
            className={`w-full py-4 rounded-lg text-lg font-semibold text-white transition shadow
              ${isUploading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'}
            `}
          >
            {isUploading ? 'Uploading...' : 'Upload Questions'}
          </button>

          <UploadResultsPanel results={uploadResults} themes={themes} />
        </section>
      </form>
    </div>
  );
};

export default Upload;
