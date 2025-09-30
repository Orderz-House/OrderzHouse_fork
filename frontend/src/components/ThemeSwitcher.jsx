import React, { useContext } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react'; // Icons for themes
import { ThemeContext } from '../context/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const handleThemeChange = (newTheme) => {
    if (newTheme === 'system') {
      // If system is chosen, remove local storage preference
      localStorage.removeItem('color-theme');
      // and check the system preference again
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      setTheme(userMedia.matches ? 'dark' : 'light');
    } else {
      setTheme(newTheme);
    }
  };

  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
      <button
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-md ${theme === 'light' ? 'bg-blue-500 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        title="Light Mode"
      >
        <Sun size={20} />
      </button>
      <button
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-md ${theme === 'dark' ? 'bg-blue-500 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        title="Dark Mode"
      >
        <Moon size={20} />
      </button>
      {/* This is a simplified system button. It just sets the theme based on current system preference. */}
      <button
        onClick={() => handleThemeChange('system')}
        className="p-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        title="System Preference"
      >
        <Monitor size={20} />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
