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
      subtitle="It's okay to estimate. You can change this anytime."
      ctaLabel="Continue"
      onCtaClick={onNext}
      onCancel={onCancel}
    >
      <div className="flex items-center justify-start gap-3">
        <UnitToggle
          options={[
            { label: 'cm', value: 'cm' },
            { label: 'ft / in', value: 'ftin' },
          ]}
          value={draft.heightUnit}
          onChange={(v) => update({ heightUnit: v as 'cm' | 'ftin' })}
          ariaLabel="Height unit"
        />
      </div>

      {isFtIn ? (
        <div className="mt-5">
          <div className="grid grid-cols-2 gap-3">
            <WheelPicker
              value={ft}
              min={4}
              max={8}
              step={1}
              onChange={(newFt) => {
                const cmVal = Math.round(ftInToCm(newFt, inches));
                update({ heightCm: Math.min(250, Math.max(120, cmVal)) });
              }}
              formatValue={(v) => `${v}'`}
              unit="′"
              ariaLabel="Feet"
              ariaValueText={(v) => `${v} feet`}
              placeholder="5"
              inputWidth="w-[2.5ch]"
              hint=""
            />
            <WheelPicker
              value={inches}
              min={0}
              max={11}
              step={1}
              onChange={(newIn) => {
                const cmVal = Math.round(ftInToCm(ft, newIn));
                update({ heightCm: Math.min(250, Math.max(120, cmVal)) });
              }}
              formatValue={(v) => `${v}"`}
              unit="″"
              ariaLabel="Inches"
              ariaValueText={(v) => `${v} inches`}
              placeholder="8"
              inputWidth="w-[2.5ch]"
              hint=""
            />
          </div>
          <p aria-live="polite" className="mt-4 text-center text-xs text-ink-muted">
            Enter 4–8 feet and 0–11 inches
          </p>
        </div>
      ) : (
        <div className="mt-5">
          <WheelPicker
            value={draft.heightCm}
            min={120}
            max={250}
            step={1}
            onChange={(v) => update({ heightCm: v })}
            formatValue={(v) => `${v} cm`}
            unit="cm"
            ariaLabel="Height"
            ariaValueText={(v) => `${v} centimetres`}
            placeholder="170"
            hint="Enter 120–250 cm"
          />
        </div>
      )}
    </StepShell>
  );
}
