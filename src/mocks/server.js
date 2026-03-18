import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/api/questions', () => {
    return HttpResponse.json([
      { _id: '1', theme: 'Faith', question: 'What is faith?', book: 'Hebrews', chapter: 11, verseStart: 1, verseEnd: 1 },
    ]);
  }),
  http.post('*/api/search-questions', async ({ request }) => {
    const payload = await request.json();
    return HttpResponse.json([
      { _id: '1', theme: 'Faith', question: `Question about ${payload.book}`, book: payload.book, chapter: payload.chapter, verseStart: payload.verseStart },
    ]);
  }),
];

export const server = setupServer(...handlers);
