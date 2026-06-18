import StepShell from '../StepShell';
import WheelPicker from '../WheelPicker';
import UnitToggle from '../UnitToggle';
import { kgToLb, lbToKg } from '../../../lib/units';
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

      <div className="mt-4">
        {isLb ? (
          <WheelPicker
            value={Math.round(kgToLb(draft.startingWeightKg))}
            min={66}
            max={660}
            step={1}
            onChange={(lb) => {
              // Round to nearest 0.5 kg
              update({
                startingWeightKg:
                  Math.round(lbToKg(lb) * 2) / 2,
              });
            }}
            formatValue={(v) => `${v} lb`}
            ariaLabel="Starting weight"
            ariaValueText={(v) => `${v} pounds`}
          />
        ) : (
          <WheelPicker
            value={draft.startingWeightKg}
            min={30}
            max={300}
            step={0.5}
            onChange={(v) => update({ startingWeightKg: v })}
            formatValue={(v) => `${v} kg`}
            ariaLabel="Starting weight"
            ariaValueText={(v) => `${v} kilograms`}
          />
        )}
      </div>
    </StepShell>
  );
}
