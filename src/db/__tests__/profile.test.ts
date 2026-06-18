import 'fake-indexeddb/auto';

import { getProfile, saveProfile } from '../profile';
import { db } from '../db';

beforeEach(async () => {
  await db.profile.clear();
});

describe('profile store (singleton CRUD)', () => {
  it('returns undefined when no profile has been saved', async () => {
    expect(await getProfile()).toBeUndefined();
  });

  it('round-trips the saved input and stamps a positive startedAt', async () => {
    await saveProfile({
      gender: 'female',
      heightCm: 165,
      startingWeightKg: 90,
      targetWeightKg: 68,
    });

    const profile = await getProfile();
    expect(profile).toBeDefined();
    expect(profile!.gender).toBe('female');
    expect(profile!.heightCm).toBe(165);
    expect(profile!.startingWeightKg).toBe(90);
    expect(profile!.targetWeightKg).toBe(68);
    expect(profile!.startedAt).toBeGreaterThan(0);
  });

  it('keeps exactly one row and reflects the latest save (singleton invariant)', async () => {
    await saveProfile({
      gender: 'female',
      heightCm: 165,
      startingWeightKg: 90,
      targetWeightKg: 68,
    });
    await saveProfile({
      gender: 'female',
      heightCm: 165,
      startingWeightKg: 85,
      targetWeightKg: 68,
    });

    expect(await db.profile.count()).toBe(1);

    const profile = await getProfile();
    expect(profile!.id).toBe(1);
    expect(profile!.startingWeightKg).toBe(85);
  });

  it('preserves startedAt across updates while other fields change', async () => {
    await saveProfile({
      gender: 'female',
      heightCm: 165,
      startingWeightKg: 90,
      targetWeightKg: 68,
    });
    const first = await getProfile();
    const originalStartedAt = first!.startedAt;

    await saveProfile({
      gender: 'female',
      heightCm: 165,
      startingWeightKg: 82,
      targetWeightKg: 68,
    });

    const updated = await getProfile();
    expect(updated!.startedAt).toBe(originalStartedAt);
    expect(updated!.startingWeightKg).toBe(82);
  });
});
