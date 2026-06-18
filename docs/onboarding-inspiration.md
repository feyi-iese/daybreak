# Onboarding Inspiration — Clue, Flo, Atoms, MacroFactor, MyFitnessPal

> Source: Mobbin MCP (iOS), reviewed 2026-06-18. Screens visually examined for onboarding flows only.

## Flows examined

- **Clue** — [Onboarding (27 screens)](https://mobbin.com/flows/81768b19-ba24-44c3-9846-8a46a78f6e0d)
- **Flo** — [Onboarding (12)](https://mobbin.com/flows/d64dd348-5de3-40d0-8e2a-1fa781dad065) · [Account/profile setup (34)](https://mobbin.com/flows/541b7fd0-025b-417a-8d74-0185217879ff)
- **Atoms** — [Onboarding (21)](https://mobbin.com/flows/e66e43ab-81b3-4b95-adb2-3d5855f5674c)
- **MacroFactor** — [Goal setup (11)](https://mobbin.com/flows/803e7f39-4850-4d28-86a4-8e22ed2fd77b) · [New goal (16)](https://mobbin.com/flows/cc700e5f-76fd-4ac4-8936-6995530e7ba3)
- **MyFitnessPal** — [Onboarding (24)](https://mobbin.com/flows/6ec621e1-1a65-468d-b979-0e8258d0808b) · [Goals (3)](https://mobbin.com/flows/642b8b00-db61-41ec-90f6-093cabdcb14e) · [Diary Complete projection](https://mobbin.com/screens/f350523d-6314-45b7-bfdf-7ed620b78247)

---

## Shared onboarding patterns

1. **Splash/value first, questions later.** Clue flower logo, Flo feather (pink gradient), Atoms wordmark + "Tiny changes, remarkable results", MacroFactor leads with a disclaimer. Nobody asks for data cold.
2. **Privacy/consent is its own deliberate screen, early.** Clue "You and Clue" (3 explicit checkboxes), Flo "Your body. Your data — never shared… delete anytime" (shield illustration + 2 toggles), MacroFactor "Notice / Health Disclaimer" (2 toggles), Atoms "Continue with an account" consent sheet. Trust is a step, not fine print.
3. **Goal/intent up front as big tappable cards.** Clue "What would you like to do with Clue?" (multi-select, 6 icon cards), Flo "Are you pregnant?" (3 pills) + "What can we help you do?" (multi-select), MacroFactor "What is your goal?" (Lose/Maintain/Gain). One decision per screen.
4. **Progress bar + escape hatches.** Atoms, Flo-setup, and MacroFactor show a top progress bar; Flo has Skip, Clue has "Prefer not to share now", MacroFactor has Back/Next. Always finite, always opt-out-able.
5. **Tap-first, keyboard-last.** MacroFactor target weight is a wheel picker (124 | **125** | 126 lbs), not a text field. Keyboards appear only for genuinely free text (Atoms name, email code).
6. **Personalization → payoff.** Flo shows "Your next period will start around March 29" (a real prediction) before asking for notifications; MacroFactor frames "Almost There — we'll build your program… adapts every week." The questions get rewarded.
7. **Permission/account priming, deferred.** Flo soft-asks notifications (value first, OS prompt next screen); Atoms uses email-code verify mid-flow; signup never blocks personalization.

---

## Standouts per app

### Clue — calm, science-forward, inclusive
- Research-transparency on sensitive data: the health-conditions screen explains data is de-identified, used for research, with per-item control and a plain "Prefer not to share now."
- Gender-inclusive, non-judgmental language throughout.
- Privacy as a brand pillar, stated plainly (GDPR, doesn't sell data).

### Flo — deep personalization that still feels caring
- Longest flow (34-screen profile build) made bearable by empathetic copy, constant reassurance, and an anonymous mode.
- Mid-flow prediction payoff ("Your next period will start around March 29") earns the notification permission.
- Mode switching (cycle ↔ pregnancy) reshapes the product around a life stage.

### Atoms — identity-based onboarding (sell a mindset, not fields)
- Frames questions around "who do you want to become" rather than raw data; reflective, philosophical prompts.
- Ultra-minimal typographic calm; warm amber gradient (strikingly close to our Dawn palette).
- Ends by flowing straight into creating the first habit — no dead-end, immediate momentum.

### MacroFactor — transparent science + user control
- Dedicated Health Disclaimer step ("educational… not medical advice… consult a professional") with gated toggles — the strongest match for a medical-adjacent app.
- Wheel pickers for precise weight/height — no keyboard.
- Transparent safety guardrails: the calorie-floor screen warns when your goal rate is unsafe and recommends slowing down. No dark patterns.


### MyFitnessPal — the target-time estimation pattern
- **Two-part projection system**: (1) During onboarding, after entering height/weight/goal, a "What is your weekly goal?" screen offers rate presets (0.2 / **0.5 (Recommended)** / 0.8 / 1.0 kg/week). (2) A **"How much change are you ready for?"** screen with a pace slider labeled "Steady change (Recommended)" shows a **live projection graph** — a curve from current weight (70.0 kg) to goal (75.0 kg) with month markers (Apr → Jun → Aug). The graph updates as you drag the slider.
- **Diary Complete projection**: After logging a full day, MFP shows: *"If every day were like today, in 5 weeks, you'd weigh **75.1 kg***" with a caveat: *"Your projected weight is an estimate based on your total net calories for today. Actual results may vary."* Simple, motivating, caveat-safe.
- **Input pattern**: Height uses a **ruler/scroll picker** (with Feet/Inches ↔ Centimeters toggle); weight uses a **numeric keypad** with Pounds / Kilograms / Stone unit toggle. All three fields (height, weight, goal weight) on one scrollable screen under "Just a few more questions" — reassuring copy: *"It's ok to estimate, you can update this later."*
- **Goals settings**: A single editable screen showing Starting Weight (with date), Current Weight, Goal Weight, Weekly Goal rate, and Activity Level — all tappable to edit. Clean settings-list pattern.
- **Key takeaway for Daybreak**: MFP's projection graph with a pace slider is the most directly portable pattern for our time-to-target feature. Combine their rate-selector with our SURMOUNT trial data (dose-based % body weight loss over 72 weeks) to project a range rather than a single point — with the same style of caveat.
---

## Recommended adaptation for Daybreak

Convert today's single 4-field card into a short conversational "Dawn" flow, one question per screen, progress bar on top:

1. **Welcome** — warm value statement ("a brighter chapter is rising"). No input.
2. **Health disclaimer** — MacroFactor-style: "educational, not medical advice" with a consent toggle (honors our product guardrail).
3. **Gender** — big tap cards (Male / Female), styled, still a real control.
4. **Height** — wheel/ruler picker (cm, with ft/in display toggle later).
5. **Starting weight** — wheel picker; dignified copy ("today's number, no judgement").
6. **Goal weight** — wheel picker; aspirational framing ("where you're headed").
7. **Privacy beat** — elevate "stays on your device" to its own reassuring step (Clue/Flo pattern).
8. **Payoff reveal** — the dashboard: BMI start/target + journey rail, PLUS a rough time-to-target range from our SURMOUNT research, with the "individual results vary — not medical advice" caveat (MacroFactor's projection framing + **MyFitnessPal's pace-slider-with-graph** pattern, guardrail-safe).

**Tone pillars:** Atoms' dignified identity voice, Clue's privacy candor, MacroFactor's projection payoff, Flo's reassurance cadence.
