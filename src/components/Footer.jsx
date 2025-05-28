import React from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export default function Footer({ onHelpClick }) {
    return (
        <footer
            className="fixed bottom-0 left-0 w-full py-1 px-4 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 flex justify-center items-center gap-6 z-50"
        >
            <p className="text-sm text-neutral-500 dark:text-gray-400">
                © {new Date().getFullYear()} allemandi
            </p>

            <a
                href="https://github.com/allemandi/passage-prep"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View GitHub Repo"
                className="text-neutral-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 p-1 rounded-full"
            >
                <GitHubIcon fontSize="small" />
            </a>

            <button
                onClick={onHelpClick}
                aria-label="Help & Instructions"
                className="text-neutral-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 p-1 rounded-full"
            >
                <HelpOutlineIcon fontSize="small" />
            </button>
        </footer>
    );
}