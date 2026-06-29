import 'fake-indexeddb/auto';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { db } from '../../db/db';
import { saveProfile } from '../../db/profile';
import App from '../../App';
import { THEME_STORAGE_KEY } from '../../lib/useTheme';
import { vi } from 'vitest';

// We want to stub global matchMedia
let matchMediaMatches = false;

const mockMatchMedia = (query: string) => {
  return {
    matches: matchMediaMatches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
};

describe('Theme Toggle Integration', () => {
  beforeEach(async () => {
    // Clear databases
    await db.profile.clear();
    await db.weighIns.clear();

    // Clear localStorage
    localStorage.clear();

    // Reset document element dark class
    document.documentElement.classList.remove('dark');

    // Reset matchMedia stub state
    matchMediaMatches = false;
    vi.stubGlobal('matchMedia', mockMatchMedia);

    // Seed the mock profile so that App bypasses onboarding and renders MainHub
    await saveProfile({
      gender: 'female',
      heightCm: 170,
      startingWeightKg: 90,
      targetWeightKg: 70,
      weightUnit: 'kg',
      heightUnit: 'cm',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('defaults to light theme when system-preferred is light and no stored theme exists', async () => {
    matchMediaMatches = false; // System is light

    render(<App />);

    // Wait for the theme radiogroup to render
    const lightRadio = await screen.findByRole('radio', { name: /light/i });
    expect(lightRadio).toBeInTheDocument();
    expect(lightRadio).toHaveAttribute('aria-checked', 'true');

    const darkRadio = screen.getByRole('radio', { name: /dark/i });
    expect(darkRadio).toBeInTheDocument();
    expect(darkRadio).toHaveAttribute('aria-checked', 'false');

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('defaults to dark theme when system-preferred is dark and no stored theme exists', async () => {
    matchMediaMatches = true; // System is dark

    render(<App />);

    // Wait for the theme radiogroup to render
    const darkRadio = await screen.findByRole('radio', { name: /dark/i });
    expect(darkRadio).toBeInTheDocument();
    expect(darkRadio).toHaveAttribute('aria-checked', 'true');

    const lightRadio = screen.getByRole('radio', { name: /light/i });
    expect(lightRadio).toBeInTheDocument();
    expect(lightRadio).toHaveAttribute('aria-checked', 'false');

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles to Dark and persists to localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);

    const darkRadio = await screen.findByRole('radio', { name: /dark/i });
    const lightRadio = screen.getByRole('radio', { name: /light/i });

    expect(darkRadio).toBeInTheDocument();
    expect(darkRadio).toHaveAttribute('aria-checked', 'false');

    await user.click(darkRadio);

    expect(darkRadio).toHaveAttribute('aria-checked', 'true');
    expect(lightRadio).toHaveAttribute('aria-checked', 'false');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('loads with dark mode active when theme is stored as dark', async () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    render(<App />);

    const darkRadio = await screen.findByRole('radio', { name: /dark/i });
    expect(darkRadio).toBeInTheDocument();
    expect(darkRadio).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
