import { useState, useRef } from 'react';
import { UploadCloud, Download as DownloadIcon } from 'lucide-react';
import UploadResultsPanel from './UploadResultsPanel';
import themes from '../../../data/themes.json';
import { bulkUploadQuestions } from '../../../utils/upload';
import { useToast } from '../../ToastMessage/Toast';
import Button from '../../ui/Button';

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
            />
            <label
                htmlFor="csv-upload"
                className="flex flex-col items-center justify-center gap-4 cursor-pointer border-2 border-dashed border-app-border rounded-2xl py-12 px-6 w-full hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all duration-300 text-app-text text-center group"
            >
                <div className="p-4 bg-primary-100 dark:bg-primary-900/40 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <UploadCloud className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                    <span className="text-lg font-bold block mb-1">Select CSV File</span>
                    <span className="text-sm text-app-text-muted">or drag and drop here</span>
                </div>
            </label>

            <Button
                type="submit"
                isLoading={isUploading}
                size="lg"
                className="w-full"
            >
                {isUploading ? 'Uploading...' : 'Upload Questions'}
            </Button>
          </form>

          <UploadResultsPanel results={uploadResults} themes={themes} />
        </section>
      </div>
    </div>
  );
};

export default Upload;
