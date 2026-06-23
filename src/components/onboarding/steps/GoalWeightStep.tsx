import StepShell from '../StepShell';
import WheelPicker from '../WheelPicker';
import UnitToggle from '../UnitToggle';
import { computeBmi } from '../../../lib/bmi';
import { kgToLb, lbToKg } from '../../../lib/units';
import type { StepProps } from '../OnboardingFlow';

export default function GoalWeightStep({
  draft,
  update,
  onNext,
  onBack,
  canBack,
  progress,
  ctaLabel,
  onCancel,
}: StepProps) {
  const isLb = draft.weightUnit === 'lb';


  const goalBmi =
    draft.heightCm > 0
      ? computeBmi(draft.targetWeightKg, draft.heightCm)
      : null;
  const atOrAboveStart = draft.targetWeightKg >= draft.startingWeightKg;
  const underweightGoal = !atOrAboveStart && goalBmi !== null && goalBmi < 18.5;
  return (
    <StepShell
      progress={progress}
      canBack={canBack}
      onBack={onBack}
      eyebrow="Where you're headed"
      title="Where would you like to get to?"
      subtitle="A number that feels like you at your best. You can always adjust it as you go."
      ctaLabel={ctaLabel ?? 'Continue'}
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

      <div className="mt-5">
        {isLb ? (
          <WheelPicker
            value={Math.round(kgToLb(draft.targetWeightKg))}
            min={66}
            max={660}
            step={1}
            decimals={0}
            onChange={(lb) => {
              update({
                targetWeightKg: Math.round(lbToKg(lb) * 2) / 2,
              });
            }}
            formatValue={(v) => `${v} lb`}
            unit="lb"
            ariaLabel="Goal weight"
            ariaValueText={(v) => `${v} pounds`}
            placeholder="160"
            hint="Enter 66–660 lb"
          />
        ) : (
          <WheelPicker
            value={draft.targetWeightKg}
            min={30}
            max={300}
            step={0.5}
            decimals={1}
            onChange={(v) => update({ targetWeightKg: v })}
            formatValue={(v) => `${v} kg`}
            unit="kg"
            ariaLabel="Goal weight"
            ariaValueText={(v) => `${v} kilograms`}
            placeholder="72.0"
            hint="Enter 30–300 kg"
          />
        )}
      </div>

      <div aria-live="polite" className="mt-3">
        {atOrAboveStart && (
          <p className="field-hint">
            That&rsquo;s at or above your starting weight. Daybreak is built
            around weight loss, but the goal is yours to set.
          </p>
        )}
        {underweightGoal && (
          <p className="field-hint">
            Heads up, that lands in the underweight BMI range. BMI is
            just one general measure, and this isn&rsquo;t medical advice.
          </p>
        )}
      </div>
    </StepShell>
  );
}
