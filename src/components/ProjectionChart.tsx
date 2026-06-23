interface ProjectionChartProps {
  startKg: number;
  targetKg: number;
  lowProjection: number;
  highProjection: number;
  horizonWeeks: number;
}

/** Exponential time-constant matching SURMOUNT-1 front-loaded trajectory. */
const TAU = 20;
const WEEKS_PER_MONTH = 4.345;

const W = 320;
const H = 200;
const PAD = { top: 16, right: 12, bottom: 28, left: 44 } as const;
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;
const NUM_POINTS = 24;
const MONTH_MARKERS = [4, 8, 12, 16];

export default function ProjectionChart({
  startKg,
  targetKg,
  lowProjection,
  highProjection,
  horizonWeeks,
}: ProjectionChartProps) {
  const minWeight = Math.min(targetKg, lowProjection);
  const weightSpan = startKg - minWeight;
  const yPad = Math.max(2, weightSpan * 0.08);
  const yMax = startKg + yPad;
  const yMin = minWeight - yPad;
  const ySpan = yMax - yMin;

  const xOf = (week: number) => PAD.left + (week / horizonWeeks) * CHART_W;
  const yOf = (weight: number) => PAD.top + ((yMax - weight) / ySpan) * CHART_H;

  // Exponential ease: fraction of total loss realised by week w.
  const denom = 1 - Math.exp(-horizonWeeks / TAU);
  const frac = (w: number) => (1 - Math.exp(-w / TAU)) / denom;

  // Build curve sample points.
  const consLoss = startKg - highProjection; // conservative total loss (5 mg)
  const optLoss = startKg - lowProjection;   // optimistic total loss (15 mg)
  const consPts: string[] = [];
  const optPts: string[] = [];

  for (let i = 0; i <= NUM_POINTS; i++) {
    const w = (i / NUM_POINTS) * horizonWeeks;
    const f = frac(w);
    consPts.push(`${xOf(w).toFixed(1)},${yOf(startKg - consLoss * f).toFixed(1)}`);
    optPts.push(`${xOf(w).toFixed(1)},${yOf(startKg - optLoss * f).toFixed(1)}`);
  }

  // Band = conservative L→R then optimistic R→L, closed.
  const bandD = `M${consPts[0]} L${consPts.slice(1).join(' L')} L${[...optPts].reverse().join(' L')} Z`;
  const consD = `M${consPts.join(' L')}`;
  const optD = `M${optPts.join(' L')}`;

  const goalY = yOf(targetKg);
  const goalWithinRange = targetKg >= lowProjection;
  const horizonMonths = Math.floor(horizonWeeks / WEEKS_PER_MONTH);

  const ariaLabel = goalWithinRange
    ? `Projection chart. Starting at ${Math.round(startKg)} kilograms, trial averages project about ${Math.round(lowProjection)} to ${Math.round(highProjection)} kilograms over roughly ${horizonMonths} months. Your goal of ${Math.round(targetKg)} kilograms could be reached within this range. Individual results vary, not medical advice.`
    : `Projection chart. Starting at ${Math.round(startKg)} kilograms, trial averages project about ${Math.round(lowProjection)} to ${Math.round(highProjection)} kilograms over roughly ${horizonMonths} months. Your goal of ${Math.round(targetKg)} kilograms is further than trial averages reached. Individual results vary, not medical advice.`;

  const visibleMonths = MONTH_MARKERS.filter(
    (m) => m * WEEKS_PER_MONTH <= horizonWeeks * 1.05,
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-4 w-full"
      role="img"
      aria-label={ariaLabel}
    >
      {/* Dose-range band fill */}
      <path d={bandD} className="fill-primary-200 opacity-40" />

      {/* Conservative edge (5 mg / upper) */}
      <path d={consD} fill="none" className="stroke-primary-300" strokeWidth="1.5" />

      {/* Optimistic edge (15 mg / lower) */}
      <path d={optD} fill="none" className="stroke-primary-500" strokeWidth="1.5" />

      {/* Goal line (dashed) */}
      <line
        x1={PAD.left}
        y1={goalY}
        x2={W - PAD.right}
        y2={goalY}
        className="stroke-accent-400"
        strokeWidth="1.5"
        strokeDasharray="6 3"
      />

      {/* Goal label */}
      <text
        x={W - PAD.right}
        y={goalY - 6}
        textAnchor="end"
        className="fill-accent-500 font-mono"
        fontSize="10"
      >
        Goal &middot; {Math.round(targetKg)}&nbsp;kg
      </text>

      {/* Starting dot */}
      <circle cx={xOf(0)} cy={yOf(startKg)} r={4} className="fill-ink" />

      {/* Start label */}
      <text
        x={xOf(0) + 8}
        y={yOf(startKg) + 4}
        className="fill-ink font-mono"
        fontSize="10"
      >
        Today &middot; {Math.round(startKg)}&nbsp;kg
      </text>

      {/* "Now" axis label */}
      <text
        x={PAD.left}
        y={H - 6}
        textAnchor="start"
        className="fill-ink-muted"
        fontSize="9"
      >
        Now
      </text>

      {/* Month axis labels */}
      {visibleMonths.map((m) => (
        <text
          key={m}
          x={xOf(m * WEEKS_PER_MONTH)}
          y={H - 6}
          textAnchor="middle"
          className="fill-ink-muted font-mono"
          fontSize="9"
        >
          Mo&nbsp;{m}
        </text>
      ))}
    </svg>
  );
}
