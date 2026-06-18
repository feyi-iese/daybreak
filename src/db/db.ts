import Dexie, { type Table } from 'dexie';

/**
 * Biological sex. Stored for body-composition context and later projection
 * features; adult BMI category cut-offs themselves are gender-neutral (WHO).
 */
export type Gender = 'male' | 'female';

/**
 * Singleton profile record — the app is single-user, so there is exactly one
 * row (id = 1).
 *
 * Invariants (see CLAUDE.md):
 * - Canonical units only: weight in kg, height in cm, timestamps epoch-ms.
 * - No derived values stored: BMI, weight-to-lose and progress are computed on
 *   read, never written here. BMI = weightKg / (heightCm / 100) ** 2.
 */
export interface Profile {
  id?: number; // auto-increment PK; the singleton row is id = 1
  gender: Gender;
  heightCm: number; // canonical: centimetres
  startingWeightKg: number; // canonical: kilograms
  targetWeightKg: number; // canonical: kilograms
  startedAt: number; // epoch ms — when the profile was created
  disclaimerAcceptedAt?: number; // epoch ms — when health disclaimer was accepted (step 2)
  weightUnit?: 'kg' | 'lb'; // display preference only — storage stays kg
  heightUnit?: 'cm' | 'ftin'; // display preference only — storage stays cm
}

export class AppDB extends Dexie {
  profile!: Table<Profile, number>;

  constructor() {
    super('mounjaroTracker');

    this.version(1).stores({
      profile: '++id',
    });

    // v2: Profile gains disclaimerAcceptedAt + display-unit preferences.
    // Fields are schemaless in Dexie (no index change), but convention requires
    // a new version block. Backfill existing rows so older installs stay valid.
    this.version(2)
      .stores({ profile: '++id' })
      .upgrade(async (tx) => {
        await tx.table('profile').toCollection().modify((p: Record<string, unknown>) => {
          if (p.disclaimerAcceptedAt == null) p.disclaimerAcceptedAt = (p.startedAt as number) ?? Date.now();
          if (p.weightUnit == null) p.weightUnit = 'kg';
          if (p.heightUnit == null) p.heightUnit = 'cm';
        });
      });
  }
}

export const db = new AppDB();
