import { createContext, useContext } from 'react';

// 1. Create and export the context object. This file now exports NO components.
export const ThemeContext = createContext(null);

// 2. Create and export a custom hook for easy consumption of the context.
// This is a best practice. Instead of importing both useContext and ThemeContext
// in every component, you'll just import useTheme().
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
