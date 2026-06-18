import { useCallback, useEffect, useState } from 'react';
import type { Gender, Profile } from '../../db/db';
import { getProfile, saveProfile } from '../../db/profile';
import WelcomeStep from './steps/WelcomeStep';
import DisclaimerStep from './steps/DisclaimerStep';
import GenderStep from './steps/GenderStep';
import HeightStep from './steps/HeightStep';
import WeightStep from './steps/WeightStep';
import GoalWeightStep from './steps/GoalWeightStep';
import PrivacyStep from './steps/PrivacyStep';

// ---- Public types ----

export interface OnboardingDraft {
  step: number;
  disclaimerAcceptedAt?: number;
  gender?: Gender;
  heightCm: number;
  startingWeightKg: number;
  targetWeightKg: number;
  weightUnit: 'kg' | 'lb';
  heightUnit: 'cm' | 'ftin';
}

export interface StepProps {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
  onNext: () => void;
  onBack: () => void;
  canBack: boolean;
  canNext: boolean;
  progress: number;
  ctaLabel?: string;
  onCancel?: () => void;
}

// ---- Constants ----

const STORAGE_KEY = 'daybreak:onboarding-draft';

const CREATE_STEPS = [
  WelcomeStep,
  DisclaimerStep,
  GenderStep,
  HeightStep,
  WeightStep,
  GoalWeightStep,
  PrivacyStep,
] as const;

const EDIT_STEP_INDICES = [2, 3, 4, 5] as const;

function deriveGoalWeight(startKg: number): number {
  return Math.min(
    startKg - 0.5,
    Math.max(30, Math.round(startKg * 0.9 * 2) / 2),
  );
}

function defaultDraft(): OnboardingDraft {
  return {
    step: 0,
    heightCm: 170,
    startingWeightKg: 80,
    targetWeightKg: deriveGoalWeight(80),
    weightUnit: 'kg',
    heightUnit: 'cm',
  };
}

function draftFromProfile(p: Profile): OnboardingDraft {
  return {
    step: EDIT_STEP_INDICES[0],
    disclaimerAcceptedAt: p.disclaimerAcceptedAt,
    gender: p.gender,
    heightCm: p.heightCm,
    startingWeightKg: p.startingWeightKg,
    targetWeightKg: p.targetWeightKg,
    weightUnit: p.weightUnit ?? 'kg',
    heightUnit: p.heightUnit ?? 'cm',
  };
}

function loadDraftFromStorage(): OnboardingDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OnboardingDraft;
    // Sanity-check: ensure critical numeric fields are valid
    if (parsed.heightCm <= 0) parsed.heightCm = 170;
    if (parsed.startingWeightKg <= 0) parsed.startingWeightKg = 80;
    if (parsed.targetWeightKg <= 0)
      parsed.targetWeightKg = deriveGoalWeight(parsed.startingWeightKg);
    return parsed;
  } catch {
    return null;
  }
}

// ---- Props ----

interface OnboardingFlowProps {
  mode: 'create' | 'edit';
  initial?: Profile;
  onComplete: (profile: Profile) => void;
}

// ---- Component ----

export default function OnboardingFlow({
  mode,
  initial,
  onComplete,
}: OnboardingFlowProps) {
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    if (mode === 'edit' && initial) return draftFromProfile(initial);
    return loadDraftFromStorage() ?? defaultDraft();
  });
  const [committing, setCommitting] = useState(false);

  // Mirror draft to localStorage in create mode
  useEffect(() => {
    if (mode === 'create') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }
  }, [draft, mode]);

  const update = useCallback(
    (patch: Partial<OnboardingDraft>) => {
      setDraft((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const isEdit = mode === 'edit';
  const step = draft.step;

  // Step boundaries
  const firstStep = isEdit ? EDIT_STEP_INDICES[0] : 0;
  const lastStep = isEdit
    ? EDIT_STEP_INDICES[EDIT_STEP_INDICES.length - 1]
    : CREATE_STEPS.length - 1;

  const canBack = step > firstStep;
  const isLastStep = step === lastStep;

  // Per-step gating
  let canNext = true;
  if (step === 1) canNext = draft.disclaimerAcceptedAt !== undefined;
  if (step === 2) canNext = draft.gender !== undefined;

  // Progress: Welcome (step 0) shows no bar; steps 1-6 map to 0→1
  // In edit mode: steps 2-5 map to 0→1
  const progress = isEdit
    ? (step - EDIT_STEP_INDICES[0]) /
      (EDIT_STEP_INDICES.length - 1)
    : step / (CREATE_STEPS.length - 1);

  const commit = useCallback(async () => {
    if (committing) return;
    setCommitting(true);
    try {
      await saveProfile({
        gender: draft.gender!,
        heightCm: draft.heightCm,
        startingWeightKg: draft.startingWeightKg,
        targetWeightKg: draft.targetWeightKg,
        disclaimerAcceptedAt:
          draft.disclaimerAcceptedAt ??
          initial?.disclaimerAcceptedAt ??
          Date.now(),
        weightUnit: draft.weightUnit,
        heightUnit: draft.heightUnit,
      });
      const saved = await getProfile();
      localStorage.removeItem(STORAGE_KEY);
      onComplete(saved!);
    } finally {
      setCommitting(false);
    }
  }, [committing, draft, initial, onComplete]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      void commit();
    } else {
      // In edit mode, advance to next valid edit step
      if (isEdit) {
        const currentIdx = EDIT_STEP_INDICES.indexOf(
          step as (typeof EDIT_STEP_INDICES)[number],
        );
        if (currentIdx < EDIT_STEP_INDICES.length - 1) {
          update({ step: EDIT_STEP_INDICES[currentIdx + 1] });
        }
      } else {
        update({ step: step + 1 });
      }
    }
  }, [isLastStep, commit, isEdit, step, update]);

  const handleBack = useCallback(() => {
    if (isEdit) {
      const currentIdx = EDIT_STEP_INDICES.indexOf(
        step as (typeof EDIT_STEP_INDICES)[number],
      );
      if (currentIdx > 0) {
        update({ step: EDIT_STEP_INDICES[currentIdx - 1] });
      }
    } else {
      update({ step: Math.max(0, step - 1) });
    }
  }, [isEdit, step, update]);

  const handleCancel = useCallback(() => {
    if (initial) onComplete(initial);
  }, [initial, onComplete]);

  // Determine which step component to render
  const StepComponent = CREATE_STEPS[step];
  if (!StepComponent) return null;

  const stepProps: StepProps = {
    draft,
    update,
    onNext: handleNext,
    onBack: handleBack,
    canBack,
    canNext,
    progress,
    ctaLabel: isLastStep && isEdit ? 'Save changes' : undefined,
    onCancel: isEdit ? handleCancel : undefined,
  };

  return (
    <div key={step} className="animate-fade-rise">
      <StepComponent {...stepProps} />
    </div>
  );
}
