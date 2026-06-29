/* eslint-disable react-refresh/only-export-components */
import { useId } from 'react';
import type { Profile, WeighIn } from '../db/db';
import { formatWeight } from '../lib/units';
import { formatDateKey } from '../lib/dateUtils';

export interface WeightProgressPoint {
  at: number;
  weightKg: number;
  kind: 'start' | 'log';
}

export function buildWeightProgressPoints(profile: Profile, weighIns: WeighIn[]): WeightProgressPoint[] {
  const filtered = weighIns.filter(
    (w) =>
      w.at !== undefined &&
      w.weightKg !== undefined &&
      Number.isFinite(w.at) &&
      Number.isFinite(w.weightKg) &&
      w.weightKg > 0 &&
      w.at >= profile.startedAt
  );

  // Sort by at, then by id ?? 0
  filtered.sort((a, b) => {
    if (a.at !== b.at) return a.at - b.at;
    return (a.id ?? 0) - (b.id ?? 0);
  });

  const map = new Map<string, WeightProgressPoint>();
  const startKey = formatDateKey(new Date(profile.startedAt));
  for (const log of filtered) {
    const key = formatDateKey(new Date(log.at));
    if (key === startKey) continue;
    map.set(key, {
      at: log.at,
      weightKg: log.weightKg,
      kind: 'log',
    });
  }

  const points: WeightProgressPoint[] = [
    { at: profile.startedAt, weightKg: profile.startingWeightKg, kind: 'start' },
  ];

  const sortedKeys = Array.from(map.keys()).sort();
  for (const key of sortedKeys) {
    points.push(map.get(key)!);
  }
  return points;
}

const W = 320;
const H = 220;
const PAD = { top: 18, right: 18, bottom: 40, left: 48 } as const;
const CHART_W = W - PAD.left - PAD.right;
const CHART_H = H - PAD.top - PAD.bottom;

interface WeightProgressChartProps {
  profile: Profile;
  weighIns: WeighIn[];
}

