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
      <ProgressBar progress={progress} />

      {canBack && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onBack}
            className="btn btn-ghost"
            aria-label="Go back"
          >
            Back
          </button>
        </div>
      )}

      <div className={canBack ? 'mt-4' : 'mt-6'}>
        {eyebrow && <p className="hero-eyebrow">{eyebrow}</p>}
        <h1 className="hero-title mt-2">{title}</h1>
        {subtitle && <p className="hero-sub">{subtitle}</p>}
      </div>

      <div className="mt-8">{children}</div>

      <button
        type="button"
        onClick={onCtaClick}
        disabled={ctaDisabled}
        aria-disabled={ctaDisabled || undefined}
        className={`${ctaVariant === 'accent' ? 'btn-accent' : 'btn-primary'} w-full mt-7`}
      >
        {ctaLabel}
      </button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost w-full mt-3"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
