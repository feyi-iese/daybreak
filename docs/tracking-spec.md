# Daybreak — Daily Tracking & Calendar Specification

> **Status:** Implementation blueprint. This document defines the UI, state, and component structure for adding daily calendar-centric tracking to Daybreak. It maps to the database schema established in `src/db/db.ts` version 3.
>
> **Grounding:** Competitive patterns in `docs/tracking-inspiration.md`; Dawn design system in `frontend/CLAUDE.md`.

---

## 1. Visual Architecture & Layout

The main view for authenticated users (where a profile exists and `editing` is false) will transition from a single Dashboard view into a **Tabbed Hub**. This separates daily logging interactions from long-term analytics.

```
+-------------------------------------------------+
|  Daybreak *                                    |
+-------------------------------------------------+
|  [ Daily Log ]                [ My Journey ]    |  <-- Tabs
+-------------------------------------------------+
|                                                 |
|  <  June 2026  >                                |  <-- Calendar Nav
|  Su  Mo  Tu  We  Th  Fr  Sa                      |
|  31  1   2   3   4   5   6   <-- Calendar Grid  |
|  .   .💊 .😊 .⚖️  .   .   .                      |
|                                                 |
|  +-------------------------------------------+  |
|  | Thursday, June 4                          |  |  <-- Day Detail
|  |                                           |  |
|  |  💊 Tirzepatide: 2.5 mg (Abdomen)         |  |
|  |  😊 Feelings: Nausea (Mild)               |  |
|  |  ⚖️ Weight: 80.0 kg                        |  |
|  |                                           |  |
|  |  [ + Log Vitals ]   [ Edit Logs ]         |  |
|  +-------------------------------------------+  |
|                                                 |
+-------------------------------------------------+
```

### 1.1 Core Navigation (Tabs)
The App Shell content area renders two sub-views:
1. **Daily Log (Default)**: Calendar grid, day selection, day details list, and logging entry triggers.
2. **My Journey**: Long-term progress metrics (BMI cards, SURMOUNT-1 target projection curves, and weight history line charts).

### 1.2 Calendar Component (Month Grid)
- **Month Switcher**: Labeled with month name and year (e.g., "June 2026"). Styled with `.section-title` for the text, with left/right `.btn-ghost` chevrons to navigate months.
- **Days of Week Headers**: Small uppercase letters (S, M, T, W, T, F, S) styled with `.section-label` and centered.
- **Grid Layout**: A `grid grid-cols-7 gap-y-2 text-center` container rendering 35 or 42 days.
- **Day Cells**:
  - Size: Circular buttons, `w-10 h-10 mx-auto flex flex-col items-center justify-center rounded-full transition relative`.
  - Non-current month days: Muted text color (`text-ink-muted`).
  - Current month days: Normal text color (`text-ink`).
  - Today: Outlined with a primary border (`border border-primary-500`).
  - Selected Day: Filled with a solid primary background (`bg-primary-500 text-cream-50`).
  - Hover/Focus state: `.shadow-lift` and soft teal overlay (`bg-primary-50`).
- **Indicator Dots**:
  - Placed directly below the day number within the cell.
  - Up to four small indicator shapes or dots corresponding to the logged categories:
    - 💊 **Drug**: Teal dot (`bg-primary-500`)
    - 😊 **Feelings**: Coral dot (`bg-accent-400`)
    - ❤️ **Vitals**: Amber dot (`bg-sun-400`)
    - ⚖️ **Weight**: Muted slate/brown dot (`bg-ink-soft`)
  - Screen readers must read the day's logged categories (e.g. *"June 4, logged: Dose, Feelings, Weight"*).

---

## 2. Daily Log Detail Panel

Below the calendar grid, a card surface (`.card`) displays the selected day's entries.

### 2.1 Title & Header
- Shows the full local date: e.g., "Thursday, June 4" (styled with `.section-title`).
- If the selected date is today, show a small `.chip` next to it labeled `"Today"`.

### 2.2 Content List
For each of the 4 categories, display an item card if a record exists for the selected day:
1. **Drug Log (💊)**:
   - Copy: `Dose: {dosage} mg ({site})` or `Dose: {dosage} mg` if no site.
   - Text color: `text-ink`.
   - Small timestamp footnote: e.g. *"Logged at 8:30 AM"*.
2. **Feeling Log (😊)**:
   - Copy: `Feelings: {symptomList} ({severity})` (e.g. *"Nausea, Fatigue (Mild)"*).
   - If no symptoms but logged: `"Feelings: Feeling great! 😊"`.
   - Notes: Displays the notes block inside a `.card-quiet` box if a note exists.
3. **Vital Log (❤️)**:
   - Copy: Displays a list of logged metrics, e.g. *"Blood Sugar: 95 mg/dL · BP: 120/80 mmHg · Heart Rate: 72 bpm · Waist: 85 cm"*.
