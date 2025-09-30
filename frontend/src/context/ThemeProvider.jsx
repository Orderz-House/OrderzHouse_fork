import React, { useState, useEffect } from 'react';
import { ThemeContext } from './useTheme'; // <-- Import the context from the new file

// Helper function to get the initial theme
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';
  const storedPrefs = window.localStorage.getItem('color-theme');
  if (storedPrefs) return storedPrefs;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// This file now ONLY exports the ThemeProvider component.
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('color-theme', theme);
  }, [theme]);

  // The value now includes the theme state and the setter function
  const value = { theme, setTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
