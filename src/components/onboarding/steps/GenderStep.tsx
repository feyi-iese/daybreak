import StepShell from '../StepShell';
import type { StepProps } from '../OnboardingFlow';

const OPTIONS = [
  { value: 'female' as const, label: 'Female' },
  { value: 'male' as const, label: 'Male' },
];

export default function GenderStep({
  draft,
  update,
  onNext,
  onBack,
  canBack,
  canNext,
  progress,
  ctaLabel,
  onCancel,
}: StepProps) {
  return (
    <StepShell
      progress={progress}
      canBack={canBack}
      onBack={onBack}
      eyebrow="About you"
      title="Which best describes you?"
      subtitle="This helps us frame body-composition context. It won't change your BMI category — those are the same for everyone."
      ctaLabel={ctaLabel ?? 'Continue'}
      ctaDisabled={!canNext}
      onCtaClick={onNext}
      onCancel={onCancel}
    >
      <div
        role="radiogroup"
        aria-label="Gender"
        className="flex flex-col gap-3"
      >
        {OPTIONS.map((opt) => {
          const selected = draft.gender === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => update({ gender: opt.value })}
              className={`card-quiet flex items-center justify-between px-5 py-4 text-left transition ${
                selected
                  ? 'ring-2 ring-primary-200 shadow-glow-primary'
                  : 'hover:border-primary-300'
              }`}
            >
              <span className="text-base font-medium text-ink">
                {opt.label}
              </span>
              {selected && (
                <span className="text-primary-500" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