4. **Weight Log (⚖️)**:
   - Copy: `Weight: {weight} {unit}` (e.g. *"Weight: 80.0 kg"*). Handles unit conversion on the display edge based on the profile unit preference.

### 2.3 Actions
- **Delete / Edit Trigger**: Each logged card item has a small `.btn-ghost` with an edit/delete icon or text label.
- **Empty State**: If nothing is logged for the day:
  - Copy: *"Nothing logged for this day yet. Ready to capture your progress?"* (styled with `.hero-sub`).
- **Quick-Add Buttons**:
  - Displayed as a flex row of buttons/chips for any category that is *not yet logged* for that day.
  - Labels: `+ Dose`, `+ Feelings`, `+ Vitals`, `+ Weight`.
  - Styled with `.btn .btn-ghost` and rounded pills.

---

## 3. Logging Forms & Modals

Each logging action opens a modal bottom sheet (`.card` with an absolute overlay, transitions, and backdrop shadow).

### 3.1 Common Form Header
- Title: `"Log {Category}"` (e.g. `"Log Weight"`).
- Subtitle: The target date, e.g. `"For Thursday, June 4"`.
- A close button (cross icon) in the top-right corner.

---

### 3.2 Drug Log Form (💊)
Allows recording a dose injection.
- **Dosage Selection**:
  - Input: A custom `.segmented` row or vertical list of Mounjaro/Zepbound pen strengths: `2.5 mg`, `5 mg`, `7.5 mg`, `10 mg`, `12.5 mg`, `15 mg`.
  - Default: Prefills the dosage from the *latest logged dose* (if any) or defaults to `2.5 mg`.
- **Injection Site Selection**:
  - Input: A `.segmented` row with options: `Abdomen`, `Thigh`, `Arm`, `None`.
  - Default: `None`.
- **Dose Date/Time**:
  - Input: A time picker or read-only timestamp corresponding to the selected day.
- **Validation**:
  - Dosage must be a positive number.
- **CTA**: `.btn-primary` labeled `"Record Dose"`.

---

### 3.3 Feeling Log Form (😊)
Allows recording symptoms and daily reflections.
- **Symptom Chips Grid**:
  - A scrollable multi-select grid of pill chips.
  - GLP-1 side effects options (sourced from FDA clinical warnings):
    - `Nausea`
    - `Vomiting`
    - `Diarrhea`
    - `Constipation`
    - `Decreased Appetite`
    - `Fatigue`
    - `Bloating`
    - `Heartburn`
    - `Abdominal Pain`
    - `Headache`
    - `Dizziness`
    - `Injection Site Reaction`
  - A positive baseline chip: `Feeling great! 😊` (mutual exclusion: selecting this unchecks all symptoms).
- **Severity Picker**:
  - Input: A `.segmented` toggle with options: `Mild`, `Moderate`, `Severe`.
  - Only visible if at least one symptom (excluding "Feeling great") is checked.
- **Daily Reflection / Note**:
  - Input: A text area styled with `.field-input` labeled `"Daily Note / Reflection"`.
  - Placeholder: *"How are you feeling today? Any changes in appetite, energy, or digestion?"*
- **CTA**: `.btn-primary` labeled `"Save Feelings"`.

---

### 3.4 Vitals Log Form (❤️)
Allows recording vital statistics.
- **Inputs**:
  - Blood Sugar: Number input, `.field-input` with unit suffix `"mg/dL"`. Min: 20, Max: 600.
  - Blood Pressure: Two side-by-side number inputs: Systolic (`mmHg`, min 50/max 250) and Diastolic (`mmHg`, min 30/max 150).
  - Heart Rate: Number input, `.field-input` with suffix `"bpm"`. Min: 30, Max: 220.
  - Waist Circumference: Number input, `.field-input` with unit suffix (`"cm"` or `"in"`, depending on profile height preference). Min: 30, Max: 250 cm. Converts automatically on edge.
- **Validation**:
  - Inputs are optional, but if entered they must fall within their respective logical minimum/maximum ranges.
- **CTA**: `.btn-primary` labeled `"Save Vitals"`.

---

### 3.5 Weight Log Form (⚖️)
Allows recording body weight.
- **Weight Entry**:
  - Input: A `WheelPicker` or numeric text field with unit label (`kg` / `lb` toggled automatically by profile preference).
  - Default: Prefills with the user's *latest logged weight* (or profile `startingWeightKg` if no logs exist).
- **Validation**:
  - Must be a number between 30 and 300 kg.
- **CTA**: `.btn-primary` labeled `"Save Weight"`.

---

## 4. Data Layer & Core Helpers

All helpers reside in `src/db/` and speak canonical units only (timestamps in local-time epoch-ms, weight in `kg`, waist in `cm`).

