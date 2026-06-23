import StepShell from '../StepShell';
import type { StepProps } from '../OnboardingFlow';

export default function DisclaimerStep({
  draft,
  update,
  onNext,
  onBack,
  canBack,
  canNext,
  progress,
  onCancel,
}: StepProps) {
  const accepted = !!draft.disclaimerAcceptedAt;

  return (
    <StepShell
      progress={progress}
      canBack={canBack}
      onBack={onBack}
      eyebrow="Before we begin"
      title="A quick, honest note"
      ctaLabel="Continue"
      ctaDisabled={!canNext}
      onCtaClick={onNext}
      onCancel={onCancel}
    >
      <div className="card-quiet text-sm leading-relaxed text-ink-soft">
        Daybreak is an informational companion for tracking your own journey. It
        shares general information drawn from published research. It is not
        medical or dosing advice, and it can&rsquo;t diagnose, prescribe, or
        tell you how to use any medication. For anything about your treatment,
        your healthcare provider is your guide.
      </div>

      <button
        type="button"
        role="switch"
        id="disclaimer-switch"
        aria-checked={accepted}
        onClick={() =>
          update({
            disclaimerAcceptedAt: accepted ? undefined : Date.now(),
          })
        }
        className={`group mt-6 flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-200 ease-out active:scale-[0.99] focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300/40 ${
          accepted
            ? 'border-primary-300 bg-primary-50'
            : 'border-cream-300 bg-cream-50 hover:border-primary-300 hover:bg-cream-100'
        }`}
      >
        <span
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ease-out ${
            accepted ? 'bg-primary-500' : 'bg-cream-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-cream-50 shadow-soft transition-transform duration-200 ease-out ${
              accepted ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </span>
        <span className="select-none text-sm text-ink-soft">
          I understand that Daybreak provides information, not medical advice.
        </span>
      </button>
    </StepShell>
  );
}
