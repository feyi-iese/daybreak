import { useState, type FormEvent } from 'react';
import type { Gender, Profile } from '../db/db';

interface ProfileFormValues {
  gender: Gender;
  heightCm: number;
  startingWeightKg: number;
  targetWeightKg: number;
}

interface ProfileFormProps {
  initial?: Profile;
  onSubmit: (values: ProfileFormValues) => void;
}

export default function ProfileForm({ initial, onSubmit }: ProfileFormProps) {
  const [gender, setGender] = useState<Gender>(initial?.gender ?? 'male');
  const [heightCm, setHeightCm] = useState(
    initial ? String(initial.heightCm) : '',
  );
  const [startingWeightKg, setStartingWeightKg] = useState(
    initial ? String(initial.startingWeightKg) : '',
  );
  const [targetWeightKg, setTargetWeightKg] = useState(
    initial ? String(initial.targetWeightKg) : '',
  );

  // Inputs are stored as raw strings; parse once for validation/submission.
  const height = Number(heightCm);
  const starting = Number(startingWeightKg);
  const target = Number(targetWeightKg);
  const isValid =
    heightCm !== '' &&
    startingWeightKg !== '' &&
    targetWeightKg !== '' &&
    height > 0 &&
    starting > 0 &&
    target > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid) return;
    onSubmit({
      gender,
      heightCm: height,
      startingWeightKg: starting,
      targetWeightKg: target,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card" noValidate>
      <header className="mb-7">
        <p className="hero-eyebrow">Your fresh start</p>
        <h1 className="hero-title mt-2">A few details to begin</h1>
        <p className="hero-sub">
          Tell us where you're starting from so we can walk every step of the
          journey with you.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        <div className="field-group">
          <label className="field-label" htmlFor="gender">
            Gender
          </label>
          <select
            id="gender"
            className="field-select"
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="heightCm">
            Height
          </label>
          <input
            id="heightCm"
            className="field-input"
            type="number"
            inputMode="numeric"
            placeholder="e.g. 170"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
          />
          <p className="field-hint">In centimetres (cm).</p>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="startingWeightKg">
            Starting weight
          </label>
          <input
            id="startingWeightKg"
            className="field-input"
            type="number"
            inputMode="decimal"
            placeholder="e.g. 90"
            value={startingWeightKg}
            onChange={(e) => setStartingWeightKg(e.target.value)}
          />
          <p className="field-hint">In kilograms (kg) — today's number, no judgement.</p>
        </div>

        <div className="field-group">
          <label className="field-label" htmlFor="targetWeightKg">
            Goal weight
          </label>
          <input
            id="targetWeightKg"
            className="field-input"
            type="number"
            inputMode="decimal"
            placeholder="e.g. 70"
            value={targetWeightKg}
            onChange={(e) => setTargetWeightKg(e.target.value)}
          />
          <p className="field-hint">In kilograms (kg) — where you're headed.</p>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-accent mt-7 w-full"
        disabled={!isValid}
      >
        Save my plan
      </button>

      <p className="footnote mt-4 text-center">
        Your data stays on your device.
      </p>
    </form>
  );
}
