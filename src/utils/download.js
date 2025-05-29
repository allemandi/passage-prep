import Papa from 'papaparse';
import { searchQuestions } from '../services/dataService';

const downloadAllCSV = async ({
  fetchAllQuestions,
  excludeFields,
  getSortedQuestions,
  showToast,
}) => {
  try {
    const results = await fetchAllQuestions();

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
    link.download = `questions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    showToast('Download failed', 'error');
  }
};


const downloadFilteredCSV = async ({
  excludeFields,
  downloadRef,
  getSortedQuestions,
  showToast,
}) => {
  try {
    const results = await searchQuestions({
      book: downloadRef.selectedBook || null,
      chapter: downloadRef.selectedChapter || null,
      verseStart: downloadRef.verseStart || null,
      verseEnd: downloadRef.verseEnd || null,
      themeArr: [],
    });

    if (results.length === 0) {
      showToast('No questions match the selected filters', 'info');

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
    link.setAttribute('download', 'filtered_questions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.log(error)
    showToast('Download failed', 'error');
  }
};


export {
  downloadAllCSV,
  downloadFilteredCSV,
};