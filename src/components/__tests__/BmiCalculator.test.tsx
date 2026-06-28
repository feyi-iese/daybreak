import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BmiCalculator from '../BmiCalculator';
import type { Profile } from '../../db/db';

const mockProfileKgCm: Profile = {
  gender: 'female',
  heightCm: 180,
  startingWeightKg: 100,
  targetWeightKg: 75,
  startedAt: 1,
  disclaimerAcceptedAt: 1,
  weightUnit: 'kg',
  heightUnit: 'cm',
};

const mockProfileLbFtIn: Profile = {
  gender: 'female',
  heightCm: 180,
  startingWeightKg: 100,
  targetWeightKg: 75,
  startedAt: 1,
  disclaimerAcceptedAt: 1,
  weightUnit: 'lb',
  heightUnit: 'ftin',
};

describe('BmiCalculator', () => {
  it('renders correctly with initial kg/cm profile', () => {
    render(<BmiCalculator profile={mockProfileKgCm} currentWeightKg={100} />);

    expect(screen.getByText('Explore your BMI horizon')).toBeInTheDocument();
    expect(screen.getByText('180 cm')).toBeInTheDocument();

    const resultGroup = screen.getByRole('group', { name: /bmi simulation result/i });
    expect(resultGroup).toBeInTheDocument();
    expect(resultGroup).toHaveTextContent('30.9');
    expect(resultGroup).toHaveTextContent('Obese');

    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
  });

  it('renders BMI category labels and ranges without abbreviated labels', () => {
    render(<BmiCalculator profile={mockProfileLbFtIn} currentWeightKg={100} />);

    for (const label of ['Underweight', 'Normal', 'Overweight', 'Obese']) {
      const labelNodes = screen.getAllByText(label);
      expect(labelNodes.length).toBeGreaterThan(0);
      for (const node of labelNodes) {
        expect(node).not.toHaveClass('truncate');
      }
    }

    expect(screen.getAllByText(/\blb\b/).length).toBeGreaterThan(0);
  });

  it('updates BMI when the simulated weight slider is moved', () => {
    render(<BmiCalculator profile={mockProfileKgCm} currentWeightKg={100} />);

    const slider = screen.getByRole('slider', { name: /simulated weight slider/i });
    fireEvent.change(slider, { target: { value: '80' } });

    const resultGroup = screen.getByRole('group', { name: /bmi simulation result/i });
    expect(resultGroup).toHaveTextContent('24.7');
    expect(resultGroup).toHaveTextContent('Normal');

    expect(slider).toHaveAttribute(
      'aria-valuetext',
      expect.stringContaining('80.0 kg, BMI 24.7, Normal')
    );

    const directInput = screen.getByRole('spinbutton', { name: /simulated weight/i });
    expect(directInput).toHaveValue(80);
  });

  it('edits simulated weight directly from the value pill for lb profiles', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator profile={mockProfileLbFtIn} currentWeightKg={100} />);

    expect(screen.getByText("5'11\"")).toBeInTheDocument();
    expect(screen.queryByLabelText(/exact weight/i)).not.toBeInTheDocument();

    const directInput = screen.getByRole('spinbutton', { name: /simulated weight/i });
    await user.click(directInput);
    expect(directInput).toHaveFocus();
    await user.clear(directInput);
    await user.type(directInput, '176');
    fireEvent.blur(directInput);

    const resultGroup = screen.getByRole('group', { name: /bmi simulation result/i });
    expect(resultGroup).toHaveTextContent('24.6');
    expect(resultGroup).toHaveTextContent('Normal');
    expect(directInput).toHaveValue(176);
  });
  it('sets the simulated weight to presets when clicked', async () => {
    const user = userEvent.setup();
    render(<BmiCalculator profile={mockProfileKgCm} currentWeightKg={100} />);

    const goalBtn = screen.getByRole('button', { name: /^goal$/i });
    await user.click(goalBtn);

    const resultGroup = screen.getByRole('group', { name: /bmi simulation result/i });
    // 75 kg at 180 cm is 23.1 BMI
    expect(resultGroup).toHaveTextContent('23.1');
    expect(resultGroup).toHaveTextContent('Normal');
  });
});
