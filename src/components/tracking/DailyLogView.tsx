import { useState, useEffect, useCallback, useRef } from 'react';
import type { Profile, Dose, FeelingLog, VitalLog, WeighIn } from '../../db/db';
import { getLogsForDay } from '../../db/logs';
import { addDose, updateDose, deleteDose, getDosesForRange } from '../../db/doses';
import { addFeeling, updateFeeling, deleteFeeling, getFeelingsForRange } from '../../db/feelings';
import { addVital, updateVital, deleteVital, getVitalsForRange } from '../../db/vitals';
import { addWeighIn, updateWeighIn, deleteWeighIn, getWeighInsForRange } from '../../db/weighIns';
import { getCalendarMonthGrid, getStartOfDay, getEndOfDay, formatDateKey } from '../../lib/dateUtils';
import Calendar from './Calendar';
import DayDetail from './DayDetail';
import { DoseModal, FeelingModal, VitalsModal, WeightModal } from './LogModals';

interface DailyLogViewProps {
  profile: Profile;
}

export default function DailyLogView({ profile }: DailyLogViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());

  // Daily log state for selected date
  const [doses, setDoses] = useState<Dose[]>([]);
  const [feeling, setFeeling] = useState<FeelingLog | undefined>(undefined);
  const [vital, setVital] = useState<VitalLog | undefined>(undefined);
  const [weighIn, setWeighIn] = useState<WeighIn | undefined>(undefined);

  // Calendar indicators state
  const [loggedDates, setLoggedDates] = useState<
    Record<string, { doses?: boolean; feelings?: boolean; vitals?: boolean; weighIn?: boolean }>
  >({});

  // Modal control
  const [activeModal, setActiveModal] = useState<'dose' | 'feeling' | 'vital' | 'weight' | null>(null);

  // Custom delete confirmation (replaces native window.confirm)
  const [pendingDelete, setPendingDelete] = useState<{
    category: 'dose' | 'feeling' | 'vital' | 'weight';
    id: number;
  } | null>(null);

  // Fetch all logs for current month grid to render dots
  const fetchMonthLogs = useCallback(async () => {
    const grid = getCalendarMonthGrid(currentMonth.getFullYear(), currentMonth.getMonth());
    if (grid.length === 0) return;

    const start = getStartOfDay(grid[0].date).getTime();
    const end = getEndOfDay(grid[grid.length - 1].date).getTime();

    const [monthDoses, monthFeelings, monthVitals, monthWeighIns] = await Promise.all([
      getDosesForRange(start, end),
      getFeelingsForRange(start, end),
      getVitalsForRange(start, end),
      getWeighInsForRange(start, end),
    ]);

    const map: Record<string, { doses?: boolean; feelings?: boolean; vitals?: boolean; weighIn?: boolean }> = {};

    monthDoses.forEach((d) => {
      const k = formatDateKey(new Date(d.at));
      if (!map[k]) map[k] = {};
      map[k].doses = true;
    });

    monthFeelings.forEach((f) => {
      const k = formatDateKey(new Date(f.at));
      if (!map[k]) map[k] = {};
      map[k].feelings = true;
    });

    monthVitals.forEach((v) => {
      const k = formatDateKey(new Date(v.at));
      if (!map[k]) map[k] = {};
      map[k].vitals = true;
    });

    monthWeighIns.forEach((w) => {
      const k = formatDateKey(new Date(w.at));
      if (!map[k]) map[k] = {};
      map[k].weighIn = true;
    });

    setLoggedDates(map);
  }, [currentMonth]);

  // Fetch logs for the selected day
  const fetchDayLogs = useCallback(async () => {
    const logs = await getLogsForDay(selectedDate.getTime());
    setDoses(logs.doses);
    setFeeling(logs.feeling);
    setVital(logs.vital);
    setWeighIn(logs.weighIn);
  }, [selectedDate]);

  useEffect(() => {
    void fetchDayLogs();
  }, [fetchDayLogs]);

  useEffect(() => {
    void fetchMonthLogs();
  }, [fetchMonthLogs]);

  // Handle Save
  const handleSaveDose = async (doseData: Omit<Dose, 'id'>) => {
    const existing = doses[0]; // If editing, update first dose. Or we pass down individual items.
    if (existing?.id) {
      await updateDose(existing.id, doseData);
    } else {
      await addDose(doseData);
    }
    await Promise.all([fetchDayLogs(), fetchMonthLogs()]);
  };

  const handleSaveFeeling = async (feelingData: Omit<FeelingLog, 'id'>) => {
    if (feeling?.id) {
      await updateFeeling(feeling.id, feelingData);
    } else {
      await addFeeling(feelingData);
    }
    await Promise.all([fetchDayLogs(), fetchMonthLogs()]);
  };

  const handleSaveVital = async (vitalData: Omit<VitalLog, 'id'>) => {
    if (vital?.id) {
      await updateVital(vital.id, vitalData);
    } else {
      await addVital(vitalData);
    }
    await Promise.all([fetchDayLogs(), fetchMonthLogs()]);
  };

  const handleSaveWeight = async (weighInData: Omit<WeighIn, 'id'>) => {
    if (weighIn?.id) {
      await updateWeighIn(weighIn.id, weighInData);
    } else {
      await addWeighIn(weighInData);
    }
    await Promise.all([fetchDayLogs(), fetchMonthLogs()]);
  };

  // Handle Delete: stage a confirmation instead of a native browser dialog.
  const handleDeleteLog = async (category: 'dose' | 'feeling' | 'vital' | 'weight', id: number) => {
    setPendingDelete({ category, id });
  };

  const performDelete = async () => {
    if (!pendingDelete) return;
    const { category, id } = pendingDelete;

    if (category === 'dose') await deleteDose(id);
    if (category === 'feeling') await deleteFeeling(id);
    if (category === 'vital') await deleteVital(id);
    if (category === 'weight') await deleteWeighIn(id);

    setPendingDelete(null);
    setActiveModal(null);
    await Promise.all([fetchDayLogs(), fetchMonthLogs()]);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <div className="card w-full">
        <Calendar
          selectedDate={selectedDate}
          onChangeSelectedDate={setSelectedDate}
          currentMonth={currentMonth}
          onChangeCurrentMonth={setCurrentMonth}
          loggedDates={loggedDates}
        />
      </div>

      {/* Selected Date Detail List Card */}
      <DayDetail
        selectedDate={selectedDate}
        doses={doses}
        feeling={feeling}
        vital={vital}
        weighIn={weighIn}
        weightUnit={profile.weightUnit || 'kg'}
        onTriggerLog={setActiveModal}
        onDeleteLog={handleDeleteLog}
      />

      {/* Modals */}
      <DoseModal
        isOpen={activeModal === 'dose'}
        onClose={() => setActiveModal(null)}
        selectedDate={selectedDate}
        initialData={doses[0]}
        onSave={handleSaveDose}
        onDelete={doses[0]?.id ? () => handleDeleteLog('dose', doses[0].id!) : undefined}
      />

      <FeelingModal
        isOpen={activeModal === 'feeling'}
        onClose={() => setActiveModal(null)}
        selectedDate={selectedDate}
        initialData={feeling}
        onSave={handleSaveFeeling}
        onDelete={feeling?.id ? () => handleDeleteLog('feeling', feeling.id!) : undefined}
      />

      <VitalsModal
        isOpen={activeModal === 'vital'}
        onClose={() => setActiveModal(null)}
        selectedDate={selectedDate}
        initialData={vital}
        onSave={handleSaveVital}
        onDelete={vital?.id ? () => handleDeleteLog('vital', vital.id!) : undefined}
      />

      <WeightModal
        isOpen={activeModal === 'weight'}
        onClose={() => setActiveModal(null)}
        selectedDate={selectedDate}
        initialData={weighIn}
        weightUnit={profile.weightUnit || 'kg'}
        onSave={handleSaveWeight}
        onDelete={weighIn?.id ? () => handleDeleteLog('weight', weighIn.id!) : undefined}
      />

      {/* Delete confirmation (custom, no native dialog) */}
      <ConfirmDialog
        isOpen={pendingDelete !== null}
        category={pendingDelete?.category ?? null}
        onCancel={() => setPendingDelete(null)}
        onConfirm={performDelete}
      />
    </div>
  );
}

