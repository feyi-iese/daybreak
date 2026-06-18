/**
 * Unit conversion and display formatting helpers.
 *
 * All storage uses canonical units (kg, cm). These functions convert at the
 * display edge only — never mutate stored values.
 */

const LB_PER_KG = 2.20462;
const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

export function cmToFtIn(cm: number): { ft: number; inches: number } {
  const totalInches = cm / CM_PER_INCH;
  let ft = Math.floor(totalInches / INCHES_PER_FOOT);
  let inches = Math.round(totalInches % INCHES_PER_FOOT);
  if (inches === INCHES_PER_FOOT) {
    ft += 1;
    inches = 0;
  }
  return { ft, inches };
}

export function ftInToCm(ft: number, inches: number): number {
  return (ft * INCHES_PER_FOOT + inches) * CM_PER_INCH;
}

export function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'kg') return `${kg.toFixed(1)} kg`;
  return `${kgToLb(kg).toFixed(1)} lb`;
}

export function formatHeight(cm: number, unit: 'cm' | 'ftin'): string {
  if (unit === 'cm') return `${Math.round(cm)} cm`;
  const { ft, inches } = cmToFtIn(cm);
  return `${ft}'${inches}"`;
}
