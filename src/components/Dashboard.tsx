import { computeBmi, classifyBmi } from '../lib/bmi';
import type { Profile } from '../db/db';
import { formatWeight, kgToLb } from '../lib/units';
import RisingSunGauge from './RisingSunGauge';

interface DashboardProps {
  profile: Profile;
  currentWeight: number;
  onEdit: () => void;
}

export default function Dashboard({ profile, currentWeight, onEdit }: DashboardProps) {


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
    <section className="card animate-fade-rise">
      {/* ---- Celebratory hero (left-aligned, breathing room) ---- */}
      <header>
        <p className="hero-eyebrow">Your new horizon</p>
        {/* <h1 className="hero-title mt-2 tracking-tight">
          A brighter chapter is rising
        </h1> */}
        {/* <p className="hero-sub max-w-[46ch]">
          Every sunrise from here carries you closer to the life you&rsquo;re
          building. Here&rsquo;s the road ahead, and the bright place it leads.
        </p> */}
      </header>

      {/* ---- Start -> goal journey (Today dot positioned dynamically) ---- */}
      <div className="mt-10">
        <RisingSunGauge
          pct={pct}
          lost={formatWeight(Math.max(0, currentChange), unit)}
          remaining={formatWeight(Math.max(0, remainingChange), unit)}
        />
      </div>

      {/* ---- The inputs you entered ---- */}
      <div className="mt-10">
        <h2 className="section-label">Your details</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="stat transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-soft">
            <p className="stat-label">You</p>
            <p className="stat-value">
              {profile.gender === 'female' ? 'Female' : 'Male'}
            </p>
          </div>
          <div className="stat transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-soft">
            <p className="stat-label">Height</p>
            <p className="stat-value">
              <span className="font-mono tabular-nums">{profile.heightCm}</span>
              <span className="stat-unit">cm</span>
            </p>
          </div>
        </div>
      </div>

      {/* ---- Journey Weight Milestones (Past, Now, Future) ---- */}
      <div className="mt-8">
        <h2 className="section-label">Weight milestones</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="stat transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-soft">
            <p className="stat-label">Start (Past)</p>
            <p className="stat-value text-xl font-semibold sm:text-2xl">
              <span className="font-mono tabular-nums">
                {unit === 'lb' ? Math.round(kgToLb(profile.startingWeightKg)) : profile.startingWeightKg}
              </span>
              <span className="stat-unit ml-0.5 text-xs">{unit}</span>
            </p>
            <p className="footnote mt-1 font-mono">{formattedStartDate}</p>
          </div>
          <div className="stat transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-soft">
            <p className="stat-label">Current (Now)</p>
            <p className="stat-value text-xl font-semibold sm:text-2xl">
              <span className="font-mono tabular-nums">
                {unit === 'lb' ? Math.round(kgToLb(currentWeight)) : currentWeight}
              </span>
              <span className="stat-unit ml-0.5 text-xs">{unit}</span>
            </p>
            <p className="footnote mt-1">Today</p>
          </div>
          <div className="stat shadow-glow ring-2 ring-accent-200 transition-all duration-300 ease-out hover:-translate-y-0.5">
            <p className="stat-label">Goal (Future)</p>
            <p className="stat-value text-xl font-semibold text-accent-500 sm:text-2xl">
              <span className="font-mono tabular-nums">
                {unit === 'lb' ? Math.round(kgToLb(profile.targetWeightKg)) : profile.targetWeightKg}
              </span>
              <span className="stat-unit ml-0.5 text-xs">{unit}</span>
            </p>
            <p className="footnote mt-1">Target</p>
          </div>
        </div>
      </div>

      {/* ---- BMI readings, each with its tonal category chip ---- */}
      <div className="mt-8">
        <h2 className="section-label">Body mass index</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="stat transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-soft">
            <p className="stat-label">Starting BMI</p>
            <p className="stat-value text-lg font-semibold sm:text-xl">
              <span className="font-mono tabular-nums">{startingBmi.toFixed(1)}</span>
            </p>
            <div className="mt-2">
              <span className={`bmi-chip bmi-chip--${startingCategory.toLowerCase()} px-1.5 py-0.5 text-[10px]`}>
                {startingCategory}
              </span>
            </div>
          </div>
          <div className="stat transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-soft">
            <p className="stat-label">Current BMI</p>
            <p className="stat-value text-lg font-semibold sm:text-xl">
              <span className="font-mono tabular-nums">{currentBmi.toFixed(1)}</span>
            </p>
            <div className="mt-2">
              <span className={`bmi-chip bmi-chip--${currentCategory.toLowerCase()} px-1.5 py-0.5 text-[10px]`}>
                {currentCategory}
              </span>
            </div>
          </div>
          <div className="stat shadow-glow-primary ring-2 ring-primary-200 transition-all duration-300 ease-out hover:-translate-y-0.5">
            <p className="stat-label">Target BMI</p>
            <p className="stat-value text-lg font-semibold text-primary-700 sm:text-xl">
              <span className="font-mono tabular-nums">{targetBmi.toFixed(1)}</span>
            </p>
            <div className="mt-2">
              <span className={`bmi-chip bmi-chip--${targetCategory.toLowerCase()} px-1.5 py-0.5 text-[10px]`}>
                {targetCategory}
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* ---- Gentle, non-clinical disclaimer ---- */}
      <p className="caveat mt-10">
        BMI is a general screening measure, not a diagnosis. Individual results
        vary, so this is not medical advice.
      </p>

      {/* ---- Edit action ---- */}
      <div className="mt-6">
        <button
          type="button"
          onClick={onEdit}
          className="btn btn-ghost active:translate-y-px active:scale-[0.98]"
        >
          Edit details
        </button>
      </div>
    </section>
  );
}
