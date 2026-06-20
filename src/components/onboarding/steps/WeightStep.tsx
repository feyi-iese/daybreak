import StepShell from '../StepShell';
import WheelPicker from '../WheelPicker';
import UnitToggle from '../UnitToggle';
import { kgToLb, lbToKg } from '../../../lib/units';
import { formatDateKey } from '../../../lib/dateUtils';
import type { StepProps } from '../OnboardingFlow';

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

  // Synchronize starting weight and today's weight if not different
  const handleWeightTodayChange = (kg: number) => {
    update({
      weightTodayKg: kg,
      ...(!draft.hasDifferentStartingWeight ? { startingWeightKg: kg } : {}),
    });
  };

  return (
    <StepShell
      progress={progress}
      canBack={canBack}
      onBack={onBack}
      eyebrow="About you"
      title="What's your weight today?"
      subtitle="Today's number, no judgement — it's just your starting line."
      ctaLabel="Continue"
      onCtaClick={onNext}
      onCancel={onCancel}
    >
      <UnitToggle
        options={[
          { label: 'kg', value: 'kg' },
          { label: 'lb', value: 'lb' },
        ]}
        value={draft.weightUnit}
        onChange={(v) => update({ weightUnit: v as 'kg' | 'lb' })}
        ariaLabel="Weight unit"
      />

      {/* Main WheelPicker for Today's Weight */}
      <div className="mt-4">
        {isLb ? (
          <WheelPicker
            value={Math.round(kgToLb(draft.weightTodayKg))}
            min={66}
            max={660}
            step={1}
            onChange={(lb) => {
              // Round to nearest 0.5 kg
              handleWeightTodayChange(Math.round(lbToKg(lb) * 2) / 2);
            }}
            formatValue={(v) => `${v} lb`}
            ariaLabel="Today's weight"
            ariaValueText={(v) => `${v} pounds`}
          />
        ) : (
          <WheelPicker
            value={draft.weightTodayKg}
            min={30}
            max={300}
            step={0.5}
            onChange={handleWeightTodayChange}
            formatValue={(v) => `${v} kg`}
            ariaLabel="Today's weight"
            ariaValueText={(v) => `${v} kilograms`}
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
                step="0.1"
                min="30"
                max="600"
                required
                className="field-input w-full pr-16"
                placeholder={isLb ? '175.0' : '80.0'}
                value={
                  draft.startingWeightKg
                    ? isLb
                      ? Math.round(kgToLb(draft.startingWeightKg))
                      : draft.startingWeightKg
                    : ''
                }
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    update({ startingWeightKg: isLb ? lbToKg(val) : val });
                  }
                }}
              />
              <span className="absolute right-3 top-3 text-sm text-ink-muted pointer-events-none">
                {draft.weightUnit}
              </span>
            </div>
            <span className="field-hint">Your starting weight back when you began your journey.</span>
          </div>

          {/* Starting date input */}
          <div className="field-group">
            <label htmlFor="starting-date-input" className="field-label">Start Date</label>
            <input
              id="starting-date-input"
              type="date"
              max={formatDateKey(new Date())}
              required
              className="field-input w-full"
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
