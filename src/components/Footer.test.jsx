import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from './Footer';

describe('Footer', () => {
  it('renders correctly', () => {
    render(<Footer onHelpClick={() => {}} />);
    expect(screen.getByText(new RegExp(new Date().getFullYear().toString()))).toBeInTheDocument();
    expect(screen.getByLabelText('View GitHub Repo')).toBeInTheDocument();
    expect(screen.getByLabelText('Help & Instructions')).toBeInTheDocument();
  });

  it('calls onHelpClick when help button is clicked', () => {
    const onHelpClick = vi.fn();
    render(<Footer onHelpClick={onHelpClick} />);
    const helpButton = screen.getByLabelText('Help & Instructions');
    fireEvent.click(helpButton);
    expect(onHelpClick).toHaveBeenCalledTimes(1);
  });
});
