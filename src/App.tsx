import { useEffect, useState, type ReactNode } from 'react';
import type { Profile } from './db/db';
import { getProfile } from './db/profile';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import Dashboard from './components/Dashboard';

// Local (non-exported) page chrome: dawn background, centered column,
// wordmark header, and a gentle entrance for the active screen.
function Shell({ screen, children }: { screen: string; children: ReactNode }) {
  return (
    <div className="app-shell">
      <div className="sun-glow animate-float" aria-hidden="true" />
      <div className="app-main">
        <header className="mb-8 flex items-center justify-between">
          <span className="wordmark">
            <span className="wordmark-dot" aria-hidden="true" />
            Daybreak
          </span>
          <span className="hero-eyebrow">New horizon</span>
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
      <Shell screen="dashboard">
        <Dashboard profile={profile} onEdit={() => setEditing(true)} />
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
