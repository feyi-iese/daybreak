import 'fake-indexeddb/auto';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MainHub from '../MainHub';
import { db } from '../../db/db';
import { addWeighIn } from '../../db/weighIns';
import type { Profile } from '../../db/db';

const mockProfile: Profile = {
  gender: 'female',
  heightCm: 180,
  startingWeightKg: 100,
  targetWeightKg: 75,
  startedAt: 1,
  disclaimerAcceptedAt: 1,
  weightUnit: 'kg',
  heightUnit: 'cm',
};

beforeEach(async () => {
  await db.weighIns.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MainHub BMI Integration', () => {
  it('wires the BMI tab and passes the latest weigh-in to BmiCalculator', async () => {
    const user = userEvent.setup();

    // Seed two weigh-ins: latest is 95.0 kg
    await addWeighIn({ at: 1, weightKg: 90 });
    await addWeighIn({ at: 2, weightKg: 95 });

    render(<MainHub profile={mockProfile} onEdit={vi.fn()} />);

    // Click the BMI tab
    const bmiTab = await screen.findByRole('tab', { name: /^bmi$/i });
    expect(bmiTab).toBeInTheDocument();
    expect(bmiTab).toHaveAttribute('aria-selected', 'false');

    await user.click(bmiTab);

    expect(bmiTab).toHaveAttribute('aria-selected', 'true');

    // The BMI Calculator should appear
    expect(screen.getByText('Interactive Simulator')).toBeInTheDocument();

    // Verify comparison line is using the latest weigh-in (95 kg / 29.3 BMI)
    const resultGroup = screen.getByRole('group', { name: /bmi simulation result/i });
    expect(resultGroup).toBeInTheDocument();
    expect(resultGroup).toHaveTextContent('Current BMI: 29.3 at 95.0 kg');
  });
});

describe('MainHub Journey Integration', () => {
  it('displays Weight progress section and WeightProgressChart on My Journey tab', async () => {
    const user = userEvent.setup();

    await addWeighIn({ at: new Date(2026, 0, 1).getTime(), weightKg: 100 });
    await addWeighIn({ at: new Date(2026, 0, 15).getTime(), weightKg: 97.5 });
    await addWeighIn({ at: new Date(2026, 1, 1).getTime(), weightKg: 95 });

    const mockProfileWithStartedAtJan1: Profile = {
      ...mockProfile,
      startedAt: new Date(2026, 0, 1).getTime(),
      startingWeightKg: 100,
    };

    render(<MainHub profile={mockProfileWithStartedAtJan1} onEdit={vi.fn()} />);

    // Click the My Journey tab
    const journeyTab = await screen.findByRole('tab', { name: /my journey/i });
    expect(journeyTab).toBeInTheDocument();
    await user.click(journeyTab);

    // Assert Weight progress section and chart are visible
    expect(screen.getByText('Weight progress')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /weight progress chart/i })).toBeInTheDocument();
  });
});
