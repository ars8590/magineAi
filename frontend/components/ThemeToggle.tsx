'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);
    updateTheme(initialTheme);
    setMounted(true);
  }, []);

  const updateTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    updateTheme(newTheme);
  };

  if (!mounted) {
    // Return a placeholder to prevent hydration mismatch
    return (
      <button
        className="flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main-light dark:text-white transition-colors"
        aria-label="Toggle theme"
        disabled
      >
        <span className="material-symbols-outlined text-xl">dark_mode</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-text-main-light dark:text-white transition-colors"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <span className="material-symbols-outlined text-xl">dark_mode</span>
      ) : (
        <span className="material-symbols-outlined text-xl">light_mode</span>
      )}
    </button>
  );
}

