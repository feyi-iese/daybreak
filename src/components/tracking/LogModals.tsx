import { useState, useEffect } from 'react';
import type { Dose, FeelingLog, VitalLog, WeighIn } from '../../db/db';
import { kgToLb, lbToKg } from '../../lib/units';

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
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 transition-opacity">
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
            className="btn btn-ghost p-1 rounded-full text-ink-soft hover:bg-cream-200"
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
  const [dosage, setDosage] = useState<number>(2.5);
  const [site, setSite] = useState<string>('None');

  const dosages = [2.5, 5, 7.5, 10, 12.5, 15];
  const sites = ['Abdomen', 'Thigh', 'Arm', 'None'];

  useEffect(() => {
    if (initialData) {
      setDosage(initialData.dosageMg);
      setSite(initialData.injectionSite || 'None');
    } else {
      // Default to 2.5
      setDosage(2.5);
      setSite('None');
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSave({
      at: selectedDate.getTime(),
      name: 'tirzepatide',
      dosageMg: dosage,
      injectionSite: site,
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
          <label className="field-label">Dosage (mg)</label>
          <div className="grid grid-cols-3 gap-2">
            {dosages.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDosage(d)}
                className={`py-2.5 px-3 text-sm font-semibold rounded-xl border transition
                  ${
                    dosage === d
                      ? 'bg-primary-500 text-cream-50 border-primary-500 shadow-glow-primary'
                      : 'border-cream-300 text-ink hover:bg-cream-100'
                  }
                `}
              >
                {d} mg
              </button>
            ))}
          </div>
        </div>

        <div className="field-group">
          <label className="field-label">Injection Site</label>
          <div className="segmented w-full">
            {sites.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSite(s)}
                className={`segmented-option ${site === s ? 'segmented-option--active' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>
          <span className="field-hint">Rotating injection sites can help minimize skin sensitivity.</span>
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
              className={`py-2 px-3 text-sm font-semibold rounded-full border transition
                ${
                  isFeelingGreat
                    ? 'bg-tone-mint-soft text-tone-mint-ink border-tone-mint-edge'
                    : 'border-cream-300 text-ink hover:bg-cream-100'
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
                  className={`py-2 px-3 text-sm font-semibold rounded-full border transition
                    ${
                      isChecked
                        ? 'bg-tone-rose-soft text-tone-rose-ink border-tone-rose-edge'
                        : 'border-cream-300 text-ink hover:bg-cream-100'
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
            <div className="segmented w-full">
              {(['mild', 'moderate', 'severe'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setSeverity(sev)}
                  className={`segmented-option capitalize ${severity === sev ? 'segmented-option--active' : ''}`}
                >
                  {sev}
                </button>
              ))}
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
              className="field-input w-full pr-16"
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
                className="field-input w-full text-center"
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
                className="field-input w-full text-center"
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
              className="field-input w-full pr-16"
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
              className="field-input w-full pr-16"
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
              className="field-input w-full pr-16 text-lg font-semibold"
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
