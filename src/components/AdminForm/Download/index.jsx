import React from 'react';
import { getBibleBooks, getSortedQuestions } from '../../../utils/bibleData';
import { fetchAllQuestions } from '../../../services/dataService';
import { downloadAllCSV, downloadFilteredCSV } from '../../../utils/download';
import { useToast } from '../../ToastMessage/Toast';
import useBibleReference from '../../../hooks/useBibleReference';
import ScriptureCombobox from '../../ScriptureCombobox';
import { DownloadIcon } from 'lucide-react';
import Button from '../../ui/Button';
import SectionHeader from '../../ui/SectionHeader';

const bibleBooks = getBibleBooks();

const Download = () => {
  const showToast = useToast();
  const bibleRef = useBibleReference();

  const excludeFields = ['_id', '__v'];

  const handleDownloadFilteredCSV = () => {
    downloadFilteredCSV({
      fetchAllQuestions,
      downloadRef: bibleRef,
      excludeFields,
      getSortedQuestions,
      showToast,
    });
  };

  const handleDownloadAllCSV = () => {
    downloadAllCSV({
      fetchAllQuestions,
      excludeFields,
      getSortedQuestions,
      showToast,
    });
  };

  return (
    <div className="w-full mb-10">
      <SectionHeader>Download Options</SectionHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-center mb-8">
        <ScriptureCombobox
          label="Book"
          value={bibleRef.book}
          onChange={(book) => bibleRef.updateReference({ book })}
          options={bibleBooks}
          placeholder="Select a book"
        />
        <ScriptureCombobox
          label="Chapter"
          value={bibleRef.chapter}
          onChange={(chapter) => bibleRef.updateReference({ chapter })}
          options={bibleRef.availableChapters}
          disabled={!bibleRef.book}
          placeholder={bibleRef.book ? "Select chapter" : "Select book first"}
        />
        <ScriptureCombobox
          label="Start Verse"
          value={bibleRef.verseStart}
          onChange={(verseStart) => bibleRef.updateReference({ verseStart })}
          options={bibleRef.availableVerses}
          disabled={!bibleRef.chapter}
          placeholder={bibleRef.chapter ? "Start verse" : "..."}
        />
        <ScriptureCombobox
          label="End Verse"
          value={bibleRef.verseEnd}
          onChange={(verseEnd) => bibleRef.updateReference({ verseEnd })}
          options={bibleRef.availableVerses}
          disabled={!bibleRef.chapter}
          placeholder={bibleRef.chapter ? "End verse" : "..."}
          isEndVerse
          startVerseValue={bibleRef.verseStart}
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