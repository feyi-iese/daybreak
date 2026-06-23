import { useCallback, useEffect, useRef, useState } from 'react';

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
  unit: string;
  decimals?: number;
  placeholder?: string;
  hint?: string;
  editAriaLabel?: string;
  inputWidth?: string;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function snap(v: number, step: number, min: number): number {
  return min + Math.round((v - min) / step) * step;
}

function formatEdit(v: number, decimals: number): string {
  const r = Math.round(v * 10 ** decimals) / 10 ** decimals;
  return Number.isInteger(r) ? String(r) : r.toFixed(decimals);
}

function parseEdit(raw: string, min: number, max: number, step: number): number | null {
  if (raw.trim() === '') return null;
  const n = parseFloat(raw);
  if (Number.isNaN(n)) return null;
  return clamp(snap(n, step, min), min, max);
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
  unit,
  decimals: decimalsProp,
  placeholder,
  hint,
  editAriaLabel,
  inputWidth = 'w-[4.5ch]',
}: WheelPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ startY: number; startValue: number } | null>(null);
  const wasDraggingRef = useRef<boolean>(false);
  const downOnCenterRef = useRef<boolean>(false);

  const [editing, setEditing] = useState(false);
  const [draftStr, setDraftStr] = useState('');
  const decimals = decimalsProp ?? (step % 1 === 0 ? 0 : 1);

  const enterEdit = useCallback(() => {
    setDraftStr(formatEdit(value, decimals));
    setEditing(true);
  }, [value, decimals]);

  const adjust = useCallback(
    (delta: number) => {
      const raw = value + delta;
      onChange(clamp(snap(raw, step, min), min, max));
    },
    [value, min, max, step, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editing) return;
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
        case 'Enter':
        case ' ':
          e.preventDefault();
          enterEdit();
          break;
      }
    },
    [adjust, onChange, min, max, step, editing, enterEdit],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (editing) return;
      dragRef.current = { startY: e.clientY, startValue: value };
      downOnCenterRef.current = !!(e.target as HTMLElement).closest('[data-wheel-center]');
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
    [value, editing],
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

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const target = e.currentTarget as HTMLElement;
      if (typeof target.releasePointerCapture === 'function') {
        try {
          target.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
      dragRef.current = null;
      if (!wasDraggingRef.current && downOnCenterRef.current) {
        enterEdit();
      }
      downOnCenterRef.current = false;
    },
    [enterEdit],
  );

  // Native wheel listener (non-passive to allow preventDefault)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (editing) return;
      e.preventDefault();
      adjust(e.deltaY < 0 ? step : -step);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [adjust, step, editing]);

  // Exit editing on unit/limit changes to avoid stale draft state
  useEffect(() => {
    setEditing(false);
  }, [min, max]);

  // Focus and select the content once the input mounts
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setDraftStr(raw);
    const committed = parseEdit(raw, min, max, step);
    if (committed !== null && committed === clamp(committed, min, max)) {
      onChange(committed);
    }
  };

  const commit = () => {
    const committed = parseEdit(draftStr, min, max, step);
    if (committed === null) {
      setDraftStr(formatEdit(value, decimals));
    } else {
      onChange(committed);
      setDraftStr(formatEdit(committed, decimals));
    }
  };

  const commitAndExit = () => {
    commit();
    setEditing(false);
    inputRef.current?.blur();
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const onInputBlur = () => {
    commit();
    setEditing(false);
  };

  const bumpDraft = (delta: number) => {
    const base = parseEdit(draftStr, min, max, step) ?? value;
    const next = clamp(snap(base + delta, step, min), min, max);
    setDraftStr(formatEdit(next, decimals));
    onChange(next);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        bumpDraft(+step);
        break;
      case 'ArrowDown':
        e.preventDefault();
        bumpDraft(-step);
        break;
      case 'PageUp':
        e.preventDefault();
        bumpDraft(+step * 10);
        break;
      case 'PageDown':
        e.preventDefault();
        bumpDraft(-step * 10);
        break;
      case 'Enter':
        e.preventDefault();
        commitAndExit();
        break;
      case 'Escape':
        e.preventDefault();
        cancelEdit();
        break;
    }
  };

  const draftNum = parseFloat(draftStr);
  const draftInvalid =
    editing &&
    draftStr.trim() !== '' &&
    (Number.isNaN(draftNum) || draftNum < min || draftNum > max);

  const containerClasses = [
    'group relative flex w-full flex-col items-center justify-center gap-1 rounded-3xl border py-6 outline-none transition-colors duration-200 ease-out bg-cream-100/60',
    editing ? 'cursor-text' : 'touch-none select-none cursor-ns-resize',
    draftInvalid
      ? 'border-tone-rose-edge ring-4 ring-tone-rose-edge/40'
      : editing
        ? 'border-primary-300/60 ring-4 ring-primary-300/40'
        : 'border-cream-300/60 hover:border-primary-300/60 focus-visible:ring-4 focus-visible:ring-primary-300/50',
  ].filter(Boolean).join(' ');

  // Show two neighbours on each side of the current value.
  const offsets = [-2, -1, 0, 1, 2];

  return (
    <div className="w-full flex flex-col items-center">
      <div
        ref={containerRef}
        role={editing ? undefined : 'spinbutton'}
        tabIndex={editing ? -1 : 0}
        aria-valuemin={editing ? undefined : min}
        aria-valuemax={editing ? undefined : max}
        aria-valuenow={editing ? undefined : value}
        aria-valuetext={editing ? undefined : ariaValueText?.(value)}
        aria-label={editing ? undefined : ariaLabel}
        onKeyDown={handleKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={containerClasses}
      >
        {/* Center selection band */}
        {!editing && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 top-1/2 h-12 -translate-y-1/2 rounded-2xl bg-cream-50/85 ring-1 ring-primary-200/50 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.7)] transition-colors duration-200 group-hover:ring-primary-300/60"
          />
        )}
        {/* Top / bottom fades to fake the wheel curve */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-10 rounded-t-3xl bg-gradient-to-b from-cream-100/95 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 rounded-b-3xl bg-gradient-to-t from-cream-100/95 to-transparent"
        />

        {offsets.map((offset) => {
          const v = value + offset * step;
          const dist = Math.abs(offset);
          if (v < min || v > max) {
            return <div key={offset} className="h-9" aria-hidden="true" />;
          }
          if (offset === 0) {
            if (editing) {
              return (
                <label
                  key={offset}
                  className={`relative z-10 flex items-baseline gap-2 rounded-2xl bg-cream-50/85 px-6 py-2 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.7)] ring-1 transition-colors duration-200 ${
                    draftInvalid ? 'ring-tone-rose-edge' : 'ring-primary-200/60'
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="number"
                    inputMode={decimals === 0 ? 'numeric' : 'decimal'}
                    aria-label={editAriaLabel ?? ariaLabel}
                    aria-invalid={draftInvalid || undefined}
                    className={`no-spinner ${inputWidth} bg-transparent text-center font-mono text-3xl font-semibold tabular-nums tracking-tight text-ink outline-none placeholder:text-ink-muted/40`}
                    placeholder={placeholder}
                    value={draftStr}
                    onChange={onInputChange}
                    onKeyDown={onInputKeyDown}
                    onBlur={onInputBlur}
                  />
                  <span className="font-mono text-xl font-medium text-ink-soft">{unit}</span>
                </label>
              );
            } else {
              return (
                <button
                  key={offset}
                  type="button"
                  data-wheel-center
                  aria-hidden="true"
                  tabIndex={-1}
                  onClick={(e) => {
                    if (!wasDraggingRef.current) {
                      e.stopPropagation();
                      enterEdit();
                    }
                  }}
                  className="relative z-10 flex h-12 items-center font-mono text-3xl font-semibold tabular-nums tracking-tight text-ink cursor-text"
                >
                  {formatValue(v)}
                </button>
              );
            }
          }
          const toneClass =
            dist === 1 ? 'text-base text-ink-soft' : 'text-sm text-ink-muted/70';
          const editingClass = editing ? 'opacity-30 blur-[1px] pointer-events-none transition-all duration-200' : '';
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
              className={`relative z-10 flex h-9 items-center px-2 font-mono tabular-nums cursor-pointer transition-all duration-200 ease-out hover:text-primary-600 hover:scale-105 active:scale-95 ${toneClass} ${editingClass}`}
            >
              {formatValue(v)}
            </button>
          );
        })}
      </div>
      {hint && (
        <p
          aria-live="polite"
          className={`mt-3 text-xs ${draftInvalid ? 'text-tone-rose-ink' : 'text-ink-muted'}`}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
