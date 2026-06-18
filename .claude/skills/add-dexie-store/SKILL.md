---
name: add-dexie-store
description: >-
  Add a new Dexie (IndexedDB) store/table to the app following the project's
  schema, typing, and units conventions. Use this whenever adding or changing a
  persisted data store — e.g. doses, side effects, reflections, vitals, or any new
  table — or when bumping the Dexie schema version. Trigger this even if the user
  just says "add a place to save X", "I need to store Y", "persist this data", or
  "add a table", without naming Dexie explicitly.
---

# Add a Dexie store

Use this when the app needs to persist a new kind of record. It keeps every store
consistent with the rules in `CLAUDE.md`: canonical units, epoch-ms timestamps, no
derived values, versioned schema changes.

All DB code lives in `src/db/`:

- `src/db/db.ts` — the Dexie instance, the schema versions, and table types
- `src/db/<store>.ts` — typed CRUD helpers for one store
- `src/db/__tests__/<store>.test.ts` — a smoke test for the helpers

## Steps

### 1. Define the record type

Add an interface in `db.ts`. Use canonical units and an epoch-ms timestamp called
`at`. The primary key is an auto-increment `id` (optional on insert).

```ts
export interface Dose {
  id?: number;        // auto-increment PK, omit when inserting
  at: number;         // epoch ms — when the dose was taken
  amountMg: number;   // canonical unit (mg), never store "2.5mg" as a string
  site: InjectionSite;
  note?: string;
}
```

### 2. Add the table and bump the schema version

Declare the table field, then add a **new** `version(n)` block. Never edit an
existing version block — always add the next one, so existing users' databases
migrate cleanly.

```ts
import Dexie, { type Table } from 'dexie';

export class AppDB extends Dexie {
  weighIns!: Table<WeighIn, number>;
  doses!: Table<Dose, number>;          // 1. declare the new table

  constructor() {
    super('mounjaroTracker');

    this.version(1).stores({
      weighIns: '++id, at',
    });

    this.version(2).stores({             // 2. new version block
      weighIns: '++id, at',
      doses: '++id, at',                 // '++id' = auto PK, 'at' = indexed
    });
  }
}

export const db = new AppDB();
```

Index any field you'll query or sort by (almost always `at`; add others like
`doseId` for `reflections`). If the change reshapes existing data, add an
`.upgrade()` callback to that version block.

### 3. Write typed CRUD helpers

Put thin helpers in `src/db/<store>.ts` so components never touch `db` directly.
Keep all unit conversion **out** of here — these speak canonical units only.

```ts
import { db, type Dose } from './db';

export const addDose = (dose: Omit<Dose, 'id'>) => db.doses.add(dose);

export const listDoses = () => db.doses.orderBy('at').reverse().toArray();

export const latestDose = () => db.doses.orderBy('at').last();

export const deleteDose = (id: number) => db.doses.delete(id);
```

### 4. Add a smoke test

```ts
import 'fake-indexeddb/auto';
import { addDose, listDoses } from '../doses';

test('adds and lists a dose', async () => {
  await addDose({ at: Date.now(), amountMg: 2.5, site: 'abdomen' });
  const doses = await listDoses();
  expect(doses).toHaveLength(1);
  expect(doses[0].amountMg).toBe(2.5);
});
```

### 5. Run it and commit

`npm run test` and `npm run build`, confirm green, then commit just this store
(`feat(db): add doses store`). One store per commit.

## Checklist

- [ ] Record type uses canonical units (kg/cm/mg) and an epoch-ms `at`
- [ ] No derived values stored (compute BMI, totals, percentages on read)
- [ ] New `version(n)` block added — existing versions untouched
- [ ] Indexed every queried/sorted field
- [ ] `.upgrade()` added if existing data is reshaped
- [ ] CRUD helpers added; components don't touch `db` directly
- [ ] Smoke test passes; build is green; committed on its own
