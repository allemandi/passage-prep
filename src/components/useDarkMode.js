import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [mode, setMode] = useState(null);
  useEffect(() => {
    let saved = localStorage.getItem('themeMode');
    if (saved !== 'light' && saved !== 'dark') {
      saved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setMode(saved);
  }, []);
  useEffect(() => {
    if (!mode) return;

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
