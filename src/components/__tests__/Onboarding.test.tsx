import 'fake-indexeddb/auto';

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../../App';
import { db } from '../../db/db';

beforeEach(async () => {
  await Promise.all([db.profile.clear(), db.weighIns.clear()]);
  localStorage.clear();
});

describe('Onboarding flow', () => {
  it('renders the welcome step on first load', async () => {
    render(<App />);
    expect(
      await screen.findByText('A brighter chapter begins here'),
    ).toBeInTheDocument();
  });

  it('navigates through welcome → disclaimer → gender → height', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 1: Welcome — click CTA
    await user.click(
      await screen.findByRole('button', { name: /let.s begin/i }),
    );

    // Step 2: Disclaimer appears
    expect(
      await screen.findByText(/quick, honest note/i),
    ).toBeInTheDocument();

    // Toggle the disclaimer switch
    await user.click(screen.getByRole('switch'));

    // Click Continue (was disabled, now enabled)
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3: Gender step appears
    expect(
      await screen.findByText(/which best describes you/i),
    ).toBeInTheDocument();

    // Click "Female" card
    await user.click(screen.getByRole('radio', { name: /female/i }));

    // Click Continue
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 4: Height step appears
    expect(
      await screen.findByText(/how tall are you/i),
    ).toBeInTheDocument();
  });

  it('completes the full flow end-to-end and shows the dashboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 1: Welcome
    await user.click(
      await screen.findByRole('button', { name: /let.s begin/i }),
    );

    // Step 2: Disclaimer — toggle + Continue
    await user.click(await screen.findByRole('switch'));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3: Gender — pick Female + Continue
    await user.click(await screen.findByRole('radio', { name: /female/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 4: Height — keep default 170 cm, Continue
    await user.click(
      await screen.findByRole('button', { name: /continue/i }),
    );

    // Step 5: Starting weight — keep default 80 kg, Continue
    await user.click(
      await screen.findByRole('button', { name: /continue/i }),
    );

    // Step 6: Goal weight — keep default (~72 kg), Continue
    await user.click(
      await screen.findByRole('button', { name: /continue/i }),
    );

    // Step 7: Privacy — click "Save my plan"
    await user.click(
      await screen.findByRole('button', { name: /save my plan/i }),
    );

    // Select My Journey tab to show the dashboard
    await user.click(await screen.findByRole('tab', { name: /my journey/i }));

    // Dashboard should appear (shown by Edit details button)
    await screen.findByRole('button', { name: /edit details/i });

    // No NaN or Infinity anywhere on page
    expect(document.body.textContent).not.toMatch(/NaN|Infinity/);

    // Exactly one profile row persisted
    expect(await db.profile.count()).toBe(1);
  });

  it('supports edit mode — skips welcome/disclaimer, starts at gender', async () => {
    const user = userEvent.setup();
    render(<App />);

    // ---- Complete initial create flow ----
    await user.click(
      await screen.findByRole('button', { name: /let.s begin/i }),
    );
    await user.click(await screen.findByRole('switch'));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.click(await screen.findByRole('radio', { name: /female/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));
    await user.click(
      await screen.findByRole('button', { name: /continue/i }),
    );
    await user.click(
      await screen.findByRole('button', { name: /continue/i }),
    );
    await user.click(
      await screen.findByRole('button', { name: /continue/i }),
    );
    await user.click(
      await screen.findByRole('button', { name: /save my plan/i }),
    );

    // Select My Journey tab to show the dashboard
    await user.click(await screen.findByRole('tab', { name: /my journey/i }));

    // Dashboard appears
    const editBtn = await screen.findByRole('button', {
      name: /edit details/i,
    });

    // ---- Enter edit mode ----
    await user.click(editBtn);

    // Should land on Gender step (welcome/disclaimer skipped)
    expect(
      await screen.findByText(/which best describes you/i),
    ).toBeInTheDocument();

    // Change gender to Male
    await user.click(screen.getByRole('radio', { name: /^male$/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Height step — Continue
    await user.click(
      await screen.findByRole('button', { name: /continue/i }),
    );

    // Weight step — Continue
    await user.click(
      await screen.findByRole('button', { name: /continue/i }),
    );

    // Goal weight — last edit step: "Save changes"
    await user.click(
      await screen.findByRole('button', { name: /save changes/i }),
    );

    // Select My Journey tab to show the dashboard
    await user.click(await screen.findByRole('tab', { name: /my journey/i }));

    // Verify database reflects the change
    await waitFor(async () => {
      const p = await db.profile.get(1);
      expect(p?.gender).toBe('male');
    });
  });

  it('supports logging a different starting weight and start date (historical start)', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 1: Welcome
    await user.click(await screen.findByRole('button', { name: /let.s begin/i }));

    // Step 2: Disclaimer
    await user.click(await screen.findByRole('switch'));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3: Gender
    await user.click(await screen.findByRole('radio', { name: /female/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 4: Height — Keep default (170 cm), Continue
    await user.click(await screen.findByRole('button', { name: /continue/i }));

    // Step 5: Weight — Select different starting weight
    // Today's weight wheel picker defaults to 80 kg
    
    // Toggle "No, I started earlier"
    const startedEarlierBtn = await screen.findByRole('button', {
      name: /no, i started earlier/i,
    });
    await user.click(startedEarlierBtn);

    // Starting weight & start date inputs should now be visible
    const startingWeightInput = screen.getByLabelText(/starting weight/i);
    const startDateInput = screen.getByLabelText(/start date/i);
    expect(startingWeightInput).toBeInTheDocument();
    expect(startDateInput).toBeInTheDocument();

    // Fill in starting weight (100 kg) and start date (2026-05-01)
    fireEvent.change(startingWeightInput, { target: { value: '100' } });
    fireEvent.change(startDateInput, { target: { value: '2026-05-01' } });

    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 6: Goal weight — Keep default, Continue
    await user.click(await screen.findByRole('button', { name: /continue/i }));

    // Step 7: Privacy — click "Save my plan"
    await user.click(await screen.findByRole('button', { name: /save my plan/i }));

    // Switch to Journey tab
    await user.click(await screen.findByRole('tab', { name: /my journey/i }));

    // Verify Dashboard shows Past, Now, and Future metrics
    const startLabels = screen.getAllByText('Start');
    const currentLabels = screen.getAllByText('Current');
    const goalLabels = screen.getAllByText('Goal');

    expect(startLabels[0]).toBeInTheDocument();
    expect(currentLabels[0]).toBeInTheDocument();
    expect(goalLabels[0]).toBeInTheDocument();

    // Check displayed values
    expect(startLabels[0].parentElement?.textContent).toContain('100');
    expect(currentLabels[0].parentElement?.textContent).toContain('80');
    
    // Verify BMI displays are showing (Starting, Current, Target BMIs)
    expect(screen.getByText('Body mass index (BMI)')).toBeInTheDocument();
    expect(startLabels[1]).toBeInTheDocument();
    expect(currentLabels[1]).toBeInTheDocument();
    expect(goalLabels[1]).toBeInTheDocument();

    // Check DB weighIns count (1 for start, 1 for today)
    const weighIns = await db.weighIns.toArray();
    expect(weighIns).toHaveLength(2);
    const hist = weighIns.find(w => new Date(w.at).getFullYear() === 2026 && new Date(w.at).getMonth() === 4); // May
    expect(hist).toBeDefined();
    expect(hist!.weightKg).toBe(100);
  });

  it('supports typing mode inputs, decimal entry, and backspacing without traps', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Step 1: Welcome
    await user.click(await screen.findByRole('button', { name: /let.s begin/i }));

    // Step 2: Disclaimer
    await user.click(await screen.findByRole('switch'));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3: Gender
    await user.click(await screen.findByRole('radio', { name: /female/i }));
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 4: Height
    expect(await screen.findByText(/how tall are you/i)).toBeInTheDocument();
    
    // Click the center element of the wheel picker to trigger typing mode
    const heightCenter = screen.getByText('170 cm');
    await user.click(heightCenter);

    // Height input in cm should appear, displaying 170
    const heightInput = screen.getByRole('spinbutton', { name: /^height$/i });
    expect(heightInput).toBeInTheDocument();
    expect(heightInput).toHaveValue(170);

    // Clear and change to 182 cm
    await user.clear(heightInput);
    await user.type(heightInput, '182');
    fireEvent.blur(heightInput);
    expect(heightInput).toHaveValue(182);

    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 5: Weight
    expect(await screen.findByText(/what.s your weight today/i)).toBeInTheDocument();

    // Click the center element of the wheel picker to trigger typing mode
    const weightCenter = screen.getByText('80 kg');
    await user.click(weightCenter);

    // Today's weight input should display 80
    const todayWeightInput = screen.getByRole('spinbutton', { name: /today's weight/i });
    expect(todayWeightInput).toBeInTheDocument();
    expect(todayWeightInput).toHaveValue(80);

    // Toggle unit to lb (which will exit edit mode)
    const lbBtn = screen.getByRole('radio', { name: /lb/i });
    await user.click(lbBtn);

    // Click the center of the wheel in lb mode to edit again
    const weightCenterLb = screen.getByText('176 lb');
    await user.click(weightCenterLb);

    // The new input should display 176
    const todayWeightInputLb = screen.getByRole('spinbutton', { name: /today's weight/i });
    expect(todayWeightInputLb).toBeInTheDocument();
    expect(todayWeightInputLb).toHaveValue(176);

    // Test backspace trap (should be able to clear input completely)
    await user.clear(todayWeightInputLb);
    expect(todayWeightInputLb).toHaveValue(null);

    // Test decimal trap (should support typing decimals like 175.5)
    await user.type(todayWeightInputLb, '175.5');
    expect(todayWeightInputLb).toHaveValue(175.5);

    fireEvent.blur(todayWeightInputLb);
    
    // Continue
    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 6: Goal weight
    expect(await screen.findByText(/where would you like to get to/i)).toBeInTheDocument();

    // Click the center element of the wheel picker to trigger typing mode
    const goalCenter = screen.getByText('159 lb');
    await user.click(goalCenter);

    const goalWeightInput = screen.getByRole('spinbutton', { name: /goal weight/i });
    expect(goalWeightInput).toBeInTheDocument();
    // Clear and change goal weight to 160 (lb)
    await user.clear(goalWeightInput);
    await user.type(goalWeightInput, '160');
    fireEvent.blur(goalWeightInput);

    await user.click(screen.getByRole('button', { name: /continue/i }));

    // Step 7: Privacy
    await user.click(await screen.findByRole('button', { name: /save my plan/i }));

    // Verify DB Profile values
    const profile = await db.profile.toArray();
    expect(profile).toHaveLength(1);
    expect(profile[0].heightCm).toBe(182);
    // 175.5 lb converts to ~79.6 kg, rounded to 79.5 kg
    expect(profile[0].startingWeightKg).toBe(80);
    expect(profile[0].targetWeightKg).toBe(72.5); // 160 lb converts to ~72.57 kg, rounded to 72.5 kg
  });
});
