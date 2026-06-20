import 'fake-indexeddb/auto';
import { db } from '../db';
import {
  addWeighIn,
  updateWeighIn,
  deleteWeighIn,
  listWeighIns,
  getWeighInsForRange,
} from '../weighIns';

beforeEach(async () => {
  await db.weighIns.clear();
});

describe('weighIns store CRUD helpers', () => {
  it('adds and lists weighIns', async () => {
    const id = await addWeighIn({
      at: 1000,
      weightKg: 85.5,
    });

    expect(id).toBe(1);
    const list = await listWeighIns();
    expect(list).toHaveLength(1);
    expect(list[0]).toEqual({
      id: 1,
      at: 1000,
      weightKg: 85.5,
    });
  });

  it('updates a weighIn', async () => {
    const id = await addWeighIn({
      at: 1000,
      weightKg: 85.5,
    });

    await updateWeighIn(id, {
      at: 1000,
      weightKg: 84.2,
    });

    const list = await listWeighIns();
    expect(list[0].weightKg).toBe(84.2);
  });

  it('deletes a weighIn', async () => {
    const id = await addWeighIn({
      at: 1000,
      weightKg: 85.5,
    });

    await deleteWeighIn(id);
    const list = await listWeighIns();
    expect(list).toHaveLength(0);
  });

  it('gets weighIns for a timestamp range', async () => {
    await addWeighIn({ at: 100, weightKg: 80 });
    await addWeighIn({ at: 200, weightKg: 81 });
    await addWeighIn({ at: 300, weightKg: 82 });

    const range = await getWeighInsForRange(150, 250);
    expect(range).toHaveLength(1);
    expect(range[0].weightKg).toBe(81);
  });
});
