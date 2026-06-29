import type { BmiCategory } from './bmi';

export const BMI_CHIP_TONE_CLASSES: Record<BmiCategory, string> = {
  Underweight: 'border-tone-sky-edge bg-tone-sky-soft text-tone-sky-ink',
  Normal: 'border-tone-mint-edge bg-tone-mint-soft text-tone-mint-ink',
  Overweight: 'border-tone-sun-edge bg-tone-sun-soft text-tone-sun-ink',
  Obese: 'border-tone-rose-edge bg-tone-rose-soft text-tone-rose-ink',
};

export function getBmiChipClassName(category: BmiCategory, extraClasses = ''): string {
  const baseClassName = `bmi-chip ${BMI_CHIP_TONE_CLASSES[category]}`;
  return extraClasses ? `${baseClassName} ${extraClasses}` : baseClassName;
}
