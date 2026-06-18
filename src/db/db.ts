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
}

export class AppDB extends Dexie {
  profile!: Table<Profile, number>;

  constructor() {
    super('mounjaroTracker');

    this.version(1).stores({
      // Singleton store: only '++id' is needed (no other queried/sorted fields).
      profile: '++id',
    });
  }
}

export const db = new AppDB();
