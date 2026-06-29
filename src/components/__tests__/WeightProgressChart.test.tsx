import 'fake-indexeddb/auto';
import { render, screen } from '@testing-library/react';
import type { Profile, WeighIn } from '../../db/db';
import WeightProgressChart, { buildWeightProgressPoints } from '../WeightProgressChart';

describe('WeightProgressChart - buildWeightProgressPoints', () => {
  const profile: Profile = {
    gender: 'female',
    heightCm: 180,
    startingWeightKg: 100,
    targetWeightKg: 75,
    startedAt: new Date(2026, 0, 1).getTime(),
    disclaimerAcceptedAt: 1,
    weightUnit: 'kg',
    heightUnit: 'cm',
  };

  it('correctly builds and filters weight progress points', () => {
    const weighIns: WeighIn[] = [
      // Same start timestamp (should be skipped)
      { at: new Date(2026, 0, 1).getTime(), weightKg: 99 },
      // Jan 15 at 97.5 kg
      { at: new Date(2026, 0, 15).getTime(), weightKg: 97.5 },
      // Feb 1 at 95 kg
      { at: new Date(2026, 1, 1).getTime(), weightKg: 95 },
    ];

    const points = buildWeightProgressPoints(profile, weighIns);

    expect(points).toHaveLength(3);
    expect(points[0]).toEqual({
      at: profile.startedAt,
      weightKg: 100,
      kind: 'start',
    });
    expect(points[1]).toEqual({
      at: new Date(2026, 0, 15).getTime(),
      weightKg: 97.5,
      kind: 'log',
    });
    expect(points[2]).toEqual({
      at: new Date(2026, 1, 1).getTime(),
      weightKg: 95,
      kind: 'log',
    });
  });

  it('keeps the later sorted item for duplicate timestamps', () => {
    const weighIns: WeighIn[] = [
      { id: 1, at: new Date(2026, 0, 15).getTime(), weightKg: 97.5 },
      { id: 2, at: new Date(2026, 0, 15).getTime(), weightKg: 97.0 },
    ];

    const points = buildWeightProgressPoints(profile, weighIns);
    expect(points).toHaveLength(2);
    expect(points[1].weightKg).toBe(97.0); // later by id
  });
});

describe('WeightProgressChart Component', () => {
  const profile: Profile = {
    gender: 'female',
    heightCm: 180,
    startingWeightKg: 100,
    targetWeightKg: 75,
    startedAt: new Date(2026, 0, 1).getTime(),
    disclaimerAcceptedAt: 1,
    weightUnit: 'kg',
    heightUnit: 'cm',
  };

  const logs: WeighIn[] = [
    { at: new Date(2026, 0, 15).getTime(), weightKg: 97.5 },
    { at: new Date(2026, 1, 1).getTime(), weightKg: 95 },
  ];

  it('renders correctly in kg', () => {
    render(<WeightProgressChart profile={profile} weighIns={logs} />);

    const img = screen.getByRole('img', { name: /weight progress chart/i });
    expect(img).toBeInTheDocument();

    const ariaLabel = img.getAttribute('aria-label');
    expect(ariaLabel).toContain('100.0 kg');
    expect(ariaLabel).toContain('95.0 kg');

    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('renders correctly in lb', () => {
    const lbProfile: Profile = { ...profile, weightUnit: 'lb' };
    render(<WeightProgressChart profile={lbProfile} weighIns={logs} />);

    const img = screen.getByRole('img', { name: /weight progress chart/i });
    const ariaLabel = img.getAttribute('aria-label') || '';
    expect(ariaLabel).toContain('lb');
  });

  it('renders helper text when there is only one point', () => {
    render(<WeightProgressChart profile={profile} weighIns={[]} />);

    expect(
      screen.getByText('Log another weight to draw your progress line.')
    ).toBeInTheDocument();
  });
});
