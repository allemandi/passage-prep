import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RequestForm from './RequestForm';
import { ToastProvider } from './ToastMessage/Toast';

const renderWithProviders = (ui) => {
    return render(<ToastProvider>{ui}</ToastProvider>);
};

describe('RequestForm', () => {
    it('populates Bible books correctly', async () => {
        renderWithProviders(<RequestForm onStudyGenerated={() => {}} isLoading={false} />);

        const bookSelect = screen.getAllByLabelText('Book')[0];
        fireEvent.change(bookSelect, { target: { value: 'Genesis' } });

        const option = await screen.findByText('Genesis', { selector: '.react-select__option' });
        expect(option).toBeInTheDocument();
    });

    it('performs search and displays results', async () => {
        renderWithProviders(<RequestForm onStudyGenerated={() => {}} isLoading={false} />);

        const bookSelect = screen.getAllByLabelText('Book')[0];
        fireEvent.change(bookSelect, { target: { value: 'Genesis' } });
        const option = await screen.findByText('Genesis', { selector: '.react-select__option' });
        fireEvent.click(option);

        const searchButton = screen.getByRole('button', { name: /Search/i });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText('Question about Genesis')).toBeInTheDocument();
        });
    });

    it('clears form when Clear Form button is clicked', async () => {
        renderWithProviders(<RequestForm onStudyGenerated={() => {}} isLoading={false} />);

        // Set a book so search doesn't fail
        const bookSelect = screen.getAllByLabelText('Book')[0];
        fireEvent.change(bookSelect, { target: { value: 'Genesis' } });
        const option = await screen.findByText('Genesis', { selector: '.react-select__option' });
        fireEvent.click(option);

        // Click Search to show results
        const searchButton = screen.getByRole('button', { name: /^Search$/i });
        fireEvent.click(searchButton);
        await waitFor(() => {
            expect(screen.getByText(/Search Results/i)).toBeInTheDocument();
        });

        // Click Clear Form
        const clearFormButton = screen.getByTitle(/Clear form/i);
        fireEvent.click(clearFormButton);

        // Verify search results are gone
        expect(screen.queryByText(/Search Results/i)).not.toBeInTheDocument();
    });
});
