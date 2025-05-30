import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [mode, setMode] = useState(null); // Start with null to avoid SSR hydration mismatch

  // On mount, read saved mode or system preference, then set it
  useEffect(() => {
    let saved = localStorage.getItem('themeMode');
    if (saved !== 'light' && saved !== 'dark') {
      saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setMode(saved);
  }, []);

  // When mode changes, update class on <html> and save preference
  useEffect(() => {
    if (!mode) return; // Don't run until mode is set

    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  return [mode, setMode];
}
