import 'fake-indexeddb/auto';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DailyLogView from '../tracking/DailyLogView';
import { db } from '../../db/db';

const mockProfile = {
  gender: 'female' as const,
  heightCm: 170,
  startingWeightKg: 80,
  targetWeightKg: 72,
  startedAt: Date.now(),
  disclaimerAcceptedAt: Date.now(),
  weightUnit: 'kg' as const,
  heightUnit: 'cm' as const,
};

beforeEach(async () => {
  await Promise.all([
    db.doses.clear(),
    db.feelings.clear(),
    db.vitals.clear(),
    db.weighIns.clear(),
  ]);
  vi.spyOn(window, 'confirm').mockImplementation(() => true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DailyLogView Integration Flow', () => {
  it('renders calendar and shows empty state initially', async () => {
    render(<DailyLogView profile={mockProfile} />);

    // Should display current month header (e.g. "June 2026" or active month)
    const monthHeader = screen.getByRole('heading', { level: 2 });
    expect(monthHeader).toBeInTheDocument();

    // Empty state text
    expect(
      screen.getByText(/nothing logged for this day yet/i)
    ).toBeInTheDocument();
  });

  it('can log and edit a dose entry', async () => {
    const user = userEvent.setup();
    render(<DailyLogView profile={mockProfile} />);

    // Open dose modal
    const logDoseBtn = screen.getByRole('button', { name: /\+ log dose/i });
    await user.click(logDoseBtn);

    // Modal appears
    expect(screen.getByRole('heading', { name: /log dose/i })).toBeInTheDocument();

    // Select dosage (5 mg) and site (Thigh)
    const dosageBtn = screen.getByRole('button', { name: /^5 mg$/i });
    await user.click(dosageBtn);

    const siteBtn = screen.getByRole('button', { name: /^thigh$/i });
    await user.click(siteBtn);

    // Save
    const saveBtn = screen.getByRole('button', { name: /record dose/i });
    await user.click(saveBtn);

    // Verify it is logged on screen
    await waitFor(() => {
      expect(screen.getByText(/dose: 5 mg \(thigh\)/i)).toBeInTheDocument();
    });

    // Check DB
    expect(await db.doses.count()).toBe(1);

    // Edit the dose
    const editBtn = screen.getByRole('button', { name: /edit/i });
    await user.click(editBtn);

    const newDosageBtn = screen.getByRole('button', { name: /^7.5 mg$/i });
    await user.click(newDosageBtn);

    const newSaveBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(newSaveBtn);

    // Verify updated on screen
    await waitFor(() => {
      expect(screen.getByText(/dose: 7.5 mg \(thigh\)/i)).toBeInTheDocument();
    });
  });

  it('can log and delete feelings and symptoms', async () => {
    const user = userEvent.setup();
    render(<DailyLogView profile={mockProfile} />);

    // Open feelings modal
    const logFeelingBtn = screen.getByRole('button', { name: /\+ log feelings/i });
    await user.click(logFeelingBtn);

    // Select symptoms
    const nauseaBtn = screen.getByRole('button', { name: /nausea/i });
    await user.click(nauseaBtn);

    const fatigueBtn = screen.getByRole('button', { name: /fatigue/i });
    await user.click(fatigueBtn);

    // Set note
    const noteInput = screen.getByLabelText(/daily reflection \/ notes/i);
    await user.type(noteInput, 'Felt tired');

    // Save
    const saveBtn = screen.getByRole('button', { name: /save feelings/i });
    await user.click(saveBtn);

    // Verify logged on screen
    await waitFor(() => {
      expect(screen.getByText(/feelings: nausea, fatigue/i)).toBeInTheDocument();
      expect(screen.getByText(/“felt tired”/i)).toBeInTheDocument();
    });

    // Delete it
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteBtn);

    // Empty state should return
    await waitFor(() => {
      expect(screen.getByText(/nothing logged/i)).toBeInTheDocument();
    });

    expect(await db.feelings.count()).toBe(0);
  });

  it('can log vitals', async () => {
    const user = userEvent.setup();
    render(<DailyLogView profile={mockProfile} />);

    const logVitalsBtn = screen.getByRole('button', { name: /\+ log vitals/i });
    await user.click(logVitalsBtn);

    const sugarInput = screen.getByLabelText(/blood sugar/i);
    await user.type(sugarInput, '98');

    const sysInput = screen.getByRole('spinbutton', { name: /systolic bp/i });
    await user.type(sysInput, '120');

    const diaInput = screen.getByRole('spinbutton', { name: /diastolic bp/i });
    await user.type(diaInput, '80');

    const saveBtn = screen.getByRole('button', { name: /save vitals/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/sugar:/i)).toBeInTheDocument();
      expect(screen.getByText(/98/)).toBeInTheDocument();
      expect(screen.getByText(/120\/80/)).toBeInTheDocument();
    });
  });

  it('can log and convert weight', async () => {
    const user = userEvent.setup();
    render(<DailyLogView profile={mockProfile} />);

    const logWeightBtn = screen.getByRole('button', { name: /\+ log weight/i });
    await user.click(logWeightBtn);

    const weightInput = screen.getByLabelText(/body weight/i);
    await user.type(weightInput, '82.5');

    const saveBtn = screen.getByRole('button', { name: /save weight/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/weight: 82.5 kg/i)).toBeInTheDocument();
    });
  });
});
