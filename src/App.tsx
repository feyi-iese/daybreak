import { useEffect, useState, type ReactNode } from 'react';
import type { Profile } from './db/db';
import { getProfile } from './db/profile';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import MainHub from './components/MainHub';

// Local (non-exported) page chrome: dawn background, centered column,
// wordmark header, and a gentle entrance for the active screen.
function Logo({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.3" />
      <path d="M7 18C7 13.0294 11.0294 9 16 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="9" r="2.2" fill="currentColor" />
    </svg>
  );
}

function Shell({ screen, children }: { screen: string; children: ReactNode }) {
  return (
    <div className="app-shell">
      <div className="sun-glow animate-float" aria-hidden="true" />
      <div className="app-main">
        <header className="mb-8 flex items-center justify-between">
          <span className="wordmark">
            <Logo className="text-primary-600 h-6 w-6" />
            Daybreak
          </span>
        </header>
        <main key={screen} className="animate-fade-rise">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let active = true;
    void getProfile().then((p) => {
      if (!active) return;
      setProfile(p);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  function handleComplete(saved: Profile) {
    setProfile(saved);
    setEditing(false);
  }

  if (loading) return null;

  if (profile && !editing) {
    return (
      <Shell screen="hub">
        <MainHub profile={profile} onEdit={() => setEditing(true)} />
      </Shell>
    );
  }

  return (
    <Shell screen="onboarding">
      <OnboardingFlow
        mode={profile ? 'edit' : 'create'}
        initial={profile}
        onComplete={handleComplete}
      />
    </Shell>
  );
}
