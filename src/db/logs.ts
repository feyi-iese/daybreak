import { getDayRange } from '../lib/dateUtils';
import { getDosesForRange } from './doses';
import { getFeelingsForRange } from './feelings';
import { getVitalsForRange } from './vitals';
import { getWeighInsForRange } from './weighIns';
import type { Dose, FeelingLog, VitalLog, WeighIn } from './db';

export interface DailyLogDay {
  doses: Dose[];
  feeling?: FeelingLog;
  vital?: VitalLog;
  weighIn?: WeighIn;
}

/**
 * Fetch all logged items for a specific timestamp's calendar day in local time.
 */
export async function getLogsForDay(timestamp: number): Promise<DailyLogDay> {
  const { start, end } = getDayRange(timestamp);
  const [doses, feelings, vitals, weighIns] = await Promise.all([
    getDosesForRange(start, end),
    getFeelingsForRange(start, end),
    getVitalsForRange(start, end),
    getWeighInsForRange(start, end),
  ]);

  return {
    doses,
    feeling: feelings[0], // Single feeling per day invariant
    vital: vitals[0],     // Single vital per day invariant
    weighIn: weighIns[0], // Single weight per day invariant
  };
}
