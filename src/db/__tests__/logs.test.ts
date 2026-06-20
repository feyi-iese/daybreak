import 'fake-indexeddb/auto';
import { db } from '../db';
import { addDose } from '../doses';
import { addFeeling } from '../feelings';
import { addVital } from '../vitals';
import { addWeighIn } from '../weighIns';
import { getLogsForDay } from '../logs';

beforeEach(async () => {
  await Promise.all([
    db.doses.clear(),
    db.feelings.clear(),
    db.vitals.clear(),
    db.weighIns.clear(),
  ]);
});

describe('logs aggregation helper', () => {
  it('correctly aggregates all logs for a specific day', async () => {
    // June 18, 2026 12:00:00 (local time representation)
    const targetDate = new Date(2026, 5, 18, 12, 0, 0);
    const ts = targetDate.getTime();

    // Add some logs on the target date
    await addDose({ at: ts, name: 'Mounjaro', dosageMg: 2.5 });
    await addFeeling({ at: ts, symptoms: ['nausea'] });
    await addVital({ at: ts, bloodSugar: 90 });
    await addWeighIn({ at: ts, weightKg: 80.0 });

    // Add logs on another date
    const anotherDate = new Date(2026, 5, 19, 12, 0, 0).getTime();
    await addDose({ at: anotherDate, name: 'Mounjaro', dosageMg: 5.0 });

    const logs = await getLogsForDay(ts);

    expect(logs.doses).toHaveLength(1);
    expect(logs.doses[0].dosageMg).toBe(2.5);
    expect(logs.feeling).toBeDefined();
    expect(logs.feeling!.symptoms).toEqual(['nausea']);
    expect(logs.vital).toBeDefined();
    expect(logs.vital!.bloodSugar).toBe(90);
    expect(logs.weighIn).toBeDefined();
    expect(logs.weighIn!.weightKg).toBe(80.0);
  });

  it('returns empty lists/undefined when no logs exist for that day', async () => {
    const ts = Date.now();
    const logs = await getLogsForDay(ts);
    expect(logs.doses).toHaveLength(0);
    expect(logs.feeling).toBeUndefined();
    expect(logs.vital).toBeUndefined();
    expect(logs.weighIn).toBeUndefined();
  });
});
