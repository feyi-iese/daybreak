import 'fake-indexeddb/auto';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../../App';
import { db } from '../../db/db';

beforeEach(async () => {
  await db.profile.clear();
});

async function fillAndSubmit() {
  const user = userEvent.setup();
  await user.selectOptions(await screen.findByLabelText(/gender/i), 'female');
  await user.type(screen.getByLabelText(/height/i), '180');
  await user.type(screen.getByLabelText(/starting weight/i), '100');
  await user.type(screen.getByLabelText(/goal weight/i), '70');
  await user.click(screen.getByRole('button', { name: /save/i }));
}

describe('App — profile form & BMI dashboard', () => {
  it('renders the profile form fields on first load', async () => {
    render(<App />);

    // getProfile() resolves to undefined (cleared store) -> the form renders.
    expect(await screen.findByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/height/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/starting weight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/goal weight/i)).toBeInTheDocument();
  });

  it('saves the inputs and shows the dashboard with starting & target BMI', async () => {
    render(<App />);
    await fillAndSubmit();

    // computeBmi(100, 180) = 30.86... -> 30.9, classified Obese (>= 30).
    expect(await screen.findByText(/30\.9/)).toBeInTheDocument();
    expect(screen.getByText('Obese')).toBeInTheDocument();

    // computeBmi(70, 180) = 21.60... -> 21.6, classified Normal ([18.5, 25)).
    expect(screen.getByText(/21\.6/)).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();

    // Entered inputs echoed back on the dashboard.
    expect(screen.getByText('Female')).toBeInTheDocument();
    expect(screen.getByText(/180/)).toBeInTheDocument();
    expect(screen.getByText(/100/)).toBeInTheDocument();
    expect(screen.getByText(/70/)).toBeInTheDocument();
  });

  it('persists the profile as a single singleton row', async () => {
    render(<App />);
    await fillAndSubmit();

    // Wait for the dashboard, which only renders after the save round-trips.
    await screen.findByText(/30\.9/);

    expect(await db.profile.count()).toBe(1);
  });
});
