/**
 * SURMOUNT-1 projection helpers.
 *
 * Projects weight trajectories using trial-average body-weight-loss data from
 * the SURMOUNT-1 tirzepatide trial (72 weeks, non-diabetic adults). The eased
 * curve is ILLUSTRATIVE — only the endpoints (the % values) are the real claim.
 * The exponential shape matches the trial's front-loaded trajectory.
 *
 * These are rough ranges — "individual results vary, not medical advice."
 */

/** Trial duration in weeks. */
export const SURMOUNT_HORIZON_WEEKS = 72;

/** Trial-average % body-weight loss at 72 weeks, by maintenance dose. */
export const DOSE_LOSS_FRACTIONS: Record<string, number> = {
  '5mg': 0.15,
  '10mg': 0.195,
  '15mg': 0.209,
};

/** Front-loaded easing time constant (weeks). ~68% of loss by week 20. */
export const TAU = 20;

/** Denominator for the easing normalisation — constant for a given TAU/horizon. */
const DENOM = 1 - Math.exp(-SURMOUNT_HORIZON_WEEKS / TAU);

/**
 * Projected weight at a given week on an eased loss curve.
 *
 * Formula: startKg * (1 - lossFraction * (1 - exp(-week/TAU)) / DENOM)
 *
 * At week 0 the factor is 0 → returns startKg.
 * At week 72 the factor is 1 → returns startKg * (1 - lossFraction).
 */
export function projectedWeightAtWeek(
  startKg: number,
  lossFraction: number,
  week: number,
): number {
  return startKg * (1 - lossFraction * (1 - Math.exp(-week / TAU)) / DENOM);
}

/**
 * Projected weight range at the 72-week horizon.
 * low = best case (15 mg, 20.9% loss), high = conservative (5 mg, 15% loss).
 */
export function projectedWeightAt72Weeks(startKg: number): {
  low: number;
  high: number;
} {
  return {
    low: projectedWeightAtWeek(startKg, DOSE_LOSS_FRACTIONS['15mg'], SURMOUNT_HORIZON_WEEKS),
    high: projectedWeightAtWeek(startKg, DOSE_LOSS_FRACTIONS['5mg'], SURMOUNT_HORIZON_WEEKS),
  };
}

/**
 * Weeks for the optimistic (15 mg) and conservative (5 mg) curves to reach
 * targetKg. Returns null when the target is below the dose asymptote
 * (unreachable within trial data). Capped at 150 weeks.
 */
export function weeksToTarget(
  startKg: number,
  targetKg: number,
): { fast: number | null; slow: number | null } {
  return {
    fast: solveWeeks(startKg, targetKg, DOSE_LOSS_FRACTIONS['15mg']),
    slow: solveWeeks(startKg, targetKg, DOSE_LOSS_FRACTIONS['5mg']),
  };
}

const MAX_WEEKS = 150;

/**
 * Analytically solve for the week when projectedWeightAtWeek <= targetKg.
 *
 * From the formula:
 *   targetKg = startKg * (1 - lossFrac * (1 - exp(-w/TAU)) / DENOM)
 *   need = (startKg - targetKg) / (startKg * lossFrac)
 *   (1 - exp(-w/TAU)) / DENOM = need
 *   exp(-w/TAU) = 1 - need * DENOM
 *   w = -TAU * ln(1 - need * DENOM)
 *
 * Returns 0 if already at/below target, null if unreachable.
 */
function solveWeeks(
  startKg: number,
  targetKg: number,
  lossFraction: number,
): number | null {
  const totalLossKg = startKg * lossFraction;
  const need = (startKg - targetKg) / totalLossKg;

  if (need <= 0) return 0;

  const inner = 1 - need * DENOM;
  if (inner <= 0) return null;

  const weeks = -TAU * Math.log(inner);
  return Math.min(weeks, MAX_WEEKS);
}

/** Format a week count as approximate months. */
export function formatWeeksAsMonths(weeks: number): string {
  return `~${Math.round(weeks / 4.33)} months`;
}
