import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScriptureCombobox from './ScriptureCombobox';

describe('ScriptureCombobox Component', () => {
    const defaultProps = {
        id: 'test-combobox',
        label: 'Book',
        options: ['Genesis', 'Exodus', 'Leviticus'],
        value: '',
        onChange: vi.fn(),
    };

    it('renders label with proper htmlFor and label id', () => {
        render(<ScriptureCombobox {...defaultProps} />);

        const labelElement = screen.getByText('Book');
        expect(labelElement).toBeInTheDocument();
        expect(labelElement).toHaveAttribute('id', 'test-combobox-label');
        expect(labelElement).toHaveAttribute('for', 'test-combobox');
    });

    it('uses aria-labelledby when ariaLabel matches label or is omitted', () => {
        render(<ScriptureCombobox {...defaultProps} />);

        const inputElement = screen.getByRole('combobox');
        expect(inputElement).toHaveAttribute('aria-labelledby', 'test-combobox-label');
        expect(inputElement).not.toHaveAttribute('aria-label');
    });

    it('uses custom aria-label when ariaLabel differs from label', () => {
        render(<ScriptureCombobox {...defaultProps} ariaLabel="Passage 1: Book" />);

        const inputElement = screen.getByRole('combobox');
        expect(inputElement).toHaveAttribute('aria-label', 'Passage 1: Book');
        expect(inputElement).not.toHaveAttribute('aria-labelledby');
    });

    it('displays error message and sets aria-invalid when error prop is provided', () => {
        render(<ScriptureCombobox {...defaultProps} error="Book is required" />);

        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent('Book is required');
    });

    it('filters end verse options based on start verse value', () => {
        const verseProps = {
            id: 'verse-end',
            label: 'End Verse',
            options: ['1', '2', '3', '4', '5'],
            isEndVerse: true,
            startVerseValue: '3',
            onChange: vi.fn(),
        };

        render(<ScriptureCombobox {...verseProps} />);
        const combobox = screen.getByRole('combobox');
        fireEvent.focus(combobox);
        fireEvent.keyDown(combobox, { key: 'ArrowDown' });

        // Options 1 and 2 should be filtered out
        expect(screen.queryByText('1')).not.toBeInTheDocument();
        expect(screen.queryByText('2')).not.toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });
});
