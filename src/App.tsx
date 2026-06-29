import { useEffect, useState, type ReactNode } from 'react';
import { useTheme, type ThemePreference } from './lib/useTheme';
import lightModeIcon from './assets/light-mode.png';
import darkModeIcon from './assets/dark-mode.png';
import type { Profile } from './db/db';
import { getProfile } from './db/profile';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import MainHub from './components/MainHub';
import Logo from './components/Logo';


function Shell({
  screen,
  children,
  hideHeader,
  themePreference,
  resolvedTheme,
  onThemeChange,
}: {
  screen: string;
  children: ReactNode;
  hideHeader?: boolean;
  themePreference: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  onThemeChange: (next: ThemePreference) => void;
}) {
  return (
    <div className="app-shell">
      <div className="sun-glow animate-float" aria-hidden="true" />
      <div className="app-main">
        {!hideHeader && (
          <header className="mb-8 grid grid-cols-[1fr_auto] justify-between items-center gap-3">
            {/* <span aria-hidden="true" /> */}
            <span className="wordmark ">
              <Logo className="text-primary-600 h-12 w-12" />
              Daybreak
            </span>
            <div className="">
              <ThemePreferenceControl
                themePreference={themePreference}
                resolvedTheme={resolvedTheme}
                onThemeChange={onThemeChange}
              />
            </div>
          </header>
        )}
        <main key={screen} className="animate-fade-rise">
          {children}
        </main>
      </div>
    </div>
  );
}

interface ThemePreferenceControlProps {
  themePreference: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  onThemeChange: (next: ThemePreference) => void;
}

function ThemePreferenceControl({
  themePreference,
  onThemeChange,
}: ThemePreferenceControlProps) {
  return (
    <div className="segmented rounded-full p-1 bg-cream-200 flex gap-3 items-center" role="radiogroup" aria-label="Theme">
      <button
        type="button"
        role="radio"
        aria-checked={themePreference === 'light'}
        aria-label="Light"
        onClick={() => onThemeChange('light')}
        className={
          themePreference === 'light'
            ? 'bg-cream-50 dark:bg-cream-200/90 shadow-sm rounded-full scale-105 transition-all duration-300'
            : 'opacity-40 hover:opacity-75 scale-95 transition-all duration-300'
        }
      >
        <img
          src={lightModeIcon}
          alt="Light"
          className="h-7 w-7 object-contain"
        />
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={themePreference === 'dark'}
        aria-label="Dark"
        onClick={() => onThemeChange('dark')}
        className={
          themePreference === 'dark'
            ? 'bg-cream-50 dark:bg-cream-200/90 shadow-sm rounded-full scale-105 transition-all duration-300'
            : 'opacity-40 hover:opacity-75 scale-95 transition-all duration-300'
        }
      >
        <img
          src={darkModeIcon}
          alt="Dark"
          className="h-7 w-7 object-contain"
        />
      </button>
    </div>
  );
}

export default function App() {
  const { preference, resolvedTheme, setPreference } = useTheme();
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashOpacity, setSplashOpacity] = useState(1);
  useEffect(() => {
    let active = true;
    void getProfile().then((p) => {
      if (!active) return;
      setProfile(p);
      setLoading(false);
      if (!p) {
        setShowSplash(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!showSplash) return;

    // Start fading out at 2.0 seconds
    const fadeTimer = setTimeout(() => {
      setSplashOpacity(0);
    }, 2500);

    // Unmount splash screen at 3.0 seconds
    const unmountTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [showSplash]);

  function handleComplete(saved: Profile) {
    setProfile(saved);
    setEditing(false);
  }

  if (loading) return null;

  if (profile && !editing) {
    return (
      <Shell
        screen="hub"
        themePreference={preference}
        resolvedTheme={resolvedTheme}
        onThemeChange={setPreference}
      >
        <MainHub profile={profile} onEdit={() => setEditing(true)} />
      </Shell>
    );
  }

  return (
    <Shell
      screen="onboarding"
      hideHeader={showSplash}
      themePreference={preference}
      resolvedTheme={resolvedTheme}
      onThemeChange={setPreference}
    >
      <OnboardingFlow
        mode={profile ? 'edit' : 'create'}
        initial={profile}
        onComplete={handleComplete}
      />
      {showSplash && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream-100 transition-opacity duration-1000 ease-out"
          style={{ opacity: splashOpacity }}
        >
          <div className="flex flex-col items-center gap-4 animate-fade-rise">
            <Logo className="text-primary-600 h-24 w-24 animate-[spin_1.5s_infinite]" />
            <span className="font-customLogo text-4xl font-semibold text-ink tracking-widest animate-[ping_1.5s_infinite]">
              Daybreak
            </span>
          </div>
        </div>
      )}
    </Shell>
  );
}
