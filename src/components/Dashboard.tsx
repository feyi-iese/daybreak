import { useEffect, useState } from 'react';
import { computeBmi, classifyBmi } from '../lib/bmi';
import type { Profile } from '../db/db';
import { listWeighIns } from '../db/weighIns';
import { formatWeight, kgToLb } from '../lib/units';
import Projection from './Projection';

interface DashboardProps {
  profile: Profile;
  onEdit: () => void;
}

export default function Dashboard({ profile, onEdit }: DashboardProps) {
  const [currentWeight, setCurrentWeight] = useState<number>(profile.startingWeightKg);

  useEffect(() => {
    let active = true;
    void listWeighIns().then((list) => {
      if (!active) return;
      if (list.length > 0) {
        // Take the latest weigh-in chronologically
        setCurrentWeight(list[list.length - 1].weightKg);
      }
    });
    return () => {
      active = false;
    };
  }, [profile.startingWeightKg]);

  const unit = profile.weightUnit || 'kg';

  // Every reading is derived on read, never stored (CLAUDE.md invariant).
  const startingBmi = computeBmi(profile.startingWeightKg, profile.heightCm);
  const currentBmi = computeBmi(currentWeight, profile.heightCm);
  const targetBmi = computeBmi(profile.targetWeightKg, profile.heightCm);

  const startingCategory = classifyBmi(startingBmi);
  const currentCategory = classifyBmi(currentBmi);
  const targetCategory = classifyBmi(targetBmi);

  // Journey metrics
  const totalChange = profile.startingWeightKg - profile.targetWeightKg;
  const currentChange = profile.startingWeightKg - currentWeight;
  const remainingChange = currentWeight - profile.targetWeightKg;

  // Percentage of journey complete (clamped between 0 and 100)
  const pct = totalChange > 0 ? Math.max(0, Math.min(100, (currentChange / totalChange) * 100)) : 100;

  const formattedStartDate = new Date(profile.startedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

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

      {/* ---- Start -> goal journey (with Today dot positioned dynamically) ---- */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <span className="section-label">Starting line</span>
          <span className="section-label text-accent-500">Your goal</span>
        </div>
        <div className="journey-track mt-3 relative">
          <div
            className="journey-fill animate-shimmer"
            style={{ width: `${pct}%` }}
            aria-hidden="true"
          />
          {/* Start Dot */}
          <span className="journey-dot left-0" aria-hidden="true" />
          {/* Today Dot */}
          <span
            className="journey-dot bg-primary-500 shadow-glow-primary transition-all duration-500"
            style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
            aria-hidden="true"
          />
          {/* Goal Dot */}
          <span
            className="journey-dot right-0 bg-accent-400 shadow-glow animate-glow-pulse"
            aria-hidden="true"
          />
        </div>
        <p className="hero-sub mt-4 text-sm">
          {currentChange > 0 ? (
            <>
              You&rsquo;ve already lost{' '}
              <strong>{formatWeight(currentChange, unit)}</strong> (
              {Math.round(pct)}% of your goal) since you began on{' '}
              {formattedStartDate}. There is about{' '}
              <strong>{formatWeight(remainingChange, unit)}</strong> of beautiful
              momentum between where you stand today and the person you&rsquo;re
              becoming.
            </>
          ) : (
            <>
              There is about{' '}
              <strong>{formatWeight(remainingChange, unit)}</strong> of beautiful
              momentum between where you stand today and the person you&rsquo;re
              becoming.
            </>
          )}
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
      </div>

      {/* ---- Journey Weight Milestones (Past, Now, Future) ---- */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="stat">
          <p className="stat-label">Start (Past)</p>
          <p className="stat-value text-xl sm:text-2xl font-semibold">
            {unit === 'lb' ? Math.round(kgToLb(profile.startingWeightKg)) : profile.startingWeightKg}
            <span className="stat-unit text-xs ml-0.5">{unit}</span>
          </p>
          <p className="footnote mt-1">{formattedStartDate}</p>
        </div>
        <div className="stat">
          <p className="stat-label">Current (Now)</p>
          <p className="stat-value text-xl sm:text-2xl font-semibold">
            {unit === 'lb' ? Math.round(kgToLb(currentWeight)) : currentWeight}
            <span className="stat-unit text-xs ml-0.5">{unit}</span>
          </p>
          <p className="footnote mt-1">Today</p>
        </div>
        <div className="stat ring-2 ring-accent-200 shadow-glow">
          <p className="stat-label">Goal (Future)</p>
          <p className="stat-value text-xl sm:text-2xl font-semibold text-accent-500">
            {unit === 'lb' ? Math.round(kgToLb(profile.targetWeightKg)) : profile.targetWeightKg}
            <span className="stat-unit text-xs ml-0.5">{unit}</span>
          </p>
          <p className="footnote mt-1">Target</p>
        </div>
      </div>

      {/* ---- BMI readings, each with its tonal category chip ---- */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <div className="stat">
          <p className="stat-label">Starting BMI</p>
          <p className="stat-value text-lg sm:text-xl font-semibold">{startingBmi.toFixed(1)}</p>
          <div className="mt-2">
            <span className={`bmi-chip bmi-chip--${startingCategory.toLowerCase()} text-[10px] px-1.5 py-0.5`}>
              {startingCategory}
            </span>
          </div>
        </div>
        <div className="stat">
          <p className="stat-label">Current BMI</p>
          <p className="stat-value text-lg sm:text-xl font-semibold">{currentBmi.toFixed(1)}</p>
          <div className="mt-2">
            <span className={`bmi-chip bmi-chip--${currentCategory.toLowerCase()} text-[10px] px-1.5 py-0.5`}>
              {currentCategory}
            </span>
          </div>
        </div>
        <div className="stat ring-2 ring-primary-200 shadow-glow-primary">
          <p className="stat-label">Target BMI</p>
          <p className="stat-value text-lg sm:text-xl font-semibold text-primary-700">
            {targetBmi.toFixed(1)}
          </p>
          <div className="mt-2">
            <span className={`bmi-chip bmi-chip--${targetCategory.toLowerCase()} text-[10px] px-1.5 py-0.5`}>
              {targetCategory}
            </span>
          </div>
        </div>
      </div>

      {/* ---- Projected journey ---- */}
      <Projection profile={profile} />

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
