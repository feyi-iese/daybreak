import { db, type Profile } from './db';

/**
 * Upsert the single-user profile row (id = 1).
 *
 * The store is a singleton: every save targets id = 1, so there is at most one
 * row. `startedAt` is set once — preserved from the existing row on update, or
 * stamped with the current time on first create. Canonical units only; no
 * derived values (BMI is computed on read).
 */
export async function saveProfile(
  input: Omit<Profile, 'id' | 'startedAt'>,
): Promise<number> {
  const existing = await db.profile.get(1);
  const startedAt = existing?.startedAt ?? Date.now();
  await db.profile.put({ ...input, id: 1, startedAt });
  return 1;
}

/** Read the singleton profile, or `undefined` if none has been saved yet. */
export async function getProfile(): Promise<Profile | undefined> {
  return db.profile.get(1);
}