export default function WeightProgressChart({ profile, weighIns }: WeightProgressChartProps) {
  const baseId = useId();
  const gradientId = 'weight-chart-gradient-' + baseId.replace(/:/g, '');
  const unit = profile.weightUnit || 'kg';

  const points = buildWeightProgressPoints(profile, weighIns);

  // Compute y-axis range
  const weights = [...points.map((p) => p.weightKg), profile.targetWeightKg];
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  const rawSpan = rawMax - rawMin;
  const actualSpan = rawSpan === 0 ? 1 : rawSpan;
  const yPad = Math.max(1, actualSpan * 0.12);
  const yMax = rawMax + yPad;
  const yMin = rawMin - yPad;
  const ySpan = yMax - yMin;

  // Compute x-axis range
  const xMin = points[0].at;
  const xMax = points[points.length - 1].at;
  const xSpan = xMax - xMin;

  const xOf = (at: number) => {
    if (xSpan === 0) {
      return PAD.left + CHART_W / 2;
    }
    return PAD.left + ((at - xMin) / xSpan) * CHART_W;
  };

  const yOf = (weightKg: number) => {
    return PAD.top + ((yMax - weightKg) / ySpan) * CHART_H;
  };

  // Generate paths
  const pathPoints = points.map((p) => `${xOf(p.at).toFixed(1)},${yOf(p.weightKg).toFixed(1)}`);
  const progressPathD = `M${pathPoints.join(' L')}`;
  
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPathD = `${progressPathD} L${xOf(lastPoint.at).toFixed(1)},${yOf(yMin).toFixed(1)} L${xOf(firstPoint.at).toFixed(1)},${yOf(yMin).toFixed(1)} Z`;

  // Date styling and formatting helper
  const startDate = new Date(firstPoint.at);
  const endDate = new Date(lastPoint.at);
  const isSameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  const showYear = startDate.getFullYear() !== endDate.getFullYear();
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    ...(showYear ? { year: 'numeric' } : {}),
  };
  const formattedStartText = new Date(firstPoint.at).toLocaleDateString('en-US', dateOptions);
  const formattedEndText = new Date(lastPoint.at).toLocaleDateString('en-US', dateOptions);

  // y-axis ticks
  const yMid = (yMin + yMax) / 2;
  const yTicks = [yMin, yMid, yMax];

  // Accessible Label
  const startFormattedDate = new Date(firstPoint.at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const currentFormattedDate = new Date(lastPoint.at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const netChangeKg = lastPoint.weightKg - firstPoint.weightKg;
  const changeText =
    netChangeKg < 0
      ? `down ${formatWeight(Math.abs(netChangeKg), unit)}`
      : netChangeKg > 0
      ? `up ${formatWeight(netChangeKg, unit)}`
      : 'no change';

  const ariaLabel = `Weight progress chart. Starting at ${formatWeight(
    firstPoint.weightKg,
    unit
  )} on ${startFormattedDate}, current is ${formatWeight(
    lastPoint.weightKg,
    unit
  )} on ${currentFormattedDate}, with a net change of ${changeText}.`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={ariaLabel}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0038FF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0038FF" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines for Y ticks */}
        {yTicks.map((val, idx) => {
          const y = yOf(val);
          return (
            <line
              key={idx}
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              className="stroke-cream-300"
              strokeWidth="1"
            />
          );
        })}

        {/* Y-axis tick labels */}
        {yTicks.map((val, idx) => {
          const y = yOf(val);
          return (
            <text
              key={idx}
              x={PAD.left - 8}
              y={y + 4}
              textAnchor="end"
              className="fill-ink-muted font-mono"
              fontSize="9"
            >
              {formatWeight(val, unit)}
            </text>
          );
        })}

        {/* Target Weight dashed guide line */}
        <line
          x1={PAD.left}
          y1={yOf(profile.targetWeightKg)}
          x2={W - PAD.right}
          y2={yOf(profile.targetWeightKg)}
          className="stroke-accent-400"
          strokeWidth="1.5"
          strokeDasharray="6 3"
        />

        {/* Area fill under progress line (if >= 2 points) */}
        {points.length >= 2 && (
          <path d={areaPathD} fill={`url(#${gradientId})`} />
        )}

        {/* Progress line */}
        {points.length >= 2 && (
          <path
            d={progressPathD}
            fill="none"
            className="stroke-primary-600"
            strokeWidth="2.5"
          />
        )}

        {/* Start point dot */}
        <circle
          cx={xOf(firstPoint.at)}
          cy={yOf(firstPoint.weightKg)}
          r={4}
          className="fill-primary-600 stroke-cream-50"
          strokeWidth="2"
        />

        {/* Intermediate dots */}
        {points.length > 2 && points.length <= 24 &&
          points.slice(1, points.length - 1).map((p, idx) => (
            <circle
              key={idx}
              cx={xOf(p.at)}
              cy={yOf(p.weightKg)}
              r={2.25}
              className="fill-primary-300"
            />
          ))
        }

        {/* Latest/current point dot (rendered only if length > 1 to avoid duplicating start dot) */}
        {points.length > 1 && (
          <circle
            cx={xOf(lastPoint.at)}
            cy={yOf(lastPoint.weightKg)}
            r={4}
            className="fill-primary-600 stroke-cream-50"
            strokeWidth="2"
          />
        )}

        {/* Current label */}
        <text
          x={xOf(lastPoint.at)}
          y={yOf(lastPoint.weightKg) - 10}
          textAnchor={points.length === 1 ? 'middle' : 'end'}
          className="fill-ink font-mono chart-text"
          fontSize="10"
        >
          Current
        </text>

        {/* X-axis date labels */}
        {isSameDay ? (
          <text
            x={PAD.left + CHART_W / 2}
            y={H - 14}
            textAnchor="middle"
            className="fill-ink-muted font-mono"
            fontSize="9"
          >
            {formattedStartText}
          </text>
        ) : (
          <>
            <text
              x={PAD.left}
              y={H - 14}
              textAnchor="start"
              className="fill-ink-muted font-mono"
              fontSize="9"
            >
              {formattedStartText}
            </text>
            <text
              x={PAD.left + CHART_W}
              y={H - 14}
              textAnchor="end"
              className="fill-ink-muted font-mono"
              fontSize="9"
            >
              {formattedEndText}
            </text>
          </>
        )}
      </svg>
      {points.length === 1 && (
        <p className="text-center text-xs text-ink-muted mt-2">
          Log another weight to draw your progress line.
        </p>
      )}
    </div>
  );
}
