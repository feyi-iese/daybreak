import type { StepProps } from '../OnboardingFlow';

export default function WelcomeStep({ onNext }: StepProps) {
  return (
    <div className="card">
      <p className="hero-eyebrow flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-1.5 w-1.5 rounded-full bg-primary-600 shadow-glow"
        />
        Welcome to Daybreak
      </p>
      <h1 className="hero-title mt-2.5" tabIndex={-1}>
        A brighter chapter begins here
      </h1>
      <p className="hero-sub">
        Daybreak walks beside you on your tirzepatide journey, tracking where you
        started, how far you&rsquo;ve come, and the bright place you&rsquo;re
        headed. No accounts, no servers. Just your progress, on your terms.
      </p>
      <button
        type="button"
        onClick={onNext}
        className="btn-primary mt-8 w-full animate-glow-pulse active:scale-[0.99]"
      >
        Let&rsquo;s begin
      </button>
      <p className="footnote mt-4 text-center">
        Takes about a minute. You can change anything later.
      </p>
    </div>
  );
}
