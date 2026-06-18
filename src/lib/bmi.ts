/**
 * Body Mass Index helpers.
 *
 * BMI is a derived value: it is computed on read from canonical-unit inputs
 * (weight in kg, height in cm) and never persisted (see CLAUDE.md invariants).
 */

/** WHO adult BMI categories (gender-neutral cut-offs). */
export type BmiCategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese';

/**
 * Compute BMI from canonical units. Height is centimetres, so it is divided by
 * 100 to metres before squaring. Returns full precision; the caller rounds for
 * display.
 */
export function computeBmi(weightKg: number, heightCm: number): number {
  return weightKg / (heightCm / 100) ** 2;
}

/**
 * Classify a BMI value into a WHO adult category. Lower bounds are inclusive:
 * < 18.5 Underweight, [18.5, 25) Normal, [25, 30) Overweight, >= 30 Obese.
 */
export function classifyBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}
