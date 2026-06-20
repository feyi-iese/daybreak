import { useState, useEffect, useCallback } from 'react';
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

  // Handle Delete
  const handleDeleteLog = async (category: 'dose' | 'feeling' | 'vital' | 'weight', id: number) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this entry?');
    if (!confirmDelete) return;

    if (category === 'dose') await deleteDose(id);
    if (category === 'feeling') await deleteFeeling(id);
    if (category === 'vital') await deleteVital(id);
    if (category === 'weight') await deleteWeighIn(id);

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
    </div>
  );
}
