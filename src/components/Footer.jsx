import { CircleHelp } from 'lucide-react';

const GithubIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Footer({ onHelpClick }) {
  return (
 <footer
  className="
    fixed bottom-0 left-0 w-full
    bg-app-surface/60
    backdrop-blur-md
    border-t-2 border-app-border
    shadow-lg
    flex justify-center items-center gap-6
    py-3 px-6
    z-50
  "
>
  <p className="text-sm font-medium text-app-text">
    © {new Date().getFullYear()} allemandi
  </p>

  <a
  href="https://github.com/allemandi/passage-prep"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="View GitHub Repo"
  className="
    p-1.5 rounded-xl
    focus:outline-none focus:ring-4 focus:ring-primary-400/20
    hover:bg-primary-50 dark:hover:bg-primary-900/30
    transition-all duration-200
  "
>
  <GithubIcon
    size={20}
    className="text-primary-600 dark:text-primary-400"
  />
</a>
  <button
    onClick={onHelpClick}
    aria-label="Help & Instructions"
    className="
      text-primary-600 dark:text-primary-400
      hover:text-primary-700 dark:hover:text-primary-300
      p-1.5 rounded-xl
      hover:bg-primary-50 dark:hover:bg-primary-900/30
      transition-all duration-200
      focus:outline-none focus:ring-4 focus:ring-primary-400/20
    "
  >
    <CircleHelp size={20} />
  </button>
</footer>
  );
}
