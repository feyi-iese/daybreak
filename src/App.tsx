import { useEffect, useState } from 'react';
import type { Gender, Profile } from './db/db';
import { getProfile, saveProfile } from './db/profile';
import ProfileForm from './components/ProfileForm';
import Dashboard from './components/Dashboard';

interface ProfileInput {
  gender: Gender;
  heightCm: number;
  startingWeightKg: number;
  targetWeightKg: number;
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

  async function handleSubmit(values: ProfileInput) {
    await saveProfile(values);
    const saved = await getProfile();
    setProfile(saved);
    setEditing(false);
  }

  if (loading) return null;

  if (profile && !editing) {
    return <Dashboard profile={profile} onEdit={() => setEditing(true)} />;
  }

  return <ProfileForm initial={profile} onSubmit={handleSubmit} />;
}
