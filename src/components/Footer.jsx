import { HelpCircle } from 'lucide-react';

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
  <img
    src="./assets/github-mark-white.svg"
    alt="GitHub Logo"
    width={20}
    height={20}
    className="
      filter
      transition-all duration-200
    "
    style={{
      filter: 'invert(32%) sepia(87%) saturate(3189%) hue-rotate(186deg) brightness(88%) contrast(89%)',
    }}
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
    <HelpCircle size={20} />
  </button>
</footer>
  );
}