### 4.1 Daily Invariant Rules (Upsert)
To keep the charts and logs clean, we enforce a **single record per calendar day** for Vitals, Feelings, and Weight logs.
- **Weight / Feelings / Vitals**:
  - Before saving, query the store for any existing record on the target day.
  - If a record exists, update/overwrite it.
  - If no record exists, insert a new one.
- **Doses**:
  - Multiple doses *are* allowed on the same day (to handle split dosing or multiple meds), though they default to single entries.

### 4.2 CRUD helper exports in `src/db/`
Already written and tested in Phase 1:
- `addDose(dose)`, `updateDose(id, dose)`, `deleteDose(id)`, `listDoses()`, `getDosesForRange(start, end)`
- `addFeeling(feeling)`, `updateFeeling(id, feeling)`, `deleteFeeling(id)`, `listFeelings()`, `getFeelingsForRange(start, end)`
- `addVital(vital)`, `updateVital(id, vital)`, `deleteVital(id)`, `listVitals()`, `getVitalsForRange(start, end)`
- `addWeighIn(weighIn)`, `updateWeighIn(id, weighIn)`, `deleteWeighIn(id)`, `listWeighIns()`, `getWeighInsForRange(start, end)`

### 4.3 Aggregation Helper
Create a utility function to fetch all logs for a specific day in a single call:
```ts
export interface DailyLogDay {
  doses: Dose[];
  feeling?: FeelingLog;
  vital?: VitalLog;
  weighIn?: WeighIn;
}

export async function getLogsForDay(timestamp: number): Promise<DailyLogDay> {
  const { start, end } = getDayRange(timestamp);
  const [doses, feelings, vitals, weighIns] = await Promise.all([
    getDosesForRange(start, end),
    getFeelingsForRange(start, end),
    getVitalsForRange(start, end),
    getWeighInsForRange(start, end),
  ]);

  return {
    doses,
    feeling: feelings[0], // Single feeling per day invariant
    vital: vitals[0],     // Single vitals per day invariant
    weighIn: weighIns[0], // Single weight per day invariant
  };
}
```

---

## 5. Component Hierarchy & Flow

```
App.tsx
└── Shell.tsx
    ├── DailyLogView.tsx  (Tab 1)
    │   ├── Calendar.tsx
    │   ├── DayDetail.tsx
    │   └── LogModals (DrugModal, FeelingModal, VitalsModal, WeightModal)
    └── JourneyView.tsx   (Tab 2 - Dashboard and Charts)
```

### 5.1 `DailyLogView.tsx` (State management)
- Holds local state for the `selectedDate: number` (epoch ms, defaults to `Date.now()`).
- Holds local state for `activeModal: 'dose' | 'feeling' | 'vital' | 'weight' | null`.
- Pulls all logs for the currently selected month and populates the calendar dots.
- Re-fetches the current day's logs on date change or modal submit.

### 5.2 Edit Mode vs Create Mode in Modals
- If `getLogsForDay` returns an existing record for the selected date, the modal loads in **Edit Mode**:
  - The inputs prefill with the existing values.
  - The CTA button label changes to `"Save Changes"`.
  - A secondary `"Delete Entry"` `.btn-ghost` appears to let the user clear that day's log.

---

## 6. Accessiblity & Motion Spec

### 6.1 Keyboard Navigation on Calendar Grid
- The calendar grid represents a spreadsheet-like structure.
- Focus follows the selected date.
- Arrow keys navigate dates:
  - `ArrowLeft` / `ArrowRight` -> Navigate back/forward by 1 day.
  - `ArrowUp` / `ArrowDown` -> Navigate back/forward by 1 week (7 days).
  - Navigating out of the current month boundaries automatically transitions the calendar view to the previous/next month.

### 6.2 Modals Focus Lock
- Opening a modal sets a visual backdrop overlay.
- Trap focus within the modal container.
- Pressing `Escape` closes the modal immediately without saving.
- Re-focus the quick-add button or detail card that triggered the modal upon closing.

### 6.3 Motion & Transitions
- Tab switches transition opacity gently.
- Modals slide up from the bottom on mobile (`translate-y-0` from `translate-y-full`) and scale in on desktop.
- Reduced-motion is fully respected (durations set to `0s` globally if requested).

---

## 7. Edge Cases

1. **Future Dates**:
   - Limit calendar selections to the current date or earlier. Future days are disabled (`opacity-50 pointer-events-none`) for logging weight, doses, and feelings.
2. **Deleting the Last Weigh-In**:
   - If the user deletes a daily weight, the weight tracking chart falls back to the previous chronological entry. If all logs are deleted, it falls back to the Profile `startingWeightKg`.
3. **Timezone Adjustments**:
   - All dates are evaluated in the user's current local timezone. Timestamps are saved as epoch-ms and day keys are generated using local-time date strings (`YYYY-MM-DD`).
4. **Resets / Data Wipe**:
   - Tapping "Delete Entry" prompts for confirmation via a native confirm dialog before clearing the record.
