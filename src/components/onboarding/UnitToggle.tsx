interface UnitToggleOption {
  label: string;
  value: string;
}

interface UnitToggleProps {
  options: UnitToggleOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}

export default function UnitToggle({
  options,
  value,
  onChange,
  ariaLabel = 'Unit',
}: UnitToggleProps) {
  return (
    <div className="segmented" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`segmented-option${value === opt.value ? ' segmented-option--active' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
