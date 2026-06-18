import StepShell from '../StepShell';
import WheelPicker from '../WheelPicker';
import UnitToggle from '../UnitToggle';
import { cmToFtIn, ftInToCm } from '../../../lib/units';
import type { StepProps } from '../OnboardingFlow';

export default function HeightStep({
  draft,
  update,
  onNext,
  onBack,
  canBack,
  progress,
  onCancel,
}: StepProps) {
  const isFtIn = draft.heightUnit === 'ftin';
  const { ft, inches } = cmToFtIn(draft.heightCm);

  return (
    <StepShell
      progress={progress}
      canBack={canBack}
      onBack={onBack}
      eyebrow="About you"
      title="How tall are you?"
      subtitle="It's okay to estimate — you can change this anytime."
      ctaLabel="Continue"
      onCtaClick={onNext}
      onCancel={onCancel}
    >
      <UnitToggle
        options={[
          { label: 'cm', value: 'cm' },
          { label: 'ft / in', value: 'ftin' },
        ]}
        value={draft.heightUnit}
        onChange={(v) => update({ heightUnit: v as 'cm' | 'ftin' })}
        ariaLabel="Height unit"
      />

      {isFtIn ? (
        <div className="mt-4 flex items-center justify-center gap-4">
          <WheelPicker
            value={ft}
            min={4}
            max={8}
            step={1}
            onChange={(newFt) => {
              const cm = Math.round(ftInToCm(newFt, inches));
              update({ heightCm: Math.min(250, Math.max(120, cm)) });
            }}
            formatValue={(v) => `${v}'`}
            ariaLabel="Feet"
            ariaValueText={(v) => `${v} feet`}
          />
          <WheelPicker
            value={inches}
            min={0}
            max={11}
            step={1}
            onChange={(newIn) => {
              const cm = Math.round(ftInToCm(ft, newIn));
              update({ heightCm: Math.min(250, Math.max(120, cm)) });
            }}
            formatValue={(v) => `${v}"`}
            ariaLabel="Inches"
            ariaValueText={(v) => `${v} inches`}
          />
        </div>
      ) : (
        <div className="mt-4">
          <WheelPicker
            value={draft.heightCm}
            min={120}
            max={250}
            step={1}
            onChange={(v) => update({ heightCm: v })}
            formatValue={(v) => `${v} cm`}
            ariaLabel="Height"
            ariaValueText={(v) => `${v} centimetres`}
          />
        </div>
      )}
    </StepShell>
  );
}
