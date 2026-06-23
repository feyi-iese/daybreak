interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const pct = Math.round(progress * 100);
  return (
    <div
      className="journey-track"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-label="Onboarding progress"
    >
      <div
        className="journey-fill shadow-[0_0_8px_rgba(18,155,134,0.45)] transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
