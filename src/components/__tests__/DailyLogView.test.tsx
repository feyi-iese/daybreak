import 'fake-indexeddb/auto';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
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

    // Select dosage (5 mg) and site (Thigh -> Right)
    const dosageBtn = screen.getByRole('button', { name: /^5 mg$/i });
    await user.click(dosageBtn);

    const siteBtn = screen.getByRole('radio', { name: /thigh right/i });
    await user.click(siteBtn);

    // Save
    const saveBtn = screen.getByRole('button', { name: /record dose/i });
    await user.click(saveBtn);

    // Verify it is logged on screen
    await waitFor(() => {
      expect(screen.getByText(/dose:/i)).toHaveTextContent(/dose: 5 mg \(thigh · right\)/i);
    });

    // Check DB
    expect(await db.doses.count()).toBe(1);
    const savedDose = (await db.doses.toArray())[0];
    expect(typeof savedDose.takenAt).toBe('number');

    // Verify visible Edit/Delete buttons are absent before swipe reveal
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();

    // Edit the dose
    const doseCard = screen.getByRole('button', { name: /dose:\s*5 mg/i });
    await user.click(doseCard);
    const newDosageBtn = screen.getByRole('button', { name: /^7.5 mg$/i });
    await user.click(newDosageBtn);

    const newSaveBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(newSaveBtn);

    // Verify updated on screen
    await waitFor(() => {
      expect(screen.getByText(/dose:/i)).toHaveTextContent(/dose: 7.5 mg \(thigh · right\)/i);
    });
  });

  it('handles medication switching and dynamic dosages', async () => {
    const user = userEvent.setup();
    render(<DailyLogView profile={mockProfile} />);

    // Open dose modal
    const logDoseBtn = screen.getByRole('button', { name: /\+ log dose/i });
    await user.click(logDoseBtn);

    // Modal appears
    expect(screen.getByRole('heading', { name: /log dose/i })).toBeInTheDocument();

    // Click Ozempic button/radio
    const ozempicBtn = screen.getByRole('radio', { name: /ozempic/i });
    await user.click(ozempicBtn);

    // Verify dynamic dosage grid
    expect(screen.getByRole('button', { name: /^0\.25 mg$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^0\.5 mg$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^1 mg$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^2 mg$/i })).toBeInTheDocument();

    // Select 1 mg
    const dose1mgBtn = screen.getByRole('button', { name: /^1 mg$/i });
    await user.click(dose1mgBtn);

    // Select a site: Abdomen - Upper L
    const siteBtn = screen.getByRole('radio', { name: /abdomen upper l/i });
    await user.click(siteBtn);

    // Save
    const saveBtn = screen.getByRole('button', { name: /record dose/i });
    await user.click(saveBtn);

    // Verify it is logged on screen
    await waitFor(() => {
      expect(screen.getByText(/dose:/i)).toHaveTextContent(/dose: 1 mg \(abdomen · upper l\)/i);
    });

    // Check DB record
    const recordedDoses = await db.doses.toArray();
    expect(recordedDoses).toHaveLength(1);
    expect(recordedDoses[0].name).toBe('Ozempic');
    expect(recordedDoses[0].dosageMg).toBe(1.0);
    expect(recordedDoses[0].injectionSite).toBe('abdomen-upper-left');
    expect(typeof recordedDoses[0].takenAt).toBe('number');
  });

  it('time picker persists and round-trips on edit', async () => {
    const user = userEvent.setup();
    render(<DailyLogView profile={mockProfile} />);

    // Open dose modal
    const logDoseBtn = screen.getByRole('button', { name: /\+ log dose/i });
    await user.click(logDoseBtn);

    // Set time to 14:30 using fireEvent (jsdom does not support userEvent.type on time inputs)
    const timeInput = screen.getByLabelText(/time taken/i);
    fireEvent.change(timeInput, { target: { value: '14:30' } });

    // Save
    const saveBtn = screen.getByRole('button', { name: /record dose/i });
    await user.click(saveBtn);

    // Verify DB record has correct takenAt
    const doses = await db.doses.toArray();
    expect(doses).toHaveLength(1);
    const takenDate = new Date(doses[0].takenAt!);
    expect(takenDate.getHours()).toBe(14);
    expect(takenDate.getMinutes()).toBe(30);

    // Verify footnote shows taken time
    await waitFor(() => {
      expect(screen.getByText(/taken at/i)).toBeInTheDocument();
    });

    // Edit the dose
    const doseCard = screen.getByRole('button', { name: /dose:\s*2.5 mg/i });
    await user.click(doseCard);

    // Verify time input is pre-filled with 14:30
    const editTimeInput = screen.getByLabelText(/time taken/i) as HTMLInputElement;
    expect(editTimeInput.value).toBe('14:30');

    // Change time to 09:00
    fireEvent.change(editTimeInput, { target: { value: '09:00' } });

    // Save changes
    const saveChangesBtn = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveChangesBtn);

    // Verify DB updated
    const updatedDoses = await db.doses.toArray();
    const updatedDate = new Date(updatedDoses[0].takenAt!);
    expect(updatedDate.getHours()).toBe(9);
    expect(updatedDate.getMinutes()).toBe(0);
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

    // Verify visible Edit/Delete buttons are absent before swipe reveal
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();

    // Delete it (opens the custom confirm dialog, no native window.confirm)
    const feelingsCard = screen.getByRole('button', { name: /feelings:\s*nausea, fatigue/i });

    const createPointerEvent = (type: string, props: { clientX: number; clientY: number; pointerId?: number }) => {
      const PointerEventClass = ((typeof PointerEvent !== 'undefined' ? PointerEvent : null) || (typeof MouseEvent !== 'undefined' ? MouseEvent : null) || Event) as new (type: string, dict?: EventInit) => Event;
      const event = new PointerEventClass(type, { bubbles: true, cancelable: true, ...props });
      Object.defineProperty(event, 'clientX', { get: () => props.clientX });
      Object.defineProperty(event, 'clientY', { get: () => props.clientY });
      return event;
    };

    fireEvent(feelingsCard, createPointerEvent('pointerdown', { pointerId: 1, clientX: 240, clientY: 20 }));
    fireEvent(feelingsCard, createPointerEvent('pointermove', { pointerId: 1, clientX: 130, clientY: 22 }));
    fireEvent(feelingsCard, createPointerEvent('pointerup', { pointerId: 1, clientX: 130, clientY: 22 }));
    const deleteBtn = await screen.findByRole('button', { name: /delete feelings log/i });
    await user.click(deleteBtn);
    const confirmBtn = await screen.findByRole('button', { name: /delete entry/i });
    await user.click(confirmBtn);

    // Empty state should return
    await waitFor(() => {
      expect(screen.getByText(/nothing logged/i)).toBeInTheDocument();
    });

    expect(await db.feelings.count()).toBe(0);
  });

  it('keyboard navigation reveals and hides delete button via ArrowLeft and Escape', async () => {
    const user = userEvent.setup();
    render(<DailyLogView profile={mockProfile} />);

    // Log a feelings entry
    const logFeelingBtn = screen.getByRole('button', { name: /\+ log feelings/i });
    await user.click(logFeelingBtn);
    const nauseaBtn = screen.getByRole('button', { name: /nausea/i });
    await user.click(nauseaBtn);
    const saveBtn = screen.getByRole('button', { name: /save feelings/i });
    await user.click(saveBtn);

    // Get the card
    const feelingsCard = await screen.findByRole('button', { name: /feelings:\s*nausea/i });

    // Focus and press ArrowLeft
    feelingsCard.focus();
    expect(feelingsCard).toHaveFocus();
    await user.keyboard('{ArrowLeft}');

    // Delete button should now be focusable/available in document
    const deleteBtn = screen.getByRole('button', { name: /delete feelings log/i });
    expect(deleteBtn).toBeInTheDocument();

    // Press Escape
    await user.keyboard('{Escape}');

    // Delete button should not be accessible/focusable (tabIndex -1, aria-hidden)
    expect(deleteBtn).toHaveAttribute('tabindex', '-1');
    expect(feelingsCard).toHaveFocus();
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
      expect(screen.getByText(/weight:/i)).toHaveTextContent(/weight: 82.5 kg/i);
    });
  });
});
