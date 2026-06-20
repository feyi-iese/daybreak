import 'fake-indexeddb/auto';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../../App';
import { db } from '../../db/db';

beforeEach(async () => {
  await db.profile.clear();
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

    // Dashboard should reflect the gender change
    expect(await screen.findByText('Male')).toBeInTheDocument();
  });
});
