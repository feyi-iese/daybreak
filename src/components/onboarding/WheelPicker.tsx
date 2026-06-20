import { useCallback, useEffect, useRef } from 'react';

const PIXELS_PER_STEP = 35;

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
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; startValue: number } | null>(null);
  const wasDraggingRef = useRef<boolean>(false);

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

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current = { startY: e.clientY, startValue: value };
      const target = e.currentTarget as HTMLElement;
      if (typeof target.setPointerCapture === 'function') {
        try {
          target.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
      wasDraggingRef.current = false;
    },
    [value],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const deltaY = d.startY - e.clientY;
      if (Math.abs(deltaY) > 3) {
        wasDraggingRef.current = true;
      }
      const valueDelta = Math.round(deltaY / PIXELS_PER_STEP) * step;
      const next = clamp(snap(d.startValue + valueDelta, step, min), min, max);
      if (next !== value) onChange(next);
    },
    [step, min, max, value, onChange],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (typeof target.releasePointerCapture === 'function') {
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
    dragRef.current = null;
  }, []);

  // Native wheel listener (non-passive to allow preventDefault)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      adjust(e.deltaY < 0 ? step : -step);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [adjust, step]);

  // Show two neighbours on each side of the current value.
  const offsets = [-2, -1, 0, 1, 2];

  return (
    <div
      ref={containerRef}
      role="spinbutton"
      tabIndex={0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={ariaValueText?.(value)}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="flex flex-col items-center gap-1 rounded-2xl py-6 outline-none focus-visible:ring-4 focus-visible:ring-primary-300/50 touch-none select-none cursor-ns-resize"
    >
      {offsets.map((offset) => {
        const v = value + offset * step;
        if (v < min || v > max) {
          return <div key={offset} className="h-8" aria-hidden="true" />;
        }
        const isCurrent = offset === 0;
        if (isCurrent) {
          return (
            <div
              key={offset}
              className="font-display text-3xl font-semibold text-ink"
            >
              {formatValue(v)}
            </div>
          );
        }
        return (
          <button
            key={offset}
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={(e) => {
              if (!wasDraggingRef.current) {
                e.stopPropagation();
                onChange(clamp(v, min, max));
              }
            }}
            className="text-sm text-ink-muted cursor-pointer hover:text-ink transition-colors h-8 px-2"
          >
            {formatValue(v)}
          </button>
        );
      })}
    </div>
  );
}
