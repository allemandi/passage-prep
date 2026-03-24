import themes from '../data/themes.json';
import bibleContext from '../data/bibleContext.json';

const API_BASE = import.meta.env.MODE === 'production' ? '/.netlify/functions' : '/api';

/**
 * Standardized API client for PassagePrep
 */
const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}/${endpoint}`;
    const defaultHeaders = { 'Accept': 'application/json' };

    if (options.body && !(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try { errorData = JSON.parse(errorText); } catch { errorData = { error: errorText }; }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error(`API Request Error [${endpoint}]:`, error);
      throw error;
    }
  },

  get: (endpoint, options) => apiClient.request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => apiClient.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
};

export let searchQuestionsCache = {};
let allQuestionsCache = null;

export const clearSearchCache = () => {
  searchQuestionsCache = {};
};

export const getBooks = () => bibleContext;

export const saveQuestion = async (theme, question, reference) => {
  if (!theme || !question || !reference?.book || !reference?.chapter || !reference?.verseStart) {
    throw new Error("Missing required fields: theme, question, book, chapter, or verseStart");
  }

  const newQuestion = {
    theme,
    question,
    book: reference.book,
    chapter: reference.chapter,
    verseStart: reference.verseStart,
    verseEnd: reference.verseEnd || reference.verseStart,
  };

  const response = await apiClient.post('save-question', { newData: newQuestion });
  clearSearchCache();
  return response;
};

export const processForm = async (formData) => {
  if (!Array.isArray(bibleContext)) throw new Error("Failed to load book data");

  const { refArr, themeArr } = formData;
  const refArrFiltered = [...new Set(refArr)].filter(n => n);
  const themeArrFiltered = themeArr.length === themes.length ? [] : [...new Set(themeArr)].filter(n => n);

  const extractBookFromReference = (ref) => {
    const match = ref.match(/^((?:\d\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)/i);
    return match ? match[1].trim() : null;
  };

  const orderedBooks = [...new Set(refArrFiltered.map(extractBookFromReference).filter(Boolean))];

  const scriptureRefs = refArrFiltered.map(ref => {
    const match = ref.match(/^((?:\d\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s*(\d+)?(?::(\d+)(?:-(\d+))?)?/i);
    if (!match) return null;
    const [, book, chapter, verseStart, verseEnd] = match;
    return {
      book: book.toLowerCase().trim(),
      chapter: chapter ? parseInt(chapter, 10) : null,
      verseStart: verseStart ? parseInt(verseStart, 10) : null,
      verseEnd: verseEnd ? parseInt(verseEnd, 10) : null
    };
  }).filter(Boolean);

  let contextArr = bibleContext
    .filter(i => scriptureRefs.some(ref => i.book.toLowerCase().includes(ref.book)))
    .map(i => `${i.book} is about ${i.context} The author is ${i.author}.`);

  contextArr.sort((a, b) => {
    const getBookFromContext = (s) => orderedBooks.find(name => s.includes(name));
    const bookA = getBookFromContext(a);
    const bookB = getBookFromContext(b);
    if (bookA && bookB) return orderedBooks.indexOf(bookA) - orderedBooks.indexOf(bookB);
    return bookA ? -1 : bookB ? 1 : 0;
  });

  return { refArr: refArrFiltered, themeArr: themeArrFiltered, contextArr };
};

export const searchQuestions = async (payload) => {
  const cacheKey = JSON.stringify(payload);
  if (searchQuestionsCache[cacheKey]) return searchQuestionsCache[cacheKey];

  const questions = await apiClient.post('search-questions', payload);
  searchQuestionsCache[cacheKey] = questions;
  return questions;
};

export const deleteQuestions = async (questionIds) => {
  const response = await apiClient.post('delete-questions', { questionIds });
  clearSearchCache();
  return response;
};

export const updateQuestion = async (questionId, updatedData) => {
  const response = await apiClient.post('update-question', { questionId, updatedData });
  clearSearchCache();
  return response;
};

export const login = (username, password) => apiClient.post('login', { username, password });

export const fetchAllQuestions = async () => {
  if (allQuestionsCache) return allQuestionsCache;
  const questions = await apiClient.get('questions');
  allQuestionsCache = questions;
  return questions;
};

export const fetchUnapprovedQuestions = async () => {
  try {
    return await apiClient.get('unapproved-questions');
  } catch (error) {
    if (import.meta.env.MODE !== 'production') {
      const all = await fetchAllQuestions();
      return all.filter(q => !q.isApproved);
    }
    throw error;
  }
};

export const approveQuestions = async (questionIds) => {
  const response = await apiClient.post('approve-questions', { questionIds });
  clearSearchCache();
  return response;
};
