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
export interface Dose {
  id?: number;
  at: number; // epoch ms — start-of-day for the selected calendar date
  name: string; // drug brand name (e.g. 'Mounjaro', 'Ozempic')
  dosageMg: number; // canonical milligrams
  injectionSite?: string; // e.g. 'abdomen-upper-left', 'thigh-right'
  takenAt?: number; // epoch ms — when the dose was actually administered
}

export interface FeelingLog {
  id?: number;
  at: number; // epoch ms — timestamp of log
  symptoms: string[]; // array of side effects/symptoms
  severity?: 'mild' | 'moderate' | 'severe';
  note?: string;
}

export interface VitalLog {
  id?: number;
  at: number; // epoch ms — timestamp of log
  bloodSugar?: number; // mg/dL
  bloodPressureSystolic?: number; // mmHg
  bloodPressureDiastolic?: number; // mmHg
  heartRate?: number; // bpm
  waistCircumferenceCm?: number; // cm
}

export interface WeighIn {
  id?: number;
  at: number; // epoch ms — timestamp of log
  weightKg: number; // canonical kg
}

export class AppDB extends Dexie {
  profile!: Table<Profile, number>;
  doses!: Table<Dose, number>;
  feelings!: Table<FeelingLog, number>;
  vitals!: Table<VitalLog, number>;
  weighIns!: Table<WeighIn, number>;
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

    // v3: Add daily log tables
    this.version(3).stores({
      profile: '++id',
      doses: '++id, at',
      feelings: '++id, at',
      vitals: '++id, at',
      weighIns: '++id, at',
    });
  }
}

export const db = new AppDB();
