import { HelpCircle } from 'lucide-react';

export default function Footer({ onHelpClick }) {
  return (
   <footer
  className="
    fixed bottom-0 left-0 w-full
    bg-white/50 dark:bg-gray-900/60
    backdrop-blur-md
    border-t border-gray-200 dark:border-gray-800
    shadow-sm
    flex justify-center items-center gap-6
    py-4 px-6
    z-50
  "
>
  <p className="text-sm text-gray-900 dark:text-gray-400">
    © {new Date().getFullYear()} allemandi
  </p>

  <a
  href="https://github.com/allemandi/passage-prep"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="View GitHub Repo"
  className="
    p-1 rounded-full
    focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-300
    hover:bg-gray-100 dark:hover:bg-neutral-700
  "
>
  <img
    src="./assets/github-mark-white.svg"
    alt="GitHub Logo"
    width={20}
    height={20}
    className="
      filter
      brightness-0 text-sky-600 dark:text-sky-400
      hover:brightness-50 dark:hover:brightness-90
    "
    style={{
      filter: 'invert(32%) sepia(87%) saturate(3189%) hue-rotate(186deg) brightness(88%) contrast(89%)',
      transition: 'filter 0.2s ease',
    }}
  />
</a>
  <button
    onClick={onHelpClick}
    aria-label="Help & Instructions"
    className="
      text-sky-600 dark:text-sky-400
      hover:text-sky-900 dark:hover:text-white
      p-1 rounded-full
      focus:outline-none focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-300
    "
  >
    <HelpCircle size={20} />
  </button>
</footer>
  );
}
