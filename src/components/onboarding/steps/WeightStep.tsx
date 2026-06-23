import { useState, useEffect } from 'react';
import StepShell from '../StepShell';
import WheelPicker from '../WheelPicker';
import UnitToggle from '../UnitToggle';
import { kgToLb, lbToKg } from '../../../lib/units';
import { formatDateKey } from '../../../lib/dateUtils';
import type { StepProps } from '../OnboardingFlow';

const MIN_KG = 30;
const MAX_KG = 300;

const trimNum = (n: number) => {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
};

export default function WeightStep({
  draft,
  update,
  onNext,
  onBack,
  canBack,
  progress,
  onCancel,
}: StepProps) {
  const isLb = draft.weightUnit === 'lb';
  const [startInput, setStartInput] = useState('');

  // Synchronize starting weight and today's weight if not different
  const handleWeightTodayChange = (kg: number) => {
    update({
      weightTodayKg: kg,
      ...(!draft.hasDifferentStartingWeight ? { startingWeightKg: kg } : {}),
    });
  };

  // Sync startInput string state with draft
  useEffect(() => {
    const display = draft.startingWeightKg
      ? (isLb ? kgToLb(draft.startingWeightKg) : draft.startingWeightKg)
      : NaN;
    const current = parseFloat(startInput);
    if (isNaN(current) || Math.abs(current - display) > 0.05) {
      setStartInput(isNaN(display) ? '' : trimNum(display));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.startingWeightKg, isLb]);

  const onStartChange = (raw: string) => {
    setStartInput(raw);
    const val = parseFloat(raw);
    if (raw.trim() === '' || isNaN(val)) return;
    const kg = isLb ? lbToKg(val) : val;
    if (kg >= MIN_KG && kg <= MAX_KG) {
      update({ startingWeightKg: kg });
    }
  };

  const onStartBlur = () => {
    const val = parseFloat(startInput);
    if (startInput.trim() === '' || isNaN(val)) {
      const display = draft.startingWeightKg
        ? (isLb ? kgToLb(draft.startingWeightKg) : draft.startingWeightKg) : NaN;
      setStartInput(isNaN(display) ? '' : trimNum(display));
      return;
    }
    const minVal = isLb ? 66 : 30;
    const maxVal = isLb ? 660 : 300;
    const clampedVal = Math.min(maxVal, Math.max(minVal, val));
    const kg = isLb ? lbToKg(clampedVal) : clampedVal;
    const roundedKg = Math.round(kg * 2) / 2;
    update({ startingWeightKg: roundedKg });
    setStartInput(trimNum(isLb ? kgToLb(roundedKg) : roundedKg));
  };

  const startValParsed = parseFloat(startInput);
  const isStartInvalid = startInput.trim() !== '' && (
    isNaN(startValParsed) || (isLb ? (startValParsed < 66 || startValParsed > 660) : (startValParsed < 30 || startValParsed > 300))
  );

  return (
    <StepShell
      progress={progress}
      canBack={canBack}
      onBack={onBack}
      eyebrow="About you"
      title="What's your weight today?"
      subtitle="Today's number, no judgement. It's just your starting line."
      ctaLabel="Continue"
      onCtaClick={onNext}
      onCancel={onCancel}
    >
      <div className="flex items-center justify-start gap-3">
        <UnitToggle
          options={[
            { label: 'kg', value: 'kg' },
            { label: 'lb', value: 'lb' },
          ]}
          value={draft.weightUnit}
          onChange={(v) => update({ weightUnit: v as 'kg' | 'lb' })}
          ariaLabel="Weight unit"
        />
      </div>

      {/* Main picker / manual input for Today's Weight */}
      <div className="mt-5">
        {isLb ? (
          <WheelPicker
            value={Math.round(kgToLb(draft.weightTodayKg))}
            min={66}
            max={660}
            step={1}
            decimals={0}
            onChange={(lb) => {
              handleWeightTodayChange(Math.round(lbToKg(lb) * 2) / 2);
            }}
            formatValue={(v) => `${v} lb`}
            unit="lb"
            ariaLabel="Today's weight"
            ariaValueText={(v) => `${v} pounds`}
            placeholder="175"
            hint="Enter 66–660 lb"
          />
        ) : (
          <WheelPicker
            value={draft.weightTodayKg}
            min={30}
            max={300}
            step={0.5}
            decimals={1}
            onChange={handleWeightTodayChange}
            formatValue={(v) => `${v} kg`}
            unit="kg"
            ariaLabel="Today's weight"
            ariaValueText={(v) => `${v} kilograms`}
            placeholder="80.0"
            hint="Enter 30–300 kg"
          />
        )}
      </div>

      {/* Starting line question */}
      <div className="mt-8 pt-6 border-t border-cream-300">
        <label className="field-label mb-3 block text-center">
          Is today your starting line?
        </label>
        <div className="segmented w-full">
          <button
            type="button"
            onClick={() => {
              update({
                hasDifferentStartingWeight: false,
                startingWeightKg: draft.weightTodayKg,
              });
            }}
            className={`segmented-option ${!draft.hasDifferentStartingWeight ? 'segmented-option--active' : ''}`}
          >
            Yes, today is my start
          </button>
          <button
            type="button"
            onClick={() => update({ hasDifferentStartingWeight: true })}
            className={`segmented-option ${draft.hasDifferentStartingWeight ? 'segmented-option--active' : ''}`}
          >
            No, I started earlier
          </button>
        </div>
      </div>

      {/* Conditional Starting Weight and Date Inputs */}
      {draft.hasDifferentStartingWeight && (
        <div className="mt-6 space-y-4 p-4 rounded-2xl bg-cream-50 border border-cream-300 animate-fade-rise">
          <p className="hero-eyebrow text-primary-500">Your historical start</p>

          {/* Starting weight input */}
          <div className="field-group">
            <label htmlFor="starting-weight-input" className="field-label">Starting Weight</label>
            <div className="relative">
              <input
                id="starting-weight-input"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="30"
                max="600"
                required
                className={`field-input no-spinner w-full pr-16 font-mono tabular-nums ${
                  isStartInvalid ? 'border-tone-rose-edge focus-visible:ring-tone-rose-edge' : ''
                }`}
                placeholder={isLb ? '175.0' : '80.0'}
                value={startInput}
                onChange={(e) => onStartChange(e.target.value)}
                onBlur={onStartBlur}
              />
              <span className="absolute right-3 top-3 text-sm text-ink-muted pointer-events-none">
                {draft.weightUnit}
              </span>
            </div>
            <span className={`field-hint ${isStartInvalid ? 'text-tone-rose-ink' : ''}`}>
              {isStartInvalid
                ? (isLb ? 'Enter 66–660 lb' : 'Enter 30–300 kg')
                : 'Your starting weight back when you began your journey.'}
            </span>
          </div>

          {/* Starting date input */}
          <div className="field-group">
            <label htmlFor="starting-date-input" className="field-label">Start Date</label>
            <input
              id="starting-date-input"
              type="date"
              max={formatDateKey(new Date())}
              required
              className="field-input w-full font-mono tabular-nums"
              value={draft.startedAtDate}
              onChange={(e) => update({ startedAtDate: e.target.value })}
            />
            <span className="field-hint">
              When did you take your first dose or record your first weight?
            </span>
          </div>
        </div>
      )}
    </StepShell>
  );
}
