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
      subtitle="This helps us frame body-composition context. It won't change your BMI category. Those are the same for everyone."
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
              className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 ease-out active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300/40 ${
                selected
                  ? 'border-primary-300 bg-primary-50 shadow-glow-primary'
                  : 'border-cream-300 bg-cream-50 dark:bg-cream-50 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-soft'
              }`}
            >
              <span
                className={`text-base font-medium ${selected ? 'text-primary-700 dark:text-primary-700' : 'text-ink'}`}
              >
                {opt.label}
              </span>
              <span
                aria-hidden="true"
                className={`flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ease-out ${
                  selected
                    ? 'border-primary-500 bg-primary-500 text-cream-50 dark:text-ink'
                    : 'border-cream-300 bg-cream-100 text-transparent'
                }`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
