import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuestionTable from './QuestionTable';

const mockQuestions = [
    {
        _id: 'q1',
        book: 'Genesis',
        chapter: '1',
        verseStart: '1',
        verseEnd: '5',
        theme: 'Creation',
        question: 'How does creation display God’s power?'
    },
    {
        _id: 'q2',
        book: 'Genesis',
        chapter: '1',
        verseStart: '26',
        verseEnd: '28',
        theme: 'Humanity',
        question: 'What does it mean to be made in the image of God?'
    }
];

describe('QuestionTable Component', () => {
    it('renders empty state when questions array is empty', () => {
        render(<QuestionTable questions={[]} />);
        expect(screen.getByText('No questions found')).toBeInTheDocument();
    });

    it('renders question rows and selection stats correctly', () => {
        render(
            <QuestionTable
                questions={mockQuestions}
                selectedIds={['q1']}
                showActions={true}
                onSelectionChange={vi.fn()}
            />
        );

        expect(screen.getByText('Genesis 1:1-5')).toBeInTheDocument();
        expect(screen.getByText('How does creation display God’s power?')).toBeInTheDocument();
        expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    it('triggers selection change when row or checkbox is clicked', () => {
        const handleSelectionChange = vi.fn();
        render(
            <QuestionTable
                questions={mockQuestions}
                selectedIds={[]}
                showActions={true}
                onSelectionChange={handleSelectionChange}
            />
        );

        const rows = screen.getAllByRole('row');
        // Index 0 is header row, Index 1 is first question row
        fireEvent.click(rows[1]);

        expect(handleSelectionChange).toHaveBeenCalledWith(['q1'], true);
    });

    it('triggers selection change when Space or Enter key is pressed on row', () => {
        const handleSelectionChange = vi.fn();
        render(
            <QuestionTable
                questions={mockQuestions}
                selectedIds={[]}
                showActions={true}
                onSelectionChange={handleSelectionChange}
            />
        );

        const rows = screen.getAllByRole('row');
        fireEvent.keyDown(rows[1], { key: 'Enter' });
        expect(handleSelectionChange).toHaveBeenCalledWith(['q1'], true);

        fireEvent.keyDown(rows[1], { key: ' ' });
        expect(handleSelectionChange).toHaveBeenCalledWith(['q1'], true);
    });

    it('correctly sets indeterminate state on select-all checkbox when partially selected', () => {
        render(
            <QuestionTable
                questions={mockQuestions}
                selectedIds={['q1']}
                showActions={true}
                onSelectionChange={vi.fn()}
            />
        );

        const selectAllCheckbox = screen.getByLabelText('Select all questions');
        expect(selectAllCheckbox.indeterminate).toBe(true);
        expect(selectAllCheckbox.checked).toBe(false);
    });

    it('sets select-all checkbox as checked when all items are selected', () => {
        render(
            <QuestionTable
                questions={mockQuestions}
                selectedIds={['q1', 'q2']}
                showActions={true}
                onSelectionChange={vi.fn()}
            />
        );

        const selectAllCheckbox = screen.getByLabelText('Select all questions');
        expect(selectAllCheckbox.checked).toBe(true);
        expect(selectAllCheckbox.indeterminate).toBe(false);
    });

    it('triggers bulk select and deselect buttons', () => {
        const handleSelectionChange = vi.fn();
        render(
            <QuestionTable
                questions={mockQuestions}
                selectedIds={['q1']}
                showActions={true}
                onSelectionChange={handleSelectionChange}
            />
        );

        const selectAllBtn = screen.getByTitle('Select all questions');
        fireEvent.click(selectAllBtn);
        expect(handleSelectionChange).toHaveBeenCalledWith(['q1', 'q2'], true);

        const deselectAllBtn = screen.getByTitle('Deselect all questions');
        fireEvent.click(deselectAllBtn);
        expect(handleSelectionChange).toHaveBeenCalledWith(['q1', 'q2'], false);
    });
});
