import { createContext, useContext, useEffect, useState } from 'react';
import themeColors from '../data/theme.json';

const ThemeContext = createContext();

// Map camelCase keys from theme.json to CSS variable names
const colorKeyToVar = {
  colorPrimary: '--color-primary',
  colorPrimaryLight: '--color-primary-light',
  colorBgMain: '--color-bg-main',
  colorSurface: '--color-surface',
  colorSurfaceHover: '--color-surface-hover',
  colorBorder: '--color-border',
  colorTextPrimary: '--color-text-primary',
  colorTextSecondary: '--color-text-secondary',
  colorTextMuted: '--color-text-muted',
  sidebarBg: '--sidebar-bg',
  sidebarAccent: '--sidebar-accent',
};

function applyThemeColors(theme) {
  const colors = themeColors[theme];
  if (!colors) return;

  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = colorKeyToVar[key];
    if (cssVar) {
      root.style.setProperty(cssVar, value);
    }
  });
}

function clearInlineThemeColors() {
  const root = document.documentElement;
  Object.values(colorKeyToVar).forEach((cssVar) => {
    root.style.removeProperty(cssVar);
  });
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sims-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sims-theme', theme);

    // Clear previous inline overrides, then apply new ones from theme.json
    clearInlineThemeColors();
    applyThemeColors(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};