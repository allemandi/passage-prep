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
        const adminButton = screen.getByRole('button', { name: /Enter admin mode/i });
        fireEvent.click(adminButton);

        expect(adminButton).toHaveAttribute('title', 'Exit admin mode');
        // Since we're not logged in, it should show the login form
        // Tab index for Admin is 2.
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Enter your username/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
        });
    });
});
