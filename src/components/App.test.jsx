import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App navigation', () => {
    it('switches tabs correctly', async () => {
        render(<App />);

        // Wait for initial data loading to complete
        await waitFor(() => {
            expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
        }, { timeout: 2000 });

        // Initial state should be Search & Format
        expect(screen.getByRole('tab', { name: /Search & Format/i })).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText(/Bible References/i)).toBeInTheDocument();

        // Switch to Contribute
        const contributeTab = screen.getByRole('tab', { name: /Contribute/i });
        fireEvent.click(contributeTab);

        expect(contributeTab).toHaveAttribute('aria-selected', 'true');
        // Check for text that is unique to Contribute tab
        expect(screen.getByText(/Submit Question/i)).toBeInTheDocument();

        // Switch to Admin
        const adminTab = screen.getByRole('tab', { name: /Admin/i });
        fireEvent.click(adminTab);

        expect(adminTab).toHaveAttribute('aria-selected', 'true');
        // Since we're not logged in, it should show the login form
        expect(screen.getByText(/Username/i)).toBeInTheDocument();
        expect(screen.getByText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    });
});
