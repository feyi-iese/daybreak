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
      <div className="card-quiet text-ink-soft text-sm leading-relaxed">
        Daybreak is an informational companion for tracking your own journey. It
        shares general information drawn from published research &mdash; it is
        not medical or dosing advice, and it can&rsquo;t diagnose, prescribe, or
        tell you how to use any medication. For anything about your treatment,
        your healthcare provider is your guide.
      </div>

      <div className="mt-6 flex items-center gap-3">
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
          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition ${
            accepted ? 'bg-primary-500' : 'bg-cream-200'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 rounded-full bg-cream-50 shadow-soft transition-transform ${
              accepted ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <label
          htmlFor="disclaimer-switch"
          className="text-sm text-ink-soft select-none"
        >
          I understand that Daybreak provides information, not medical advice.
        </label>
      </div>
    </StepShell>
  );
}
