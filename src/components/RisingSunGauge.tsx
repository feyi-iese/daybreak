interface RisingSunGaugeProps {
  pct: number;       // 0-100, clamped
  lost: string;      // pre-formatted, e.g. "3.2 kg"
  remaining: string; // pre-formatted, e.g. "4.5 kg"
}

export default function RisingSunGauge({ pct, lost, remaining }: RisingSunGaugeProps) {
  // Clamp percentage between 0 and 100 for visual consistency
  const clampedPct = Math.max(0, Math.min(100, pct));

  // Compute sun position on the 180-degree semicircle arc
  // Radius is 85, arc center is at (100, 105)
  // Angle runs from Math.PI (180 degrees, far left) at 0% to 0 (0 degrees, far right) at 100%
  const angle = Math.PI * (1 - clampedPct / 100);
  const sunX = Math.round((100 + 85 * Math.cos(angle)) * 100) / 100;
  const sunY = Math.round((105 - 85 * Math.sin(angle)) * 100) / 100;

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clampedPct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${Math.round(clampedPct)}% of weight goal achieved`}
      className="w-full max-w-[280px] mx-auto text-center"
    >
      <div className="relative w-full aspect-[200/120]">
        <svg
          viewBox="0 0 200 120"
          className="w-full h-auto overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/*
              Gradient stop hex values are mapped directly from tailwind.config.js:
              - #6E86E2 -> primary.300 light cobalt
              - #0038FF -> primary.500 electric cobalt
              - #002FA7 -> primary.600 royal cobalt
            */}
            <linearGradient id="sun-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(var(--c-primary-300), 1)" />
              <stop offset="50%" stopColor="rgba(var(--c-primary-500), 1)" />
              <stop offset="100%" stopColor="rgba(var(--c-primary-600), 1)" />
            </linearGradient>

            {/*
              Radial gradient for the sun disc soft halo glow.
              Uses electric cobalt with opacities corresponding to the glow intensity.
            */}
            <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(var(--c-primary-500), 0.55)" />
              <stop offset="100%" stopColor="rgba(var(--c-primary-500), 0)" />
            </radialGradient>
          </defs>

          {/* Horizon Line: #EBDBC6 -> cream.300 */}
          <line
            x1="10"
            y1="105"
            x2="190"
            y2="105"
            stroke="rgba(var(--c-cream-300), 1)"
            strokeWidth="1"
            opacity="0.5"
          />

          {/* Background track: #F6EADA -> cream.200 */}
          <path
            d="M 15 105 A 85 85 0 0 1 185 105"
            stroke="rgba(var(--c-cream-200), 1)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
          />

          {/* Progress fill track */}
          <path
            d="M 15 105 A 85 85 0 0 1 185 105"
            stroke="url(#sun-arc-grad)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - clampedPct}
            className="transition-all duration-700 ease-out"
            style={{ transitionProperty: 'stroke-dashoffset' }}
          />

          {/* Sun Disc & Glow */}
          <circle
            cx={sunX}
            cy={sunY}
            r="12"
            fill="url(#sun-glow)"
            opacity="0.7"
            className="transition-all duration-700 ease-out"
          />
          <circle
            cx={sunX}
            cy={sunY}
            r="7"
            fill="rgba(var(--c-primary-500), 1)"
            stroke="rgba(var(--c-cream-50), 1)"
            strokeWidth="2"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center select-none">
          <div className="font-mono text-5xl sm:text-6xl font-semibold text-ink tabular-nums">
            {Math.round(clampedPct)}%
          </div>
          <div className="text-xs text-ink-soft mt-0.5 font-medium uppercase tracking-wide">
            of your goal
          </div>
        </div>
      </div>

      {/* Lost / Remaining Chip Labels */}
      <div className="flex items-center justify-between mt-2 px-1">
        <span className="chip border-primary-200 bg-primary-50 text-primary-700">
          &darr; {lost} lost
        </span>
        <span className="chip border-accent-200 bg-accent-50 text-accent-600">
          {remaining} to go
        </span>
      </div>

      {/* Screen Reader accessible summary */}
      <span className="sr-only">
        {Math.round(clampedPct)}% of weight goal achieved. {lost} lost, {remaining} to go.
      </span>
    </div>
  );
}
