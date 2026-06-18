import { computeBmi, classifyBmi } from '../lib/bmi';
import type { Profile } from '../db/db';

interface DashboardProps {
  profile: Profile;
  onEdit: () => void;
}

export default function Dashboard({ profile, onEdit }: DashboardProps) {
  // BMI is derived on read, never stored (CLAUDE.md invariant).
  const startingBmi = computeBmi(profile.startingWeightKg, profile.heightCm);
  const targetBmi = computeBmi(profile.targetWeightKg, profile.heightCm);

  return (
    <div>
      <h1>Your profile</h1>

      <dl>
        <div>
          <dt>Gender</dt>
          <dd>{profile.gender === 'female' ? 'Female' : 'Male'}</dd>
        </div>
        <div>
          <dt>Height (cm)</dt>
          <dd>{profile.heightCm}</dd>
        </div>
        <div>
          <dt>Starting weight (kg)</dt>
          <dd>{profile.startingWeightKg}</dd>
        </div>
        <div>
          <dt>Goal weight (kg)</dt>
          <dd>{profile.targetWeightKg}</dd>
        </div>
        <div>
          <dt>Starting BMI</dt>
          <dd>
            <span>{startingBmi.toFixed(1)}</span>{' '}
            <span>{classifyBmi(startingBmi)}</span>
          </dd>
        </div>
        <div>
          <dt>Target BMI</dt>
          <dd>
            <span>{targetBmi.toFixed(1)}</span>{' '}
            <span>{classifyBmi(targetBmi)}</span>
          </dd>
        </div>
      </dl>

      <button type="button" onClick={onEdit}>
        Edit
      </button>
    </div>
  );
}
