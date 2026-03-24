import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Upload from './Upload';
import { ToastProvider } from '../ToastMessage/Toast';

// Mock dependencies
vi.mock('../../utils/upload', () => ({
  bulkUploadQuestions: vi.fn().mockImplementation(async ({ setUploadResults, setIsUploading, showToast }) => {
    setIsUploading(true);
    // Use a small delay to ensure React processes the state update
    await new Promise(resolve => setTimeout(resolve, 0));
    setUploadResults({
      totalQuestions: 1,
      successful: 1,
      failed: 0,
      errors: []
    });
    showToast('Uploaded', 'success');
    setIsUploading(false);
  })
}));

const renderWithProviders = (ui) => {
  return render(<ToastProvider>{ui}</ToastProvider>);
};

describe('Admin Upload Component', () => {
  it('renders correctly initial state', () => {
    renderWithProviders(<Upload />);
    expect(screen.getByText('Bulk Upload Questions')).toBeInTheDocument();
    expect(screen.getByText('Select CSV File')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Questions/i })).toBeDisabled();
  });

  it('handles file selection', async () => {
    renderWithProviders(<Upload />);
    const file = new File(['theme,question,book,chapter,verseStart,verseEnd,isApproved\nFaith,Test?,Genesis,1,1,1,true'], 'test.csv', { type: 'text/csv' });

    // Select the hidden input by its ID
    const input = screen.getByLabelText(/Select CSV file/i, { selector: 'input' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('test.csv')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload Questions/i })).not.toBeDisabled();
  });

  it('clears selection when X is clicked', () => {
    renderWithProviders(<Upload />);
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/Select CSV file/i, { selector: 'input' });

    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByText('test.csv')).toBeInTheDocument();

    const clearButton = screen.getByLabelText('Clear selection');
    fireEvent.click(clearButton);

    expect(screen.queryByText('test.csv')).not.toBeInTheDocument();
    expect(screen.getByText('Select CSV File')).toBeInTheDocument();
  });

  it('shows upload results after successful upload', async () => {
    renderWithProviders(<Upload />);
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/Select CSV file/i, { selector: 'input' });

    fireEvent.change(input, { target: { files: [file] } });

    const uploadButton = screen.getByRole('button', { name: /Upload Questions/i });
    fireEvent.click(uploadButton);

    // Look for the results panel title which should appear after upload
    await waitFor(() => {
      expect(screen.getByText('Upload Results')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText('Successfully uploaded: 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset & Upload Another/i })).toBeInTheDocument();
  });

  it('resets results and interface when Reset button is clicked', async () => {
    renderWithProviders(<Upload />);
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/Select CSV file/i, { selector: 'input' });

    fireEvent.change(input, { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: /Upload Questions/i }));

    await waitFor(() => {
      expect(screen.getByText('Upload Results')).toBeInTheDocument();
    }, { timeout: 3000 });

    const resetButton = screen.getByRole('button', { name: /Reset & Upload Another/i });
    fireEvent.click(resetButton);

    expect(screen.queryByText('Upload Results')).not.toBeInTheDocument();
    expect(screen.getByText('Select CSV File')).toBeInTheDocument();
  });
});
