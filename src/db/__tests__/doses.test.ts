import 'fake-indexeddb/auto';
import { db } from '../db';
import { addDose, updateDose, deleteDose, listDoses, getDosesForRange } from '../doses';

beforeEach(async () => {
  await db.doses.clear();
});

describe('doses store CRUD helpers', () => {
  it('adds and lists doses', async () => {
    const id = await addDose({
      at: 1000,
      name: 'tirzepatide',
      dosageMg: 2.5,
      injectionSite: 'abdomen',
    });

    expect(id).toBe(1);
    const list = await listDoses();
    expect(list).toHaveLength(1);
    expect(list[0]).toEqual({
      id: 1,
      at: 1000,
      name: 'tirzepatide',
      dosageMg: 2.5,
      injectionSite: 'abdomen',
    });
  });

  it('updates a dose', async () => {
    const id = await addDose({
      at: 1000,
      name: 'tirzepatide',
      dosageMg: 2.5,
    });

    await updateDose(id, {
      at: 1000,
      name: 'tirzepatide',
      dosageMg: 5.0,
      injectionSite: 'thigh',
    });

    const list = await listDoses();
    expect(list[0].dosageMg).toBe(5.0);
    expect(list[0].injectionSite).toBe('thigh');
  });

  it('deletes a dose', async () => {
    const id = await addDose({
      at: 1000,
      name: 'tirzepatide',
      dosageMg: 2.5,
    });

    await deleteDose(id);
    const list = await listDoses();
    expect(list).toHaveLength(0);
  });

  it('gets doses for a timestamp range', async () => {
    await addDose({ at: 100, name: 'A', dosageMg: 2.5 });
    await addDose({ at: 200, name: 'B', dosageMg: 2.5 });
    await addDose({ at: 300, name: 'C', dosageMg: 2.5 });

    const range = await getDosesForRange(150, 250);
    expect(range).toHaveLength(1);
    expect(range[0].name).toBe('B');
  });
});
