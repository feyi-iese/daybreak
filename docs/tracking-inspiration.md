# Daily Tracking Inspiration — Calendar, Logging, Weight & Medicine

> Source: Mobbin MCP (iOS), reviewed 2026-06-18. Screens visually examined.
> Context: Daybreak needs a calendar-centric daily tracking flow for 4 entry types: Drug (name, dosage), Side effects / feelings, Vitals / health metrics, and Weight.

## Flows & screens examined

**Clue** — [Tracking a day (13)](https://mobbin.com/flows/e46cdccc-ae15-4b42-84eb-43505a7e78b0) · [Calendar (6)](https://mobbin.com/flows/d2db995c-ed1b-4ddb-99e7-dbbc9b08c36d) · [Daily feeling (6)](https://mobbin.com/flows/3af335a3-5697-4722-879f-d401f1c62643)
**Flo** — [Today (9)](https://mobbin.com/flows/c3f6291a-5ff6-43be-ab0a-6bb8f1240f68) · [Logging symptoms (17)](https://mobbin.com/flows/22df520b-6764-4b62-833c-186ab412ac03) · [Weight chart (2)](https://mobbin.com/flows/659f2fa9-6944-4326-a2c8-f72d803802f7)
**MacroFactor** — [Logging all data (5)](https://mobbin.com/flows/bc4b2a5a-5d45-40c0-b825-7c8f15796018) · [Food log (4)](https://mobbin.com/flows/5111892c-3bba-4c09-a885-a86364534611)
**MyFitnessPal** — [Today (4)](https://mobbin.com/flows/c7d3b0bb-5381-4a07-920a-0a0a36e8226e) · [Diary Log (6)](https://mobbin.com/flows/470559bf-5427-4fa0-851f-86e8b8c943fa) · [Weight (2)](https://mobbin.com/flows/bf956a96-372a-47ec-99b0-cc884efda5b8)
**Epsy** (epilepsy tracker) — [Medication logging screens](https://mobbin.com/screens/edd9e352-63f8-40b9-9b7a-dfd7876a625d) · [Calendar timeline](https://mobbin.com/screens/aadcc83e-99ee-47a0-8b89-03e75f3e0828)
**Apple Health** — [Medications](https://mobbin.com/screens/19cc770b-a386-48a5-9d6b-7a46a8c98685)

---

## Pattern 1: Calendar as the anchor

### Clue — month grid with colored dots per day
- Full month calendar grid. Each day cell has small **colored indicator dots** showing what was tracked (e.g. period = red band, symptoms = orange dots, feelings = purple). Tapping a day scrolls to a detail panel below: *"Tracked on Aug 12 · Cycle day 3"* with a categorized list (Period: Light, Feelings: Not in control, Sleep quality: Woke up tired, Pain: Cramps – Mild, Weight: 50 kg) — each row a tappable chevron to edit. An **Edit** button at the bottom opens the logging sheet.
- **Filter** toggle at top lets you focus on one category (e.g. just weight, just feelings).
- **Key insight**: the calendar IS the history — glanceable, color-coded, tap-to-detail. Exactly the "history at a glance with today as default" Daybreak wants.

### MacroFactor — habit-streak calendar with category tabs
- Month calendar with circular indicators: **filled circle** = tracked, **empty circle** = untracked. A "Longest Current Streak: 29 days" banner motivates.
- Below the calendar: **category tabs** (All | Weight | Nutrition | Period | Metrics) filter the dots.
- Tapping a day opens a **day-entry form** with sections: Weight (lbs + body fat %), Nutrition (energy/protein/fat/carbs), and "Day Properties" (boolean toggles: "Are you fasting?" / "Are you on your period?").
- **Key insight**: streak gamification + category-filtered calendar + structured day form is a clean model for our 4 entry types.

### Epsy — calendar with icon legend
- Month grid with small colored icons per day: lightning bolt (seizure), clock (medication taken late), pill marker (missed medication). A legend at top explains the icons.
- **Day/Month toggle** switches between daily timeline and monthly overview.
- **Key insight**: icon legend is essential when a calendar encodes multiple event types. Daybreak needs a legend for its 4 entry types (drug 💊, feeling 😊, vitals ❤️, weight ⚖️).

---

## Pattern 2: Today screen / daily hub

### Flo — horizontal week strip with "Today" anchor
- A **horizontal S M T W T F S week strip** at top, with today circled and highlighted. Arrows or swipe navigate weeks. Below: the day's status hero ("Period in 14 days"), then a scrollable "My daily insights · Today" section with contextual card prompts ("Log your symptoms", "Symptoms to expect", content articles).
- Tapping "Log your symptoms" opens a categorized multi-select sheet with chip-style options: *Symptoms* (Everything is fine, Cramps, Headache, Fatigue, Backache…), *Vaginal discharge*, *Water*, *Weight*, *Basal temperature* — each with dedicated UI. Weight shows a large number + "View chart" link + edit/delete icons. Symptom chips have small emoji-like icons and toggle on/off.
- **Key insight**: the week strip is perfect for "always today, swipe to navigate." Flo's logging is a **bottom sheet with chip toggles** — fast, one-tap, no keyboard.

### MyFitnessPal — "Today" dashboard cards
- Dashboard labeled "Today" with horizontally swipeable metric cards: Calories (donut ring showing remaining), Steps, Exercise. Below: Weight ("70 kg, Logged Wednesday, Mar 4") + a "Search for a food" bar pinned at bottom.
- The diary (separate tab) is a vertical scroll: Breakfast → Lunch → Dinner → Snacks → "Complete diary" → Healthy habits (Water, Exercise, Steps) → Weight.
- **Key insight**: the "Today" card layout is familiar but heavy for our simpler use case. The **inline weight card with last-logged date** is a good lightweight pattern.

---

## Pattern 3: Medicine / dose logging

### Apple Health — Medications
- "Today, September 23" header with a horizontal **S M T W T F S week strip** (today highlighted with a blue dot). Below: a "Log" section with the scheduled medication (name: Magnesium, time: 9:25 PM), a **+** button to log as-needed meds, and a "Logged" section showing confirmed entries with a green checkmark and timestamp ("9:30 PM, Just now").
- **Key insight**: Log vs. Logged split. Simple: scheduled med appears as a prompt → tap → it moves to "Logged" with timestamp. Our tirzepatide is weekly, so the prompt appears once/week.

### Epsy — Taken / Not Taken binary
- A full-screen prompt: *"Have you logged your medication?"* showing the drug (phenytoin, 500mg), due time (Due 8:00 AM), with a "Taken Late?" option. Two large buttons: **Taken** (filled purple) / **Not Taken** (outline). Clean, unambiguous, binary.
- **Key insight for Daybreak**: tirzepatide is a once-weekly injection. The logging prompt should be similarly binary + simple: drug name (Mounjaro/tirzepatide), dose (2.5/5/7.5/10/12.5/15 mg — fixed set of pen strengths), injection site (optional), and **Taken / Skip** buttons. Injection site could be a body-part tap selector in a future phase.

---

## Pattern 4: Side effects / feelings logging

### Clue — emoji/icon grid with tap-to-select
- Full-screen sheet: "How do you feel today?" with a 4×3 grid of illustrated weather-face icons: Mood swings, Not in control, Fine, Happy, Sad, Sensitive, Angry, Confident, Excited, Irritable, Anxious, Insecure. Tap one or more → Save.
- **Key insight**: the icon grid is instantly scannable and low-effort. For GLP-1 side effects, map to common symptoms: Nausea, Vomiting, Diarrhea, Constipation, Decreased appetite, Fatigue, Bloating, Heartburn, Abdominal pain, Injection site reaction, Dizziness, Headache (sourced from FDA label in our research doc). Allow multi-select.

### Flo — categorized chip sections with Apply
- A scrollable sheet with labeled sections (Symptoms, Vaginal discharge, etc.). Each section has **pill-shaped chips** with small icons. Chips toggle on/off with a pink highlight. "Apply" button at bottom persists.
- **Key insight**: categorized chip multi-select is the strongest pattern for symptom logging — fast, visual, doesn't require typing. For Daybreak, a single "How are you feeling?" section with GLP-1-relevant symptom chips, plus an optional severity (mild/moderate/severe) or free-text note.

---

## Pattern 5: Weight tracking over time

### Flo — weight chart
- Full-screen line chart, X-axis = dates (Feb → Mar), Y-axis = weight. A "Target" dashed line at the goal weight. Current weight labeled inline (131.3). Clean, minimal, shows trend.

### MyFitnessPal — Measurements
- "Measurements" screen with tabs: **Weight** (selected) and a chart/list toggle. Header shows Start / Current / Change (70 kg / 70 kg / 0 kg, 0%). Below: a simple **line chart** (6-week window) and an **Entries** list (each entry: weight + date, with a camera icon for progress photos). A **+** button to add.
- **Key insight**: the Start/Current/Change summary header is directly portable to Daybreak. The entries-below-chart pattern gives both the trend and the raw log.

---

## Recommended Daybreak tracking architecture

### Home = Calendar + Today
- **Month calendar grid** (Clue-style) as the primary view, with small colored icons per day indicating what was logged (💊 drug, 😊 feeling, ❤️ vitals, ⚖️ weight). Today highlighted; tap any day to see/edit entries.
- **Today is always the default view** — the calendar auto-scrolls to the current month with today's date circled/highlighted.
- A **week strip** (Flo-style) above the calendar gives quick navigation.
- Below the calendar: **today's detail panel** showing what's been logged and quick-add prompts for missing entry types.

### Entry types (4 categories, each a bottom sheet or inline card)

1. **Drug** (💊): Binary prompt "Did you take your dose?" → name (Mounjaro/tirzepatide, pre-filled from profile), dosage (select from 2.5/5/7.5/10/12.5/15 mg pen strengths), optional injection site, date (defaults to today, editable for past entries). Taken/Skip buttons (Epsy pattern). Weekly cadence — the prompt appears once/week.

2. **How are you feeling** (😊): Chip-grid multi-select (Flo/Clue hybrid) with GLP-1-relevant symptoms: Nausea, Vomiting, Diarrhea, Constipation, Decreased appetite, Fatigue, Bloating, Heartburn, Abdominal pain, Injection site pain, Dizziness, Headache, plus "Feeling great!" positive option. Optional severity per symptom (mild/moderate/severe) and a free-text note field.

3. **Vitals** (❤️): A structured form (MacroFactor-style): Blood sugar (mg/dL), Blood pressure (sys/dia mmHg), Heart rate (bpm), Waist circumference (cm). All optional — log what you have. "View chart" links per metric.

4. **Weight** (⚖️): Prominent number entry (wheel picker or numpad, kg with lb toggle). Shows Start / Current / Change header (MFP pattern). "View chart" → weight timeline with goal line (Flo pattern).

### Past entries
- Tap any calendar day → see that day's logged entries. An **Add** button lets you create entries for past days (useful for catching up).
- Each entry is editable and deletable from the day detail view.

### Calendar indicators
- Each day cell shows small colored dots or icons (Clue/Epsy style) for logged entry types. A subtle legend at top explains the icons.
- Days with no entries are plain. Days with entries get dots. Today gets a ring/highlight regardless.

### Streak / consistency (optional, MacroFactor-inspired)
- A "Current streak: N days" banner motivates consistent logging.
- Category filter tabs below the calendar (All | Drug | Feelings | Vitals | Weight) let you focus the view.