const DELETE_LABELS: Record<'dose' | 'feeling' | 'vital' | 'weight', string> = {
  dose: 'dose',
  feeling: 'feelings entry',
  vital: 'vitals entry',
  weight: 'weight entry',
};

interface ConfirmDialogProps {
  isOpen: boolean;
  category: 'dose' | 'feeling' | 'vital' | 'weight' | null;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

function ConfirmDialog({ isOpen, category, onCancel, onConfirm }: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleEscape);
    // Move focus onto the safe (cancel) action when the dialog opens.
    const t = window.setTimeout(() => confirmRef.current?.focus(), 20);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      window.clearTimeout(t);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const label = category ? DELETE_LABELS[category] : 'entry';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center modal-scrim p-4 backdrop-blur-sm sm:items-center">
      <div className="absolute inset-0" onClick={onCancel} aria-hidden="true" />
      <div
        className="card relative z-10 w-full max-w-sm animate-fade-rise"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-body"
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-tone-rose-soft text-tone-rose-ink shadow-inner-soft"
            aria-hidden="true"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </span>
          <div className="flex flex-col">
            <h3 id="confirm-title" className="section-title text-lg text-ink">
              Delete this {label}?
            </h3>
            <p id="confirm-body" className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              This permanently removes the logged data for this day. You can always log it again later.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            ref={confirmRef}
            onClick={onCancel}
            className="btn btn-ghost rounded-2xl px-4 py-2.5 text-sm active:scale-[0.97]"
            type="button"
          >
            Keep it
          </button>
          <button
            onClick={() => void onConfirm()}
            className="btn rounded-2xl bg-tone-rose-ink px-4 py-2.5 text-sm font-semibold text-cream-50 dark:text-ink shadow-soft transition hover:brightness-105 focus-visible:ring-4 focus-visible:ring-tone-rose-edge active:scale-[0.97] active:translate-y-px"
            type="button"
          >
            Delete entry
          </button>
        </div>
      </div>
    </div>
  );
}
