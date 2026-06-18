# frontend/CLAUDE.md — "Dawn / New Horizon" design system

The visual language for the tracker. The feeling: a fresh morning at the start
of something good — modern, warm, hopeful, quietly joyful. **Not** clinical,
sterile, or medical.

Stack: React 18 + Vite + TS + **Tailwind v3.4**. Tokens live in
`tailwind.config.js`; reusable classes live in `src/index.css`
(`@layer base` / `@layer components`). Fonts load via `<link>` in `index.html`.

> Build with the system, never around it. Colours → tokens, spacing → the
> Tailwind scale, type → the scale below, components → the classes here. Need
> something new? Add the token first, then use it.

---

## Palette

Always tint neutrals — never pure `#000` / `#fff`.

| Semantic | Token | Hex | Use |
| --- | --- | --- | --- |
| Surface / page | `cream-50` | `#FFFCF8` | cards, raised surfaces |
| Page wash base | `cream-100` | `#FCF6EE` | body fallback |
| Soft fill | `cream-200` | `#F6EADA` | tracks, quiet fills |
| Border | `cream-300` | `#EBDBC6` | hairline borders |
| Deep edge | `cream-400` | `#D9C3A6` | stronger dividers |
| Ink (text) | `ink` | `#2C2722` | primary text (warm near-black) |
| Ink soft | `ink-soft` | `#6A6157` | secondary text, labels |
| Ink muted | `ink-muted` | `#9C9186` | captions, hints, footnotes |
| **Primary** (teal) | `primary-500` | `#129B86` | brand, links, progress |
| Primary hover | `primary-600` | `#0C8071` | hover/active teal |
| Primary tints | `primary-50…300` | `#E8F8F3 → #5FC9B3` | rings, halos, soft fills |
| **Accent** (coral) | `accent-400` | `#FF7A53` | joyful CTAs, glow |
| Accent deep | `accent-500/600` | `#F65F3B / #DC4A29` | hover coral |
| Sun (amber) | `sun-400` | `#F6A93B` | highlights, secondary accent |

The page background is a fixed **dawn wash**: a peach sunrise glow at the top
fading into warm cream (see `body` in `index.css`, also exposed as `bg-dawn`).

### Dignified category tones (BMI)

Muted, never alarm-red. Each tone has `soft` (fill), `ink` (text), `edge`
(border): `bg-tone-sky-soft text-tone-sky-ink border-tone-sky-edge`, etc.

| Category | Token group | soft / ink / edge |
| --- | --- | --- |
| Underweight | `tone-sky` | `#E8F1F8` / `#2F6C8F` / `#CFE1EE` |
| Normal | `tone-mint` | `#E3F4EF` / `#0C8071` / `#C6E8DF` |
| Overweight | `tone-sun` | `#FAF0DA` / `#946410` / `#F0E0BB` |
| Obese | `tone-rose` | `#FBEAE4` / `#B0584C` / `#F2D4CC` |

---

## Type

- **Display — Fraunces** (`font-display`): hero headlines and big numbers only.
  Has lining/tabular figures enabled, so stats align.
- **UI — Inter** (`font-sans`, default on `body`): everything else.

Scale (Tailwind steps): hero `text-3xl`→`sm:text-4xl`, section `text-xl`,
body `text-base`, label/eyebrow `text-xs` (uppercase, tracked). Stat numbers use
`text-3xl font-display`.

---

## Spacing, radius, shadow, motion tokens

- **Spacing**: 4px Tailwind scale. Cards `p-6 sm:p-8`; field gaps `gap-1.5`;
  section rhythm `mb-8`. Vary rhythm — avoid uniform spacing everywhere.
- **Radius**: generous. `rounded-2xl` (inputs/buttons/quiet cards),
  `rounded-3xl` (cards), `rounded-full` (chips/track), plus `rounded-4xl` (2rem).
- **Shadow** (soft, warm-tinted): `shadow-soft`, `shadow-card`, `shadow-lift`
  (hover), `shadow-glow` (coral), `shadow-glow-primary` (teal), `shadow-inner-soft`.
- **Gradients**: `bg-dawn`, `bg-primary-sheen` (teal), `bg-accent-sheen` (coral).

