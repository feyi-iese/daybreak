import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export type ThemePreference = 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'daybreak:theme';

function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined' || !window.localStorage) {
    return getSystemTheme();
  }
  try {
    const val = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (val === 'light' || val === 'dark') {
      return val;
    }
  } catch {
    // Ignore storage exceptions
  }
  return getSystemTheme();
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  try {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    return mql.matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function useTheme(): {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: Dispatch<SetStateAction<ThemePreference>>;
} {
  const [preference, setPreference] = useState<ThemePreference>(() => getStoredPreference());

  const resolvedTheme: ResolvedTheme = preference;

  // Toggle class and persist preference
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    try {
      document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    } catch {
      // Ignore DOM/classlist exceptions
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, preference);
      } catch {
        // Ignore storage exceptions
      }
    }
  }, [preference, resolvedTheme]);

  return {
    preference,
    resolvedTheme,
    setPreference,
  };
}
