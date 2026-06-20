import 'fake-indexeddb/auto';
import { db } from '../db';
import {
  addFeeling,
  updateFeeling,
  deleteFeeling,
  listFeelings,
  getFeelingsForRange,
} from '../feelings';

beforeEach(async () => {
  await db.feelings.clear();
});

describe('feelings store CRUD helpers', () => {
  it('adds and lists feelings', async () => {
    const id = await addFeeling({
      at: 1000,
      symptoms: ['nausea', 'fatigue'],
      severity: 'moderate',
      note: 'Felt tired in afternoon',
    });

    expect(id).toBe(1);
    const list = await listFeelings();
    expect(list).toHaveLength(1);
    expect(list[0]).toEqual({
      id: 1,
      at: 1000,
      symptoms: ['nausea', 'fatigue'],
      severity: 'moderate',
      note: 'Felt tired in afternoon',
    });
  });

  it('updates a feeling', async () => {
    const id = await addFeeling({
      at: 1000,
      symptoms: ['nausea'],
    });

    await updateFeeling(id, {
      at: 1000,
      symptoms: ['nausea', 'headache'],
      severity: 'mild',
    });

    const list = await listFeelings();
    expect(list[0].symptoms).toEqual(['nausea', 'headache']);
    expect(list[0].severity).toBe('mild');
  });

  it('deletes a feeling', async () => {
    const id = await addFeeling({
      at: 1000,
      symptoms: ['nausea'],
    });

    await deleteFeeling(id);
    const list = await listFeelings();
    expect(list).toHaveLength(0);
  });

  it('gets feelings for a timestamp range', async () => {
    await addFeeling({ at: 100, symptoms: ['nausea'] });
    await addFeeling({ at: 200, symptoms: ['fatigue'] });
    await addFeeling({ at: 300, symptoms: ['headache'] });

    const range = await getFeelingsForRange(150, 250);
    expect(range).toHaveLength(1);
    expect(range[0].symptoms).toEqual(['fatigue']);
  });
});
