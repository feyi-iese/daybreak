import {
  kgToLb,
  lbToKg,
  cmToFtIn,
  ftInToCm,
  formatWeight,
  formatHeight,
} from '../units';

describe('kgToLb / lbToKg', () => {
  it('kgToLb(100) ≈ 220.462', () => {
    expect(kgToLb(100)).toBeCloseTo(220.462, 3);
  });

  it('round-trip kg → lb → kg within 0.01', () => {
    const original = 100;
    const roundTrip = lbToKg(kgToLb(original));
    expect(Math.abs(roundTrip - original)).toBeLessThan(0.01);
  });

  it('lbToKg(220.462) ≈ 100', () => {
    expect(lbToKg(220.462)).toBeCloseTo(100, 2);
  });

  it('handles zero', () => {
    expect(kgToLb(0)).toBe(0);
    expect(lbToKg(0)).toBe(0);
  });
});

describe('cmToFtIn / ftInToCm', () => {
  it('cmToFtIn(180) → { ft: 5, inches: 11 }', () => {
    expect(cmToFtIn(180)).toEqual({ ft: 5, inches: 11 });
  });

  it('cmToFtIn(152.4) → { ft: 5, inches: 0 } (exact 60 inches)', () => {
    expect(cmToFtIn(152.4)).toEqual({ ft: 5, inches: 0 });
  });

  it('ftInToCm(5, 11) ≈ 180.34', () => {
    expect(ftInToCm(5, 11)).toBeCloseTo(180.34, 2);
  });

  it('ftInToCm(5, 0) = 152.4 (exact)', () => {
    expect(ftInToCm(5, 0)).toBeCloseTo(152.4, 5);
  });

  it('handles boundary: cmToFtIn at exact foot boundary (182.88 = 6 ft)', () => {
    expect(cmToFtIn(182.88)).toEqual({ ft: 6, inches: 0 });
  });

  it('rolls over 12 inches to next foot (182.6 cm → 6\'0" not 5\'12")', () => {
    const result = cmToFtIn(182.6);
    expect(result.inches).toBeLessThan(12);
    expect(result).toEqual({ ft: 6, inches: 0 });
  });
});

describe('formatWeight', () => {
  it('formats kg: 70 kg → "70.0 kg"', () => {
    expect(formatWeight(70, 'kg')).toBe('70.0 kg');
  });

  it('formats lb: 70 kg → "154.3 lb"', () => {
    expect(formatWeight(70, 'lb')).toBe('154.3 lb');
  });

  it('formats fractional kg', () => {
    expect(formatWeight(82.5, 'kg')).toBe('82.5 kg');
  });
});

describe('formatHeight', () => {
  it('formats cm: 180 cm → "180 cm"', () => {
    expect(formatHeight(180, 'cm')).toBe('180 cm');
  });

  it('formats ftin: 180 cm → "5\'11\\""', () => {
    expect(formatHeight(180, 'ftin')).toBe("5'11\"");
  });

  it('formats exact feet: 152.4 cm → "5\'0\\""', () => {
    expect(formatHeight(152.4, 'ftin')).toBe("5'0\"");
  });
});
