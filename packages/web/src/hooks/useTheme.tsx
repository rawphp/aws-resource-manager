import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export const THEMES = ['light', 'dark', 'cyberpunk'] as const;
export type Theme = typeof THEMES[number];

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
});

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme');
    if (stored && THEMES.includes(stored as Theme)) {
      return stored as Theme;
    }
  } catch {
    // localStorage unavailable
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch {
      // localStorage unavailable
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
