import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BibleReferenceSelector from './BibleReferenceSelector';

describe('BibleReferenceSelector', () => {
  const mockBibleReference = {
    book: '',
    chapter: '',
    verseStart: '',
    verseEnd: '',
    availableChapters: [],
    totalChapters: 0,
    availableVerses: [],
    updateReference: vi.fn(),
  };

  it('renders correctly in grid layout without throwing', () => {
    expect(() => {
      render(
        <BibleReferenceSelector
          bibleReference={mockBibleReference}
          layout="grid"
        />
      );
    }).not.toThrow();
  });
});
