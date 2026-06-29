import { BMI_CHIP_TONE_CLASSES, getBmiChipClassName } from '../bmiStyles';

describe('bmiStyles', () => {
  it('asserts BMI_CHIP_TONE_CLASSES maps categories to correct classes', () => {
    expect(BMI_CHIP_TONE_CLASSES).toEqual({
      Underweight: 'border-tone-sky-edge bg-tone-sky-soft text-tone-sky-ink',
      Normal: 'border-tone-mint-edge bg-tone-mint-soft text-tone-mint-ink',
      Overweight: 'border-tone-sun-edge bg-tone-sun-soft text-tone-sun-ink',
      Obese: 'border-tone-rose-edge bg-tone-rose-soft text-tone-rose-ink',
    });
  });

  describe('getBmiChipClassName', () => {
    it('returns the basic bmi-chip class name for a category without extra classes', () => {
      expect(getBmiChipClassName('Underweight')).toBe(
        'bmi-chip border-tone-sky-edge bg-tone-sky-soft text-tone-sky-ink'
      );
      expect(getBmiChipClassName('Normal')).toBe(
        'bmi-chip border-tone-mint-edge bg-tone-mint-soft text-tone-mint-ink'
      );
      expect(getBmiChipClassName('Overweight')).toBe(
        'bmi-chip border-tone-sun-edge bg-tone-sun-soft text-tone-sun-ink'
      );
      expect(getBmiChipClassName('Obese')).toBe(
        'bmi-chip border-tone-rose-edge bg-tone-rose-soft text-tone-rose-ink'
      );
    });

    it('returns the bmi-chip class name merged with extra classes when provided', () => {
      expect(getBmiChipClassName('Obese', 'px-2.5 py-1')).toBe(
        'bmi-chip border-tone-rose-edge bg-tone-rose-soft text-tone-rose-ink px-2.5 py-1'
      );
      expect(getBmiChipClassName('Normal', 'text-xs')).toBe(
        'bmi-chip border-tone-mint-edge bg-tone-mint-soft text-tone-mint-ink text-xs'
      );
    });
  });
});
