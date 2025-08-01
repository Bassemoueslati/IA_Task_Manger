import React, { useEffect, useState } from 'react';

const ThemeSwitcher = () => {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      className="fixed top-4 right-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded shadow transition-all duration-300"
      onClick={() => setDark(d => !d)}
    >
      {dark ? '☀️ Mode clair' : '🌙 Mode sombre'}
    </button>
  );
};

export default ThemeSwitcher;
