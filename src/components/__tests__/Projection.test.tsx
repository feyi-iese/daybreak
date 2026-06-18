import { render, screen } from '@testing-library/react';

import type { Profile } from '../../db/db';
import Projection from '../Projection';

vi.mock('../../lib/projection', () => ({
  projectedWeightAt72Weeks: (startKg: number) => ({
    low: Math.round(startKg * 0.79),
    high: Math.round(startKg * 0.85),
  }),
  weeksToTarget: (startKg: number, targetKg: number) => {
    const low = Math.round(startKg * 0.79);
    if (targetKg < low) return { fast: null, slow: null };
    return { fast: 10, slow: 40 };
  },
  formatWeeksAsMonths: (weeks: number) => `~${Math.round(weeks / 4.345)} months`,
  SURMOUNT_HORIZON_WEEKS: 72,
}));

vi.mock('../../lib/units', () => ({
  formatWeight: (kg: number) => `${Math.round(kg)} kg`,
}));

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    gender: 'female',
    heightCm: 180,
    startingWeightKg: 100,
    targetWeightKg: 70,
    startedAt: Date.now(),
    ...overrides,
  };
}

describe('Projection', () => {
  it('Branch A: shows trial percentage range and aiming-high note when goal is beyond range', () => {
    render(<Projection profile={makeProfile({ targetWeightKg: 70 })} />);

    expect(screen.getByText(/15.*21%/)).toBeInTheDocument();
    expect(screen.getByText(/aiming high/i)).toBeInTheDocument();
    expect(screen.getByText(/goes further/i)).toBeInTheDocument();
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
  });

  it('Branch B: shows time-to-target estimate when goal is within range', () => {
    render(<Projection profile={makeProfile({ targetWeightKg: 90 })} />);

    expect(screen.getByText(/could take roughly/i)).toBeInTheDocument();
    expect(screen.getByText(/months/i)).toBeInTheDocument();
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
  });

  it('renders chart SVG with non-empty aria-label', () => {
    render(<Projection profile={makeProfile()} />);

    const svg = screen.getByRole('img');
    expect(svg).toHaveAttribute('aria-label');
    expect(svg.getAttribute('aria-label')).not.toBe('');
  });

  it('caveat is present in both branches', () => {
    const { unmount } = render(
      <Projection profile={makeProfile({ targetWeightKg: 70 })} />,
    );
    expect(document.querySelector('.caveat')).toBeInTheDocument();
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
    unmount();

    render(<Projection profile={makeProfile({ targetWeightKg: 90 })} />);
    expect(document.querySelector('.caveat')).toBeInTheDocument();
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
  });
});
