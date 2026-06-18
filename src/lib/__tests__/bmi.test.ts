import { computeBmi, classifyBmi } from '../bmi';

describe('computeBmi', () => {
  it('computes a clean value: 100 kg / 200 cm = 25', () => {
    expect(computeBmi(100, 200)).toBeCloseTo(25, 10);
  });

  it('computes 80 kg / 180 cm ≈ 24.69', () => {
    expect(computeBmi(80, 180)).toBeCloseTo(24.69, 2);
  });

  it('treats height as cm (÷100), not metres: 70 kg / 175 cm ≈ 22.86', () => {
    // A metres bug (70 / 175 ** 2) would yield ~0.0023; using cm without the
    // ÷100 (70 / 175 ** 2 * 10000-style) misuse would give ~22857. Pin 22.86.
    expect(computeBmi(70, 175)).toBeCloseTo(22.86, 2);
    expect(computeBmi(70, 175)).toBeLessThan(100);
  });

  it('computes 50 kg / 160 cm ≈ 19.53', () => {
    expect(computeBmi(50, 160)).toBeCloseTo(19.53, 2);
  });
});

describe('classifyBmi', () => {
  describe('boundaries (WHO adult cut-offs)', () => {
    it('18.49 -> Underweight (just below 18.5)', () => {
      expect(classifyBmi(18.49)).toBe('Underweight');
    });

    it('18.5 -> Normal (lower bound, inclusive)', () => {
      expect(classifyBmi(18.5)).toBe('Normal');
    });

    it('24.99 -> Normal (just below 25)', () => {
      expect(classifyBmi(24.99)).toBe('Normal');
    });

    it('25 -> Overweight (lower bound, inclusive)', () => {
      expect(classifyBmi(25)).toBe('Overweight');
    });

    it('29.99 -> Overweight (just below 30)', () => {
      expect(classifyBmi(29.99)).toBe('Overweight');
    });

    it('30 -> Obese (lower bound, inclusive)', () => {
      expect(classifyBmi(30)).toBe('Obese');
    });
  });

  describe('representative value per band', () => {
    it('17 -> Underweight', () => {
      expect(classifyBmi(17)).toBe('Underweight');
    });

    it('22 -> Normal', () => {
      expect(classifyBmi(22)).toBe('Normal');
    });

    it('27 -> Overweight', () => {
      expect(classifyBmi(27)).toBe('Overweight');
    });

    it('35 -> Obese', () => {
      expect(classifyBmi(35)).toBe('Obese');
    });
  });
});
