import React from 'react';
import Papa from 'papaparse';
import { getSortedQuestions } from '../../utils/bibleData';
import { fetchAllQuestions, searchQuestions } from '../../services/dataService';
import { useToast } from '../ToastMessage/Toast';
import useBibleReference from '../../hooks/useBibleReference';
import BibleReferenceSelector from '../BibleReferenceSelector';
import { Download as DownloadIcon } from 'lucide-react';
import Button from '../ui/Button';
import SectionHeader from '../ui/SectionHeader';

const Download = () => {
  const showToast = useToast();
  const bibleRef = useBibleReference();

  const excludeFields = ['_id', '__v', 'updatedAt'];

  const generateAndDownloadCSV = (results, filename) => {
    if (!results?.length) {
      showToast('No questions available to download', 'info');
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
  };

  const handleDownloadFilteredCSV = async () => {
    try {
      const results = await searchQuestions({
        book: bibleRef.book || null,
        chapter: bibleRef.chapter || null,
        verseStart: bibleRef.verseStart || null,
        verseEnd: bibleRef.verseEnd || null,
        themeArr: [],
      });
      generateAndDownloadCSV(results, 'filtered_questions.csv');
    } catch {
      showToast('Download failed', 'error');
    }
  };

  const handleDownloadAllCSV = async () => {
    try {
      const results = await fetchAllQuestions();
      generateAndDownloadCSV(results, `questions_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  return (
    <div className="w-full mb-10">
      <SectionHeader>Download Options</SectionHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-center mb-8">
        <BibleReferenceSelector
          bibleReference={bibleRef}
          layout="grid"
          labelPrefix="Download Filter: "
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full mt-10">
        <Button
          onClick={handleDownloadFilteredCSV}
          disabled={!bibleRef.book}
          className="w-full sm:w-auto min-w-[260px]"
        >
          <DownloadIcon className="inline-block mr-2" size={20} />
          Download Filtered
        </Button>

        <Button
          onClick={handleDownloadAllCSV}
          variant="outline"
          className="w-full sm:w-auto min-w-[260px]"
        >
          <DownloadIcon className="inline-block mr-2" size={20} />
          Download All
        </Button>
      </div>
    </div>
  );
};

export default Download;
