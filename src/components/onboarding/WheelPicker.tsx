import { useCallback } from 'react';

interface WheelPickerProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue: (value: number) => string;
  ariaLabel: string;
  ariaValueText?: (value: number) => string;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function snap(v: number, step: number, min: number): number {
  return min + Math.round((v - min) / step) * step;
}

export default function WheelPicker({
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
  ariaLabel,
  ariaValueText,
}: WheelPickerProps) {
  const adjust = useCallback(
    (delta: number) => {
      const raw = value + delta;
      onChange(clamp(snap(raw, step, min), min, max));
    },
    [value, min, max, step, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          adjust(step);
          break;
        case 'ArrowDown':
          e.preventDefault();
          adjust(-step);
          break;
        case 'PageUp':
          e.preventDefault();
          adjust(step * 10);
          break;
        case 'PageDown':
          e.preventDefault();
          adjust(-step * 10);
          break;
        case 'Home':
          e.preventDefault();
          onChange(min);
          break;
        case 'End':
          e.preventDefault();
          onChange(max);
          break;
      }
    },
    [adjust, onChange, min, max, step],
  );

  // Show two neighbours on each side of the current value.
  const offsets = [-2, -1, 0, 1, 2];

  return (
    <div
      role="spinbutton"
      tabIndex={0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={ariaValueText?.(value)}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      className="flex flex-col items-center gap-1 rounded-2xl py-6 outline-none focus-visible:ring-4 focus-visible:ring-primary-300/50"
    >
      {offsets.map((offset) => {
        const v = value + offset * step;
        if (v < min || v > max) {
          return <div key={offset} className="h-8" aria-hidden="true" />;
        }
        const isCurrent = offset === 0;
        return (
          <div
            key={offset}
            className={
              isCurrent
                ? 'font-display text-3xl font-semibold text-ink'
                : 'text-sm text-ink-muted'
            }
            aria-hidden={!isCurrent}
          >
            {formatValue(v)}
          </div>
        );
      })}
    </div>
  );
}
