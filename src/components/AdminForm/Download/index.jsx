import React, { useState } from 'react';
import { getBibleBooks, getChaptersForBook, getVersesForChapter, getSortedQuestions } from '../../../utils/bibleData';
import { fetchAllQuestions } from '../../../services/dataService';
import { downloadAllCSV, downloadFilteredCSV } from '../../../utils/download';
import { useToast } from '../../ToastMessage/Toast';
import ScriptureCombobox from '../../ScriptureCombobox';
import { DownloadIcon } from 'lucide-react';

const Download = () => {
  const showToast = useToast();

  const excludeFields = ['_id', '__v'];
  const [downloadRef, setDownloadRef] = useState({
    selectedBook: '',
    selectedChapter: '',
    verseStart: '',
    verseEnd: '',
    availableChapters: [],
    availableVerses: [],
  });

  const updateDownloadRef = (updates) => {
    setDownloadRef((prev) => {
      const newRef = { ...prev, ...updates };

      if (updates.selectedBook !== undefined) {
        newRef.availableChapters = getChaptersForBook(updates.selectedBook);
        newRef.selectedChapter = '';
        newRef.verseStart = '';
        newRef.verseEnd = '';
        newRef.availableVerses = [];
      }
      if (updates.selectedChapter !== undefined) {
        newRef.availableVerses = Array.from(
          { length: getVersesForChapter(prev.selectedBook, updates.selectedChapter) },
          (_, i) => (i + 1).toString()
        );
        newRef.verseStart = '';
        newRef.verseEnd = '';
      }

      return newRef;
    });
  };

  const handleDownloadFilteredCSV = () => {
    downloadFilteredCSV({
      fetchAllQuestions,
      downloadRef,
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
      <h2 className="text-xl font-semibold mb-6">Download Options</h2>

      <div className="flex flex-wrap justify-center gap-6 mb-6">
        <div className="w-full sm:w-[260px]">
          <ScriptureCombobox
            label="Book"
            value={downloadRef.selectedBook}
            onChange={(book) => updateDownloadRef({ selectedBook: book })}
            options={getBibleBooks()}
            placeholder="Select a book"
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-[260px]">
          <ScriptureCombobox
            label="Chapter"
            value={downloadRef.selectedChapter}
            onChange={(chapter) => updateDownloadRef({ selectedChapter: chapter })}
            options={downloadRef.availableChapters}
            disabled={!downloadRef.selectedBook}
            placeholder={downloadRef.selectedBook ? 'Select chapter' : 'Select book first'}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-[260px]">
          <ScriptureCombobox
            label="Start Verse"
            value={downloadRef.verseStart}
            onChange={(verse) => updateDownloadRef({ verseStart: verse })}
            options={downloadRef.availableVerses}
            disabled={!downloadRef.selectedChapter}
            placeholder={downloadRef.selectedChapter ? 'Select start verse' : 'Select chapter first'}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-[260px]">
          <ScriptureCombobox
            label="End Verse"
            value={downloadRef.verseEnd}
            onChange={(verse) => updateDownloadRef({ verseEnd: verse })}
            options={downloadRef.availableVerses}
            disabled={!downloadRef.selectedChapter}
            placeholder={downloadRef.selectedChapter ? 'Select end verse' : 'Select chapter first'}
            isEndVerse
            startVerseValue={downloadRef.verseStart}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
        <button
          onClick={handleDownloadFilteredCSV}
          disabled={!downloadRef.selectedBook}
          className={`w-full sm:w-[260px] py-3 text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition ${
            !downloadRef.selectedBook ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <DownloadIcon className="inline-block mr-2" size={20} />
          Download Filtered Questions
        </button>

        <button
          onClick={handleDownloadAllCSV}
          className="w-full sm:w-[260px] py-3 text-lg font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-lg transition"
        >
          <DownloadIcon className="inline-block mr-2" size={20} />
          Download All Questions
        </button>
      </div>
    </div>
  );
};

export default Download;