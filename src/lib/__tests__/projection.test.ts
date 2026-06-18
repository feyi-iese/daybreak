import {
  SURMOUNT_HORIZON_WEEKS,
  DOSE_LOSS_FRACTIONS,
  TAU,
  projectedWeightAtWeek,
  projectedWeightAt72Weeks,
  weeksToTarget,
  formatWeeksAsMonths,
} from '../projection';

describe('constants', () => {
  it('SURMOUNT_HORIZON_WEEKS = 72', () => {
    expect(SURMOUNT_HORIZON_WEEKS).toBe(72);
  });

  it('DOSE_LOSS_FRACTIONS contains 5mg/10mg/15mg', () => {
    expect(DOSE_LOSS_FRACTIONS).toEqual({
      '5mg': 0.15,
      '10mg': 0.195,
      '15mg': 0.209,
    });
  });

  it('TAU = 20', () => {
    expect(TAU).toBe(20);
  });
});

describe('projectedWeightAtWeek', () => {
  it('week 0 → no change (start weight)', () => {
    expect(projectedWeightAtWeek(100, 0.209, 0)).toBe(100);
  });

  it('week 72 with 0.209 loss → ≈79.1 (full fraction realised)', () => {
    expect(projectedWeightAtWeek(100, 0.209, 72)).toBeCloseTo(79.1, 1);
  });

  it('week 72 with 0.15 loss → ≈85.0', () => {
    expect(projectedWeightAtWeek(100, 0.15, 72)).toBeCloseTo(85.0, 1);
  });

  it('intermediate weeks produce values between start and horizon', () => {
    const w36 = projectedWeightAtWeek(100, 0.209, 36);
    expect(w36).toBeGreaterThan(79.1);
    expect(w36).toBeLessThan(100);
  });

  it('curve is monotonically decreasing', () => {
    let prev = 100;
    for (let w = 1; w <= 72; w++) {
      const curr = projectedWeightAtWeek(100, 0.209, w);
      expect(curr).toBeLessThan(prev);
      prev = curr;
    }
  });
});

describe('projectedWeightAt72Weeks', () => {
  it('100 kg → { low: ≈79.1, high: ≈85.0 }', () => {
    const result = projectedWeightAt72Weeks(100);
    expect(result.low).toBeCloseTo(79.1, 1);
    expect(result.high).toBeCloseTo(85.0, 1);
  });

  it('low < high (optimistic loses more)', () => {
    const result = projectedWeightAt72Weeks(100);
    expect(result.low).toBeLessThan(result.high);
  });

  it('scales linearly with start weight', () => {
    const r100 = projectedWeightAt72Weeks(100);
    const r200 = projectedWeightAt72Weeks(200);
    expect(r200.low).toBeCloseTo(r100.low * 2, 1);
    expect(r200.high).toBeCloseTo(r100.high * 2, 1);
  });
});

describe('weeksToTarget', () => {
  it('100 kg → 85 kg: fast is non-null and < 72', () => {
    const result = weeksToTarget(100, 85);
    expect(result.fast).not.toBeNull();
    expect(result.fast!).toBeLessThan(72);
    expect(result.fast!).toBeGreaterThan(0);
  });

  it('100 kg → 85 kg: slow ≈ 72 (5mg hits 85 at horizon)', () => {
    const result = weeksToTarget(100, 85);
    expect(result.slow).not.toBeNull();
    expect(result.slow!).toBeCloseTo(72, 0);
  });

  it('100 kg → 70 kg: both null (below asymptote for both doses)', () => {
    const result = weeksToTarget(100, 70);
    expect(result.fast).toBeNull();
    expect(result.slow).toBeNull();
  });

  it('100 kg → 90 kg: fast < slow, both non-null and reasonable', () => {
    const result = weeksToTarget(100, 90);
    expect(result.fast).not.toBeNull();
    expect(result.slow).not.toBeNull();
    expect(result.fast!).toBeLessThan(result.slow!);
    expect(result.fast!).toBeLessThan(40);
    expect(result.slow!).toBeLessThan(40);
  });

  it('target above start → both 0 (already there)', () => {
    const result = weeksToTarget(100, 110);
    expect(result.fast).toBe(0);
    expect(result.slow).toBe(0);
  });

  it('caps at 150 weeks', () => {
    // Target barely reachable — should cap, not return huge values
    const result = weeksToTarget(100, 85.1);
    if (result.slow !== null) {
      expect(result.slow).toBeLessThanOrEqual(150);
    }
  });
});

describe('formatWeeksAsMonths', () => {
  it('72 weeks → "~17 months"', () => {
    expect(formatWeeksAsMonths(72)).toBe('~17 months');
  });

  it('26 weeks → "~6 months"', () => {
    expect(formatWeeksAsMonths(26)).toBe('~6 months');
  });

  it('4.33 weeks → "~1 months"', () => {
    expect(formatWeeksAsMonths(4.33)).toBe('~1 months');
  });
});
