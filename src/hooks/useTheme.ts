import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';
export type AccentColor = 'orange' | 'blue';

export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [accentColor, setAccentColor] = useState<AccentColor>('orange');

  useEffect(() => {
    const savedMode = localStorage.getItem('obralis_theme_mode') as ThemeMode;
    const savedAccent = localStorage.getItem('obralis_accent_color') as AccentColor;

    if (savedMode) {
      setThemeMode(savedMode);
      applyThemeMode(savedMode);
    }

    if (savedAccent) {
      setAccentColor(savedAccent);
      applyAccentColor(savedAccent);
    }
  }, []);

  const applyThemeMode = (mode: ThemeMode) => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const applyAccentColor = (color: AccentColor) => {
    const root = document.documentElement;
    if (color === 'blue') {
      root.style.setProperty('--primary', '217 91% 60%');
      root.style.setProperty('--ring', '217 91% 60%');
    } else {
      root.style.setProperty('--primary', '25 95% 53%');
      root.style.setProperty('--ring', '25 95% 53%');
    }
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    applyThemeMode(newMode);
    localStorage.setItem('obralis_theme_mode', newMode);
  };

  const changeAccent = (color: AccentColor) => {
    setAccentColor(color);
    applyAccentColor(color);
    localStorage.setItem('obralis_accent_color', color);
  };

  return { themeMode, accentColor, toggleTheme, changeAccent };
};
