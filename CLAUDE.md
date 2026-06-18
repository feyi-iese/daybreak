# CLAUDE.md — Mounjaro / Weight Tracker (PWA)

A local-first personal health tracker: weigh-ins, weekly tirzepatide (Mounjaro)
doses, side effects, reflections, and vitals, with a progress chart. Single user
for now; no accounts. See `SPEC.md` for the full product spec and build phases.

> Keep this file lean. It holds *ambient rules that should always be true*.
> Repeatable procedures live in `.claude/skills/`. Hard, checkable rules live in
> hooks (`.claude/settings.json`). Don't let this file grow into a procedures doc.

## Stack

- React + Vite (TypeScript)
- Tailwind CSS for styling
- Dexie.js (IndexedDB) for all persisted data
- Recharts for the progress chart
- PWA (manifest + service worker) is added in a later phase, not up front

## Non-negotiable data rules

These prevent the classic unit-mixing bugs. Treat them as invariants:

- **Store canonical units only.** Weight in **kg**, height in **cm**, dose in
  **mg**, all timestamps as **epoch milliseconds** (a `number`).
- **Convert only at the display edges.** kg↔lb and cm↔ft/in conversions happen in
  formatting/parsing helpers right next to the UI — never in storage, never in
  business logic.
- **Never store derived values.** BMI, weight-to-lose, and progress percentages
  are computed on read, never written to the DB. BMI = `weightKg / (heightCm/100)**2`.
- **Dexie schema changes are versioned.** Adding or changing a store means bumping
  the Dexie version and adding a migration if data shape changes. See the
  `add-dexie-store` skill.

## Data model (stores)

- `profile` (singleton) — startingWeightKg, targetWeightKg, heightCm, unit prefs, startedAt
- `weighIns` — at, weightKg, note?
- `doses` — at, amountMg, site, note?
- `sideEffects` — at, symptoms[], severity?, note?
- `reflections` — at, doseId (the dose this reflection covers), text, mood?
- `vitals` — at, kind (e.g. 'glucose'), value, unit, note?

## Workflow rules

- **Build one slice at a time.** Scaffold or add one feature, run it in the
  browser, confirm it works, then commit. Don't batch multiple features into one
  change.
- **Commit per working slice** with a clear message, so any step can be rolled back.
- **Function before form.** Build features correct-but-unstyled first. Styling is a
  separate, dedicated pass once the design system is locked. Do **not** style
  components while implementing their behaviour — it produces inconsistent UI.
- UI conventions (tokens, spacing, component patterns) live in `frontend/CLAUDE.md`.

## Commands

- `npm run dev` — local dev server
- `npm run build` — production build / typecheck gate
- `npm run lint` — ESLint
- `npm run test` — unit tests

## Product guardrails (important)

This app records and summarizes user-entered data. It does **not** practice
medicine.

- The app never diagnoses, never gives medical or dosing advice, and never tells
  the user to change their treatment.
- "Estimated time to target" is a **rough projection** derived from published trial
  data (the SURMOUNT studies), shown as a range with a visible "individual results
  vary, not medical advice" caveat — never presented as a promise.
- Any AI-generated feature (e.g. the appointment summary) **only summarizes data the
  user actually logged.** It must not invent doses/symptoms or add clinical
  interpretation. This is enforced by evals — see `SPEC.md`.
