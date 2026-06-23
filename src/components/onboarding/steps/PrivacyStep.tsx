import StepShell from '../StepShell';
import type { StepProps } from '../OnboardingFlow';

export default function PrivacyStep({
  onNext,
  onBack,
  canBack,
  progress,
}: StepProps) {
  return (
    <StepShell
      progress={progress}
      canBack={canBack}
      onBack={onBack}
      eyebrow="Your data, your rules"
      title="Everything stays on this device"
      subtitle="Daybreak has no accounts and no servers. Your details, your weight, your whole journey live only in this browser, on this device. Never uploaded, never sold, never shared."
      ctaLabel="Save my plan"
      ctaVariant="accent"
      onCtaClick={onNext}
    >
      <div className="flex flex-wrap gap-2">
        <span className="chip border-primary-200 bg-primary-50 text-primary-600">
          On-device only
        </span>
        <span className="chip border-primary-200 bg-primary-50 text-primary-600">
          No account
        </span>
        <span className="chip border-primary-200 bg-primary-50 text-primary-600">
          Yours to delete anytime
        </span>
      </div>
      <p className="footnote mt-4">
        Clearing this browser&rsquo;s data removes everything, completely.
      </p>
    </StepShell>
  );
}
