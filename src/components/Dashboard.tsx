import { computeBmi, classifyBmi } from '../lib/bmi';
import type { Profile } from '../db/db';

interface DashboardProps {
  profile: Profile;
  onEdit: () => void;
}

export default function Dashboard({ profile, onEdit }: DashboardProps) {
  // Every reading is derived on read, never stored (CLAUDE.md invariant).
  const startingBmi = computeBmi(profile.startingWeightKg, profile.heightCm);
  const targetBmi = computeBmi(profile.targetWeightKg, profile.heightCm);
  const startingCategory = classifyBmi(startingBmi);
  const targetCategory = classifyBmi(targetBmi);
  const kgToGoal = profile.startingWeightKg - profile.targetWeightKg;

  return (
    <section className="card">
      {/* ---- Celebratory hero ---- */}
      <p className="hero-eyebrow">Your new horizon</p>
      <h1 className="hero-title mt-2">A brighter chapter is rising</h1>
      <p className="hero-sub">
        Every sunrise from here carries you closer to the life you&rsquo;re
        building. Here&rsquo;s the road ahead &mdash; and the bright place it
        leads.
      </p>

      {/* ---- Start -> goal journey (purely graphical) ---- */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <span className="section-label">Today</span>
          <span className="section-label text-accent-500">Your goal</span>
        </div>
        <div className="journey-track mt-3">
          <div
            className="journey-fill animate-shimmer"
            style={{ width: '100%' }}
            aria-hidden="true"
          />
          <span className="journey-dot left-0" aria-hidden="true" />
          <span
            className="journey-dot right-0 bg-accent-400 shadow-glow animate-glow-pulse"
            aria-hidden="true"
          />
        </div>
        <p className="hero-sub mt-3 text-sm">
          That&rsquo;s about {kgToGoal} kg of beautiful momentum between where you
          stand today and the person you&rsquo;re becoming.
        </p>
      </div>

      {/* ---- The inputs you entered ---- */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="stat">
          <p className="stat-label">You</p>
          <p className="stat-value">
            {profile.gender === 'female' ? 'Female' : 'Male'}
          </p>
        </div>
        <div className="stat">
          <p className="stat-label">Height</p>
          <p>
            <span className="stat-value">{profile.heightCm}</span>
            <span className="stat-unit">cm</span>
          </p>
        </div>
        <div className="stat">
          <p className="stat-label">Starting weight</p>
          <p>
            <span className="stat-value">{profile.startingWeightKg}</span>
            <span className="stat-unit">kg</span>
          </p>
          <p className="stat-delta">Your brave starting line</p>
        </div>
        <div className="stat ring-2 ring-accent-200 shadow-glow">
          <p className="stat-label">Goal weight</p>
          <p>
            <span className="stat-value text-accent-500">
              {profile.targetWeightKg}
            </span>
            <span className="stat-unit">kg</span>
          </p>
          <p className="stat-delta">The life you&rsquo;re reaching for</p>
        </div>
      </div>

      {/* ---- BMI readings, each with its tonal category chip ---- */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="stat">
          <p className="stat-label">Starting BMI</p>
          <p className="stat-value">{startingBmi.toFixed(1)}</p>
          <div className="mt-2">
            <span className={`bmi-chip bmi-chip--${startingCategory.toLowerCase()}`}>
              {startingCategory}
            </span>
          </div>
        </div>
        <div className="stat ring-2 ring-primary-200 shadow-glow-primary">
          <p className="stat-label">Target BMI</p>
          <p className="stat-value text-primary-700">{targetBmi.toFixed(1)}</p>
          <div className="mt-2">
            <span className={`bmi-chip bmi-chip--${targetCategory.toLowerCase()}`}>
              {targetCategory}
            </span>
          </div>
        </div>
      </div>

      {/* ---- Gentle, non-clinical disclaimer ---- */}
      <p className="caveat mt-8">
        BMI is a general screening measure, not a diagnosis. Individual results
        vary &mdash; this is not medical advice.
      </p>

      {/* ---- Edit action ---- */}
      <div className="mt-6">
        <button type="button" onClick={onEdit} className="btn btn-ghost">
          Edit details
        </button>
      </div>
    </section>
  );
}
