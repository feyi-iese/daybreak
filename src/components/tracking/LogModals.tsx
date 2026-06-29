import { useState, useEffect } from 'react';
import type { Dose, FeelingLog, VitalLog, WeighIn } from '../../db/db';
import { kgToLb, lbToKg } from '../../lib/units';
import { GLP1_MEDICATIONS, INJECTION_SITES, findMedication } from '../../lib/medications';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  onDelete?: () => void;
  children: React.ReactNode;
}

function ModalWrapper({ isOpen, onClose, title, subtitle, onDelete, children }: ModalWrapperProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-scrim backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 transition-opacity">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Modal Card */}
      <div
        className="card w-full max-w-md relative z-10 animate-fade-rise flex flex-col max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cream-300 pb-4 mb-4">
          <div>
            <span className="hero-eyebrow text-primary-500">{subtitle}</span>
            <h3 id="modal-title" className="section-title text-xl text-ink mt-0.5">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost p-1 rounded-full text-ink-soft hover:bg-cream-200 dark:hover:bg-cream-200/80"
            aria-label="Close modal"
            type="button"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 pb-4">{children}</div>

        {/* Optional Delete Button in Footer */}
        {onDelete && (
          <div className="border-t border-cream-300 pt-4 flex justify-end">
            <button
              onClick={onDelete}
              className="btn btn-ghost text-sm text-tone-rose-ink hover:bg-tone-rose-soft py-2 px-4 rounded-xl"
              type="button"
            >
              Delete Entry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 1. DOSE MODAL
interface DoseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  initialData?: Dose;
  onSave: (dose: Omit<Dose, 'id'>) => Promise<void>;
  onDelete?: () => void;
}

export function DoseModal({ isOpen, onClose, selectedDate, initialData, onSave, onDelete }: DoseModalProps) {
  const [medication, setMedication] = useState<string>('Mounjaro');
  const [customName, setCustomName] = useState<string>('');   // only for "Other"
  const [dosage, setDosage] = useState<number>(2.5);
  const [customDosage, setCustomDosage] = useState<string>(''); // only for "Other"
  const [site, setSite] = useState<string>('None');
  const [takenTime, setTakenTime] = useState<string>(''); // HH:MM string for <input type="time">

  useEffect(() => {
    if (initialData) {
      // Resolve medication name
      const knownMed = GLP1_MEDICATIONS.find((m) => m.id === initialData.name);
      if (knownMed) {
        setMedication(knownMed.id);
        setCustomName('');
        // Resolve dosage
        if (knownMed.dosesMg.includes(initialData.dosageMg)) {
          setDosage(initialData.dosageMg);
        } else {
          setDosage(knownMed.dosesMg[0]);
        }
        setCustomDosage('');
      } else if (initialData.name === 'tirzepatide') {
        // legacy name for tirzepatide maps to Mounjaro
        setMedication('Mounjaro');
        setCustomName('');
        const mounjaro = GLP1_MEDICATIONS.find((m) => m.id === 'Mounjaro')!;
        if (mounjaro.dosesMg.includes(initialData.dosageMg)) {
          setDosage(initialData.dosageMg);
        } else {
          setDosage(mounjaro.dosesMg[0]);
        }
        setCustomDosage('');
      } else {
        setMedication('Other');
        setCustomName(initialData.name);
        setCustomDosage(String(initialData.dosageMg));
        setDosage(0); // fallback
      }

      // Resolve injection site
      const siteExists = INJECTION_SITES.some((s) => s.value === initialData.injectionSite);
      if (siteExists || initialData.injectionSite === 'None') {
        setSite(initialData.injectionSite || 'None');
      } else {
        setSite('None');
      }

      if (initialData.takenAt) {
        const d = new Date(initialData.takenAt);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        setTakenTime(`${hh}:${mm}`);
      } else {
        setTakenTime('');
      }
    } else {
      setMedication('Mounjaro');
      setCustomName('');
      setDosage(2.5);
      setCustomDosage('');
      setSite('None');
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setTakenTime(`${hh}:${mm}`);
    }
  }, [initialData, isOpen]);

  const handleMedicationChange = (medId: string) => {
    setMedication(medId);
    if (medId !== 'Other') {
      const med = findMedication(medId);
      if (med) {
        if (!med.dosesMg.includes(dosage)) {
          setDosage(med.dosesMg[0]);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedName = medication === 'Other' ? (customName.trim() || 'Other') : medication;
    const resolvedDosage = medication === 'Other' ? (parseFloat(customDosage) || 0) : dosage;

    let takenAt: number | undefined;
    if (takenTime) {
      const [hh, mm] = takenTime.split(':').map(Number);
      const taken = new Date(selectedDate);
      taken.setHours(hh, mm, 0, 0);
      takenAt = taken.getTime();
    }

    void onSave({
      at: selectedDate.getTime(),
      name: resolvedName,
      dosageMg: resolvedDosage,
      injectionSite: site,
      takenAt,
    });
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Dose' : 'Log Dose'}
      subtitle={selectedDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
      onDelete={onDelete}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="field-group">
          <label className="field-label">Medication</label>
          <div role="radiogroup" aria-label="Medication" className="flex flex-col gap-2">
            {GLP1_MEDICATIONS.map((med) => (
              <button
                type="button"
                role="radio"
                aria-checked={medication === med.id}
                key={med.id}
                onClick={() => handleMedicationChange(med.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-left transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary-300/50
                  ${
                    medication === med.id
                      ? 'bg-primary-500 text-cream-50 dark:text-ink border-primary-500 shadow-glow-primary'
                      : 'border-cream-300 text-ink hover:bg-cream-100 dark:hover:bg-cream-200/80'
                  }`}
              >
                <div>
                  <span className="font-semibold text-sm">{med.brand}</span>
                  <span
                    className={`block text-xs ${
                      medication === med.id ? 'text-cream-100/80 dark:text-ink-soft' : 'text-ink-muted'
                    }`}
                  >
                    {med.generic}
                  </span>
                </div>
                {medication === med.id && (
                  <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
            <button
              type="button"
              role="radio"
              aria-checked={medication === 'Other'}
              onClick={() => handleMedicationChange('Other')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-left transition active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary-300/50
                ${
                  medication === 'Other'
                    ? 'bg-primary-500 text-cream-50 dark:text-ink border-primary-500 shadow-glow-primary'
                    : 'border-cream-300 text-ink hover:bg-cream-100 dark:hover:bg-cream-200/80'
                }`}
            >
              <span className="font-semibold text-sm">Other</span>
              {medication === 'Other' && (
                <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Dosage (mg)</label>
          {medication !== 'Other' ? (
            <div className="grid grid-cols-3 gap-2">
              {findMedication(medication)!.dosesMg.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDosage(d)}
                  className={`py-2.5 px-3 text-sm font-semibold rounded-xl border transition active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary-300/50
                    ${
                      dosage === d
                        ? 'bg-primary-500 text-cream-50 dark:text-ink border-primary-500 shadow-glow-primary'
                        : 'border-cream-300 text-ink hover:bg-cream-100 dark:hover:bg-cream-200/80'
                    }
                  `}
                >
                  {d} mg
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                className="field-input w-full"
                placeholder="Drug name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required={medication === 'Other'}
              />
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  inputMode="decimal"
                  className="field-input w-full pr-12 font-mono tabular-nums"
                  placeholder="0"
                  value={customDosage}
                  onChange={(e) => setCustomDosage(e.target.value)}
                  required={medication === 'Other'}
                />
              </div>
            </div>
          )}
        </div>

        <div className="field-group">
          <label className="field-label">Injection Site</label>
          <div role="radiogroup" aria-label="Injection site" className="space-y-4">
            {(['Abdomen', 'Thigh', 'Upper Arm'] as const).map((area) => {
              const areaSites = INJECTION_SITES.filter((s) => s.area === area);
              const gridCols = area === 'Abdomen' ? 'grid-cols-3' : 'grid-cols-2';
              return (
                <div key={area} className="space-y-1.5">
                  <span className="section-label">{area}</span>
                  <div className={`grid ${gridCols} gap-2`}>
                    {areaSites.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        role="radio"
                        aria-checked={site === s.value}
                        aria-label={`${area} ${s.label}`}
                        onClick={() => setSite(s.value)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border transition active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary-300/50
                          ${
                            site === s.value
                              ? 'bg-primary-500 text-cream-50 dark:text-ink border-primary-500 shadow-glow-primary'
                              : 'border-cream-300 text-ink hover:bg-cream-100 dark:hover:bg-cream-200/80'
                          }
                        `}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="pt-3 border-t border-cream-300">
              <button
                type="button"
                role="radio"
                aria-checked={site === 'None'}
                aria-label="No injection site"
                onClick={() => setSite('None')}
                className={`w-full py-2.5 px-3 text-sm font-semibold rounded-xl border transition active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-primary-300/50
                  ${
                    site === 'None'
                      ? 'bg-primary-500 text-cream-50 dark:text-ink border-primary-500 shadow-glow-primary'
                      : 'border-cream-300 text-ink hover:bg-cream-100 dark:hover:bg-cream-200/80'
                  }
                `}
              >
                None
              </button>
            </div>
          </div>
          <span className="field-hint mt-2 block">Rotating injection sites can help minimize skin sensitivity.</span>
        </div>

        <div className="field-group">
          <label htmlFor="dose-time" className="field-label">Time Taken</label>
          <input
            id="dose-time"
            type="time"
            className="field-input w-full"
            value={takenTime}
            onChange={(e) => setTakenTime(e.target.value)}
          />
          <span className="field-hint">When you administered the injection.</span>
        </div>

        <button type="submit" className="btn btn-primary w-full py-3 rounded-2xl font-bold">
          {initialData ? 'Save Changes' : 'Record Dose'}
        </button>
      </form>
    </ModalWrapper>
  );
}

// 2. FEELINGS MODAL
interface FeelingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  initialData?: FeelingLog;
  onSave: (feeling: Omit<FeelingLog, 'id'>) => Promise<void>;
  onDelete?: () => void;
}

export function FeelingModal({ isOpen, onClose, selectedDate, initialData, onSave, onDelete }: FeelingModalProps) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe' | undefined>(undefined);
  const [note, setNote] = useState<string>('');

  const symptomsList = [
    'Nausea',
    'Vomiting',
    'Diarrhea',
    'Constipation',
    'Decreased Appetite',
    'Fatigue',
    'Bloating',
    'Heartburn',
    'Abdominal Pain',
    'Headache',
    'Dizziness',
    'Injection Site Reaction',
  ];

  useEffect(() => {
    if (initialData) {
      setSelectedSymptoms(initialData.symptoms);
      setSeverity(initialData.severity);
      setNote(initialData.note || '');
    } else {
      setSelectedSymptoms([]);
      setSeverity(undefined);
      setNote('');
    }
  }, [initialData, isOpen]);

  const toggleSymptom = (symptom: string) => {
    if (symptom === 'Feeling great!') {
      setSelectedSymptoms([]);
      setSeverity(undefined);
      return;
    }

    setSelectedSymptoms((prev) => {
      const next = prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom];
      // Auto-set severity if adding first symptom
      if (next.length > 0 && severity === undefined) {
        setSeverity('mild');
      } else if (next.length === 0) {
        setSeverity(undefined);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSave({
      at: selectedDate.getTime(),
      symptoms: selectedSymptoms,
      severity: selectedSymptoms.length > 0 ? severity : undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  const isFeelingGreat = selectedSymptoms.length === 0;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Feelings' : 'Log Feelings'}
      subtitle={selectedDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
      onDelete={onDelete}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="field-group">
          <label className="field-label">How are you feeling?</label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleSymptom('Feeling great!')}
              className={`py-2 px-3 text-sm font-semibold rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/50 active:scale-95
                ${
                  isFeelingGreat
                    ? 'bg-tone-mint-soft text-tone-mint-ink border-tone-mint-edge'
                    : 'border-cream-300 text-ink hover:bg-cream-100 dark:hover:bg-cream-200/80'
                }
              `}
            >
              Feeling great! 😊
            </button>
            {symptomsList.map((sym) => {
              const isChecked = selectedSymptoms.includes(sym);
              return (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`py-2 px-3 text-sm font-semibold rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/50 active:scale-95
                    ${
                      isChecked
                        ? 'bg-tone-rose-soft text-tone-rose-ink border-tone-rose-edge'
                        : 'border-cream-300 text-ink hover:bg-cream-100 dark:hover:bg-cream-200/80'
                    }
                  `}
                >
                  {sym}
                </button>
              );
            })}
          </div>
        </div>

        {selectedSymptoms.length > 0 && (
          <div className="field-group animate-fade-rise">
            <label className="field-label">Symptom Severity</label>
            <div className="segmented w-full flex" role="radiogroup" aria-label="Symptom Severity">
              {(['mild', 'moderate', 'severe'] as const).map((sev) => {
                const isActive = severity === sev;
                let activeStyle = 'segmented-option--active text-ink bg-cream-50 shadow-sm';
                if (isActive) {
                  if (sev === 'mild') activeStyle = 'bg-tone-mint-soft text-tone-mint-ink border border-tone-mint-edge/50 shadow-sm';
                  if (sev === 'moderate') activeStyle = 'bg-tone-sun-soft text-tone-sun-ink border border-tone-sun-edge/50 shadow-sm';
                  if (sev === 'severe') activeStyle = 'bg-tone-rose-soft text-tone-rose-ink border border-tone-rose-edge/50 shadow-sm';
                }
                return (
                  <button
                    key={sev}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setSeverity(sev)}
                    className={`segmented-option flex-1 flex items-center justify-center py-2.5 text-sm font-semibold rounded-xl capitalize transition duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/50 active:scale-95 ${
                      isActive ? activeStyle : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {sev}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="field-group">
          <label htmlFor="reflection-note" className="field-label">Daily Reflection / Notes</label>
          <textarea
            id="reflection-note"
            className="field-input w-full min-h-[80px] text-sm p-3"
            placeholder="How are you feeling today? Any changes in appetite, energy, or digestion?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary w-full py-3 rounded-2xl font-bold">
          {initialData ? 'Save Changes' : 'Save Feelings'}
        </button>
      </form>
    </ModalWrapper>
  );
}

// 3. VITALS MODAL
interface VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  initialData?: VitalLog;
  onSave: (vital: Omit<VitalLog, 'id'>) => Promise<void>;
  onDelete?: () => void;
}

export function VitalsModal({ isOpen, onClose, selectedDate, initialData, onSave, onDelete }: VitalsModalProps) {
  const [bloodSugar, setBloodSugar] = useState<string>('');
  const [bpSys, setBpSys] = useState<string>('');
  const [bpDia, setBpDia] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [waist, setWaist] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setBloodSugar(initialData.bloodSugar?.toString() || '');
      setBpSys(initialData.bloodPressureSystolic?.toString() || '');
      setBpDia(initialData.bloodPressureDiastolic?.toString() || '');
      setHeartRate(initialData.heartRate?.toString() || '');
      setWaist(initialData.waistCircumferenceCm?.toString() || '');
    } else {
      setBloodSugar('');
      setBpSys('');
      setBpDia('');
      setHeartRate('');
      setWaist('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const bs = parseInt(bloodSugar, 10);
    const bps = parseInt(bpSys, 10);
    const bpd = parseInt(bpDia, 10);
    const hr = parseInt(heartRate, 10);
    const w = parseFloat(waist);

    void onSave({
      at: selectedDate.getTime(),
      bloodSugar: !isNaN(bs) ? bs : undefined,
      bloodPressureSystolic: !isNaN(bps) ? bps : undefined,
      bloodPressureDiastolic: !isNaN(bpd) ? bpd : undefined,
      heartRate: !isNaN(hr) ? hr : undefined,
      waistCircumferenceCm: !isNaN(w) ? w : undefined,
    });
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Vitals' : 'Log Vitals'}
      subtitle={selectedDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
      onDelete={onDelete}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="field-group">
          <label htmlFor="blood-sugar" className="field-label">Blood Sugar</label>
          <div className="relative">
            <input
              id="blood-sugar"
              type="number"
              min="20"
              max="600"
              className="field-input w-full pr-16 font-mono tabular-nums"
              placeholder="e.g. 95"
              value={bloodSugar}
              onChange={(e) => setBloodSugar(e.target.value)}
            />
            <span className="absolute right-3 top-3 text-sm text-ink-muted pointer-events-none">mg/dL</span>
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Blood Pressure</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                aria-label="Systolic BP"
                type="number"
                min="50"
                max="250"
                className="field-input w-full text-center font-mono tabular-nums"
                placeholder="Systolic (120)"
                value={bpSys}
                onChange={(e) => setBpSys(e.target.value)}
              />
            </div>
            <span className="text-xl text-cream-400 self-center">/</span>
            <div className="flex-1">
              <input
                aria-label="Diastolic BP"
                type="number"
                min="30"
                max="150"
                className="field-input w-full text-center font-mono tabular-nums"
                placeholder="Diastolic (80)"
                value={bpDia}
                onChange={(e) => setBpDia(e.target.value)}
              />
            </div>
            <span className="text-sm text-ink-muted self-center">mmHg</span>
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="heart-rate" className="field-label">Heart Rate</label>
          <div className="relative">
            <input
              id="heart-rate"
              type="number"
              min="30"
              max="220"
              className="field-input w-full pr-16 font-mono tabular-nums"
              placeholder="e.g. 72"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
            />
            <span className="absolute right-3 top-3 text-sm text-ink-muted pointer-events-none">bpm</span>
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="waist-circ" className="field-label">Waist Circumference</label>
          <div className="relative">
            <input
              id="waist-circ"
              type="number"
              min="30"
              max="250"
              step="0.1"
              className="field-input w-full pr-16 font-mono tabular-nums"
              placeholder="e.g. 85"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
            />
            <span className="absolute right-3 top-3 text-sm text-ink-muted pointer-events-none">cm</span>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full py-3 rounded-2xl font-bold">
          {initialData ? 'Save Changes' : 'Save Vitals'}
        </button>
      </form>
    </ModalWrapper>
  );
}

// 4. WEIGHT MODAL
interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  initialData?: WeighIn;
  weightUnit: 'kg' | 'lb';
  onSave: (weighIn: Omit<WeighIn, 'id'>) => Promise<void>;
  onDelete?: () => void;
}

export function WeightModal({ isOpen, onClose, selectedDate, initialData, weightUnit, onSave, onDelete }: WeightModalProps) {
  const [weightInput, setWeightInput] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      const val = weightUnit === 'lb' ? kgToLb(initialData.weightKg) : initialData.weightKg;
      setWeightInput(val.toFixed(1));
    } else {
      setWeightInput('');
    }
  }, [initialData, isOpen, weightUnit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 0) {
      const weightKg = weightUnit === 'lb' ? lbToKg(val) : val;
      void onSave({
        at: selectedDate.getTime(),
        weightKg,
      });
      onClose();
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Weight' : 'Log Weight'}
      subtitle={selectedDate.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
      onDelete={onDelete}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="field-group">
          <label htmlFor="weight-input" className="field-label">Body Weight</label>
          <div className="relative">
            <input
              id="weight-input"
              type="number"
              step="0.1"
              min="30"
              max="600"
              required
              className="field-input w-full pr-16 text-lg font-semibold font-mono tabular-nums"
              placeholder={weightUnit === 'lb' ? '175.0' : '80.0'}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
            />
            <span className="absolute right-3 top-3.5 text-base font-medium text-ink-muted pointer-events-none">
              {weightUnit}
            </span>
          </div>
          <span className="field-hint">
            For consistent charting, try to weigh in at the same time of day.
          </span>
        </div>

        <button type="submit" className="btn btn-primary w-full py-3 rounded-2xl font-bold">
          {initialData ? 'Save Changes' : 'Save Weight'}
        </button>
      </form>
    </ModalWrapper>
  );
}
