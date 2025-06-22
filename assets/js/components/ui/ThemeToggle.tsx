import React, { useEffect, useState } from 'react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');

    // Only use dark mode if explicitly saved as 'dark'
    // This ensures we default to light mode
    const shouldUseDark = savedTheme === 'dark';
    setIsDark(shouldUseDark);

    // Apply theme to document
    document.documentElement.classList.toggle('dark', shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    // Save preference
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');

    // Apply to document
    document.documentElement.classList.toggle('dark', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle p-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200 dark:border-gray-600 dark:hover:border-gray-500 ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      data-testid='theme-toggle'
    >
      {isDark ? (
        // Sun icon for light mode
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='text-yellow-500'
        >
          <circle cx='12' cy='12' r='5' />
          <path d='M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' />
        </svg>
      ) : (
        // Moon icon for dark mode
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='text-gray-700 dark:text-gray-300'
        >
          <path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z' />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
