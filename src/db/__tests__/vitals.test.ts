import 'fake-indexeddb/auto';
import { db } from '../db';
import { addVital, updateVital, deleteVital, listVitals, getVitalsForRange } from '../vitals';

beforeEach(async () => {
  await db.vitals.clear();
});

describe('vitals store CRUD helpers', () => {
  it('adds and lists vitals', async () => {
    const id = await addVital({
      at: 1000,
      bloodSugar: 95,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      waistCircumferenceCm: 85,
    });

    expect(id).toBe(1);
    const list = await listVitals();
    expect(list).toHaveLength(1);
    expect(list[0]).toEqual({
      id: 1,
      at: 1000,
      bloodSugar: 95,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      waistCircumferenceCm: 85,
    });
  });

  it('updates a vital', async () => {
    const id = await addVital({
      at: 1000,
      bloodSugar: 95,
    });

    await updateVital(id, {
      at: 1000,
      bloodSugar: 100,
      heartRate: 75,
    });

    const list = await listVitals();
    expect(list[0].bloodSugar).toBe(100);
    expect(list[0].heartRate).toBe(75);
  });

  it('deletes a vital', async () => {
    const id = await addVital({
      at: 1000,
      bloodSugar: 95,
    });

    await deleteVital(id);
    const list = await listVitals();
    expect(list).toHaveLength(0);
  });

  it('gets vitals for a timestamp range', async () => {
    await addVital({ at: 100, bloodSugar: 90 });
    await addVital({ at: 200, bloodSugar: 100 });
    await addVital({ at: 300, bloodSugar: 110 });

    const range = await getVitalsForRange(150, 250);
    expect(range).toHaveLength(1);
    expect(range[0].bloodSugar).toBe(100);
  });
});
