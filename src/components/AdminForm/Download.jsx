import React, { useState } from 'react';
import Papa from 'papaparse';
import { getSortedQuestions } from '../../utils/bibleData';
import { fetchAllQuestions, searchQuestions } from '../../services/dataService';
import { useToast } from '../ToastMessage/Toast';
import useBibleReference from '../../hooks/useBibleReference';
import BibleReferenceSelector from '../BibleReferenceSelector';
import ThemeSelect, { defaultThemes } from '../ui/ThemeSelect';
import { Download as DownloadIcon, RotateCcw, FileSpreadsheet } from 'lucide-react';
import Button from '../ui/Button';
import SectionHeader from '../ui/SectionHeader';

const Download = () => {
  const showToast = useToast();
  const bibleRef = useBibleReference();
  const [selectedThemes, setSelectedThemes] = useState(defaultThemes);
  const [isDownloading, setIsDownloading] = useState(false);

  const excludeFields = ['_id', '__v', 'updatedAt', 'createdAt'];

  const generateAndDownloadCSV = (results, filename) => {
    if (!results?.length) {
      showToast('No questions available to download matching criteria', 'info');
      return;
    }

    const sortedResults = getSortedQuestions(results);
    const dataForCsv = sortedResults.map(item => {
      const filtered = {};
      Object.keys(item).forEach(key => {
        if (!excludeFields.includes(key)) {
          filtered[key] = item[key];
        }
      });
      return filtered;
    });

    const csvContent = Papa.unparse(dataForCsv, { header: true });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded ${sortedResults.length} questions to ${filename}`, 'success');
  };

  const handleDownloadFilteredCSV = async () => {
    setIsDownloading(true);
    try {
      const themeArr = selectedThemes.length === defaultThemes.length ? [] : selectedThemes;
      const results = await searchQuestions({
        book: bibleRef.book || null,
        chapter: bibleRef.chapter || null,
        verseStart: bibleRef.verseStart || null,
        verseEnd: bibleRef.verseEnd || null,
        themeArr: themeArr.length === 0 ? undefined : themeArr,
      });
      generateAndDownloadCSV(results, 'filtered_questions.csv');
    } catch (err) {
      showToast(err?.message || 'Download failed', 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadAllCSV = async () => {
    setIsDownloading(true);
    try {
      const results = await fetchAllQuestions();
      generateAndDownloadCSV(results, `questions_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    bibleRef.reset();
    setSelectedThemes(defaultThemes);
    showToast('Download filters reset.', 'success');
  };

  return (
    <div className="w-full mb-10">
      <SectionHeader className="!border-b-0 !pb-2 text-xl sm:text-2xl text-center">
        Download Questions
      </SectionHeader>
      <p className="text-base text-app-text-muted text-center mb-8">
        Export questions to CSV format. Select a Bible book and optional themes to filter your download, or download all questions.
      </p>

      <fieldset className="w-full p-4 sm:p-6 rounded-xl bg-secondary-50/60 dark:bg-stone-900/50 border border-app-border shadow-2xs flex flex-col gap-6">
        <legend className="px-2 text-lg font-bold text-app-text">
          Export Filters
        </legend>

        <div className="w-full">
          <BibleReferenceSelector
            bibleReference={bibleRef}
            layout="grid"
            labelPrefix="Download Filter: "
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2 border-t border-app-border/80">
          <ThemeSelect
            value={selectedThemes}
            onChange={setSelectedThemes}
            isMulti
            label="Filter by Themes"
          />

          <div className="flex justify-end pt-2 md:pt-7">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              className="text-app-text-muted hover:text-stone-900 dark:hover:text-stone-100 font-semibold"
            >
              <RotateCcw size={16} />
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t border-app-border/80">
          <Button
            onClick={handleDownloadFilteredCSV}
            disabled={!bibleRef.book}
            isLoading={isDownloading}
            className="w-full sm:w-auto min-w-[240px] text-base font-bold py-3"
          >
            <DownloadIcon size={20} />
            Download Filtered CSV
          </Button>

          <Button
            onClick={handleDownloadAllCSV}
            variant="outline"
            isLoading={isDownloading}
            className="w-full sm:w-auto min-w-[240px] text-base font-bold py-3"
          >
            <FileSpreadsheet size={20} />
            Download All CSV
          </Button>
        </div>
      </fieldset>
    </div>
  );
};

export default Download;
