import type { ReactNode } from 'react';
import ProgressBar from './ProgressBar';

interface StepShellProps {
  progress: number;
  canBack: boolean;
  onBack: () => void;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaDisabled?: boolean;
  ctaVariant?: 'primary' | 'accent';
  onCtaClick: () => void;
  onCancel?: () => void;
  children?: ReactNode;
}

export default function StepShell({
  progress,
  canBack,
  onBack,
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaDisabled,
  ctaVariant = 'primary',
  onCtaClick,
  onCancel,
  children,
}: StepShellProps) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        {canBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-cream-50 text-ink-soft shadow-soft transition-all duration-200 ease-out hover:-translate-x-0.5 hover:border-primary-300 hover:text-ink active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300/50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <ProgressBar progress={progress} />
        </div>
      </div>

      <div className="mt-7">
        {eyebrow && (
          <p className="hero-eyebrow flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 rounded-full bg-primary-600"
            />
            {eyebrow}
          </p>
        )}
        <h1 className="hero-title mt-2.5" tabIndex={-1}>
          {title}
        </h1>
        {subtitle && <p className="hero-sub">{subtitle}</p>}
      </div>

      <div className="mt-8">{children}</div>

      <button
        type="button"
        onClick={onCtaClick}
        disabled={ctaDisabled}
        aria-disabled={ctaDisabled || undefined}
        className={`${ctaVariant === 'accent' ? 'btn-accent' : 'btn-primary'} mt-8 w-full active:scale-[0.99]`}
      >
        {ctaLabel}
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost mt-3 w-full active:scale-[0.99]"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
