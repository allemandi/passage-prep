import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Download from './index';
import { ToastProvider } from '../../ToastMessage/Toast';

// Mocking URL.createObjectURL and Blob since JSDOM doesn't support them fully
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

const renderWithProviders = (ui) => {
    return render(<ToastProvider>{ui}</ToastProvider>);
};

describe('Admin Download Component', () => {
    it('calls downloadAllCSV and triggers a download', async () => {
        const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

        renderWithProviders(<Download />);

        const downloadAllButton = screen.getByRole('button', { name: /Download All/i });
        fireEvent.click(downloadAllButton);

        await waitFor(() => {
            expect(clickSpy).toHaveBeenCalled();
        });

        clickSpy.mockRestore();
    });

    it('download filtered button is disabled until book is selected', () => {
        renderWithProviders(<Download />);
        const downloadFilteredButton = screen.getByRole('button', { name: /Download Filtered/i });
        expect(downloadFilteredButton).toBeDisabled();
    });
});
