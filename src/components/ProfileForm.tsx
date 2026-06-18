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
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="gender">Gender</label>
        <select
          id="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value as Gender)}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div>
        <label htmlFor="heightCm">Height (cm)</label>
        <input
          id="heightCm"
          type="number"
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="startingWeightKg">Starting weight (kg)</label>
        <input
          id="startingWeightKg"
          type="number"
          value={startingWeightKg}
          onChange={(e) => setStartingWeightKg(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="targetWeightKg">Goal weight (kg)</label>
        <input
          id="targetWeightKg"
          type="number"
          value={targetWeightKg}
          onChange={(e) => setTargetWeightKg(e.target.value)}
        />
      </div>

      <button type="submit" disabled={!isValid}>
        Save
      </button>
    </form>
  );
}