### Motion (gentle, exponential ease-out — no bounce)

| Utility | Effect |
| --- | --- |
| `animate-fade-rise` | fade + 14px rise entrance (`cubic-bezier(.22,1,.36,1)`) |
| `animate-float` | slow 7s vertical drift (decorative sun glow) |
| `animate-shimmer` | 2.8s background-position sheen |
| `animate-glow-pulse` | 3.2s coral glow breathing (CTA) |

**Reduced-motion policy:** `src/index.css` `@layer base` includes a global
`@media (prefers-reduced-motion: reduce)` block that neutralises all animation
and transition durations. Use only the tokens above so this stays automatic;
never hand-roll uncovered animations.

---

## Component class catalog

All defined in `src/index.css` `@layer components`. Compose with these — extend
the system, don't invent one-offs.

**Shell**
- `.app-shell` — full-height padded page wrapper on the dawn background.
- `.app-main` — centered `max-w-xl` content column.
- `.sun-glow` — decorative floating coral glow (pair with `animate-float`, `aria-hidden`).
- `.wordmark` / `.wordmark-dot` — brand lockup + coral dot.

**Surfaces**
- `.card` — primary surface: `rounded-3xl`, cream, soft border, `shadow-card`.
- `.card-quiet` — lighter inset panel for nested groups (flatten hierarchy; avoid card-in-card).

**Headings**
- `.hero-eyebrow` — small teal uppercase kicker above a hero title.
- `.hero-title` — Fraunces hero headline.
- `.hero-sub` — supporting subtitle in `ink-soft`.
- `.section-title` — Fraunces section heading.
- `.section-label` — small muted uppercase section label.

**Buttons** (base `.btn` + variant; hierarchy matters — one primary per view)
- `.btn-primary` — teal sheen, glow, hover lift. The main action.
- `.btn-accent` — coral sheen CTA for the single most joyful action.
- `.btn-ghost` — quiet outline / secondary.

**Form**
- `.field-group` — label+control column wrapper.
- `.field-label` — field label.
- `.field-input` — text/number input (rounded, inner shadow, teal focus ring).
- `.field-select` — `.field-input` + warm chevron + right padding (no native arrow).
- `.field-hint` — small helper text under a field.
- `.segmented` / `.segmented-option` / `.segmented-option--active` — toggle group (e.g. gender).

**Chips & BMI tones**
- `.chip` — base pill.
- `.bmi-chip` + one of `--underweight` / `--normal` / `--overweight` / `--obese` — dignified category pill.

**Stats / metrics**
- `.stat` — metric tile. `.stat-label` (caption), `.stat-value` (Fraunces number), `.stat-unit` (trailing unit), `.stat-delta` (teal change line).

**Journey / progress**
- `.journey-track` — rounded rail. `.journey-fill` — teal-sheen fill. `.journey-dot` — marker.

**Supportive copy**
- `.caveat` — boxed disclaimer note (use for the "individual results vary, not medical advice" caveat).
- `.footnote` — plain muted fine print.

---

## Theme token reference (verbatim names)

- Colors: `cream-{50,100,200,300,400}`, `ink`/`ink-soft`/`ink-muted`,
  `primary-{50–800}`, `accent-{50–600}`, `sun-{300,400,500}`,
  `tone-sky`/`tone-mint`/`tone-sun`/`tone-rose` each `{soft,ink,edge}`.
- Fonts: `font-display` (Fraunces), `font-sans` (Inter).
- Shadows: `soft`, `card`, `lift`, `glow`, `glow-primary`, `inner-soft`.
- Radius: adds `rounded-4xl` (2rem).
- Background images: `dawn`, `primary-sheen`, `accent-sheen`.
- Keyframes/animations: `fade-rise`, `float`, `shimmer`, `glow-pulse`.

---

## Copy tone

Supportive, warm, non-judgemental, hopeful — you're helping someone start a
good new chapter.

- Encourage, never scold. Celebrate progress; frame goals as a journey.
- **Never give medical or dosing advice**, never diagnose, never tell the user
  to change treatment. Projections are rough ranges with a visible
  "individual results vary — not medical advice" caveat (use `.caveat`).
- Plain, kind language over clinical jargon. Empty states guide the next step
  rather than saying "nothing here".
