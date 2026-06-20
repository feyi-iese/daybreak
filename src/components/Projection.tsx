import type { Profile } from '../db/db';
import {
  projectedWeightAt72Weeks,
  weeksToTarget,
  formatWeeksAsMonths,
  SURMOUNT_HORIZON_WEEKS,
} from '../lib/projection';
import { formatWeight } from '../lib/units';
import ProjectionChart from './ProjectionChart';

interface ProjectionProps {
  profile: Profile;
  currentWeightKg: number;
}

export default function Projection({ profile, currentWeightKg }: ProjectionProps) {
  if (currentWeightKg <= profile.targetWeightKg) {
    return null;
  }
  const { targetWeightKg, weightUnit } = profile;
  const unit = weightUnit ?? 'kg';
  const projected = projectedWeightAt72Weeks(currentWeightKg);
  const timing = weeksToTarget(currentWeightKg, targetWeightKg);
  const goalBeyondRange = targetWeightKg < projected.low;

  const timeRange =
    timing.fast != null && timing.slow != null
      ? `${formatWeeksAsMonths(timing.fast)}\u2013${formatWeeksAsMonths(timing.slow)}`
      : timing.fast != null
        ? formatWeeksAsMonths(timing.fast)
        : timing.slow != null
          ? formatWeeksAsMonths(timing.slow)
          : null;

  return (
    <div className="mt-8">
      <h2 className="section-title">Your projected journey</h2>

      {goalBeyondRange ? (
        <>
          <p className="hero-sub mt-4">
            Based on clinical trials, people taking tirzepatide lost about
            15&ndash;21% of their body weight over 72&nbsp;weeks.
          </p>
          <p className="hero-sub mt-2">
            From your current {formatWeight(currentWeightKg, unit)}, that&rsquo;s
            roughly {formatWeight(projected.low, unit)}&ndash;
            {formatWeight(projected.high, unit)}.
          </p>
          <p className="hero-sub mt-2">
            Your goal of {formatWeight(targetWeightKg, unit)} goes further than
            trial averages reached &mdash; which means you&rsquo;re aiming high.
            Fantastic.
          </p>
        </>
      ) : (
        timeRange != null && (
          <p className="hero-sub mt-4">
            Based on clinical trial averages, reaching{' '}
            {formatWeight(targetWeightKg, unit)} could take roughly {timeRange}.
          </p>
        )
      )}

      <ProjectionChart
        startKg={currentWeightKg}
        targetKg={targetWeightKg}
        lowProjection={projected.low}
        highProjection={projected.high}
        horizonWeeks={SURMOUNT_HORIZON_WEEKS}
      />

      <p className="caveat mt-4">
        These ranges are drawn from the SURMOUNT-1 clinical trial
        (72&nbsp;weeks, tirzepatide 5&ndash;15&nbsp;mg). Individual results vary
        based on dose, adherence, diet, and activity. This is not medical advice.
      </p>
    </div>
  );
}
