import type { Dose, FeelingLog, VitalLog, WeighIn } from '../../db/db';
import { formatWeight } from '../../lib/units';
import { formatDateKey } from '../../lib/dateUtils';
import { formatInjectionSite } from '../../lib/medications';
import happyIcon from '../../assets/happy.png';
import unhappyIcon from '../../assets/unhappy.png';
import weightIcon from '../../assets/weight.png';
import medicineIcon from '../../assets/medicine.png';
import vitalsIcon from '../../assets/vitals.png';
import sunriseEmptyIcon from '../../assets/sunrise-empty_state.png';

interface DayDetailProps {
  selectedDate: Date;
  doses: Dose[];
  feeling?: FeelingLog;
  vital?: VitalLog;
  weighIn?: WeighIn;
  weightUnit: 'kg' | 'lb';
  onTriggerLog: (category: 'dose' | 'feeling' | 'vital' | 'weight') => void;
  onDeleteLog: (category: 'dose' | 'feeling' | 'vital' | 'weight', id: number) => Promise<void>;
}

export default function DayDetail({
  selectedDate,
  doses,
  feeling,
  vital,
  weighIn,
  weightUnit,
  onTriggerLog,
  onDeleteLog,
}: DayDetailProps) {
  const isToday = formatDateKey(selectedDate) === formatDateKey(new Date());

  const hasAnyLogs = doses.length > 0 || feeling !== undefined || vital !== undefined || weighIn !== undefined;

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="card w-full animate-fade-rise">
      {/* Date Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="section-title text-ink">{formatDateDisplay(selectedDate)}</h3>
        {isToday && <span className="chip bg-tone-mint-soft text-tone-mint-ink font-medium">Today</span>}
      </div>

      {/* Logged Items List */}
      <div className="space-y-4">
        {/* Doses */}
        {doses.map((dose) => (
          <div key={dose.id} className="card-quiet flex items-center justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 shadow-inner-soft"
                aria-hidden="true"
              >
                <img src={medicineIcon} alt="" className="h-5.5 w-5.5 object-contain" />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-ink">
                  Dose: <span className="font-mono tabular-nums">{dose.dosageMg}</span> mg
                  {dose.injectionSite && dose.injectionSite !== 'None'
                    ? ` (${formatInjectionSite(dose.injectionSite)})`
                    : ''}
                </span>
                <span className="footnote mt-1">
                  {dose.name}
                  {dose.takenAt ? (
                    <>
                      {' '}&middot; Taken at{' '}
                      <span className="font-mono tabular-nums">
                        {new Date(dose.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  ) : null}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onTriggerLog('dose')}
                className="btn btn-ghost rounded-lg px-2.5 py-1 text-xs active:scale-95"
                type="button"
              >
                Edit
              </button>
              <button
                onClick={() => dose.id && onDeleteLog('dose', dose.id)}
                className="btn btn-ghost rounded-lg px-2.5 py-1 text-xs text-tone-rose-ink hover:bg-tone-rose-soft active:scale-95"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {/* Feeling */}
        {feeling && (
          <div className="card-quiet flex flex-col p-4">
            <div className="flex w-full items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent-50 shadow-inner-soft"
                  aria-hidden="true"
                >
                  <img
                    src={feeling.symptoms.length === 0 ? happyIcon : unhappyIcon}
                    alt=""
                    className="h-5.5 w-5.5 object-contain"
                  />
                </span>
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-ink">
                    Feelings:{' '}
                    {feeling.symptoms.length === 0 ? 'Feeling great!' : feeling.symptoms.join(', ')}
                  </span>
                  {feeling.severity && feeling.symptoms.length > 0 && (
                    <span className="footnote mt-0.5 capitalize">Severity: {feeling.severity}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onTriggerLog('feeling')}
                  className="btn btn-ghost rounded-lg px-2.5 py-1 text-xs active:scale-95"
                  type="button"
                >
                  Edit
                </button>
                <button
                  onClick={() => feeling.id && onDeleteLog('feeling', feeling.id)}
                  className="btn btn-ghost rounded-lg px-2.5 py-1 text-xs text-tone-rose-ink hover:bg-tone-rose-soft active:scale-95"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
            {feeling.note && (
              <div className="mt-3 rounded-xl border border-cream-300 bg-cream-50 p-3 text-sm italic text-ink-soft">
                &ldquo;{feeling.note}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Vitals */}
        {vital && (
          <div className="card-quiet flex items-center justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-tone-rose-soft shadow-inner-soft"
                aria-hidden="true"
              >
                <img src={vitalsIcon} alt="" className="h-5.5 w-5.5 object-contain" />
              </span>
              <div className="flex flex-col space-y-1">
                <span className="text-base font-semibold text-ink">Vitals logged</span>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-soft">
                  {vital.bloodSugar && (
                    <span>
                      Sugar: <strong className="font-mono tabular-nums text-ink">{vital.bloodSugar}</strong> mg/dL
                    </span>
                  )}
                  {vital.bloodPressureSystolic && vital.bloodPressureDiastolic && (
                    <span>
                      BP:{' '}
                      <strong className="font-mono tabular-nums text-ink">
                        {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                      </strong>{' '}
                      mmHg
                    </span>
                  )}
                  {vital.heartRate && (
                    <span>
                      HR: <strong className="font-mono tabular-nums text-ink">{vital.heartRate}</strong> bpm
                    </span>
                  )}
                  {vital.waistCircumferenceCm && (
                    <span>
                      Waist: <strong className="font-mono tabular-nums text-ink">{vital.waistCircumferenceCm}</strong> cm
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onTriggerLog('vital')}
                className="btn btn-ghost rounded-lg px-2.5 py-1 text-xs active:scale-95"
                type="button"
              >
                Edit
              </button>
              <button
                onClick={() => vital.id && onDeleteLog('vital', vital.id)}
                className="btn btn-ghost rounded-lg px-2.5 py-1 text-xs text-tone-rose-ink hover:bg-tone-rose-soft active:scale-95"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Weight */}
        {weighIn && (
          <div className="card-quiet flex items-center justify-between gap-3 p-4">
            <div className="flex items-start gap-3">
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-tone-sun-soft shadow-inner-soft"
                aria-hidden="true"
              >
                <img src={weightIcon} alt="" className="h-5.5 w-5.5 object-contain" />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-ink">
                  Weight: <span className="font-mono tabular-nums">{formatWeight(weighIn.weightKg, weightUnit)}</span>
                </span>
                <span className="footnote mt-1">
                  Logged{' '}
                  <span className="font-mono tabular-nums">
                    {new Date(weighIn.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onTriggerLog('weight')}
                className="btn btn-ghost rounded-lg px-2.5 py-1 text-xs active:scale-95"
                type="button"
              >
                Edit
              </button>
              <button
                onClick={() => weighIn.id && onDeleteLog('weight', weighIn.id)}
                className="btn btn-ghost rounded-lg px-2.5 py-1 text-xs text-tone-rose-ink hover:bg-tone-rose-soft active:scale-95"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasAnyLogs && (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-rise">
            <img
              src={sunriseEmptyIcon}
              alt=""
              className="h-28 w-28 object-contain mb-4"
            />
            <p className="text-sm text-ink-soft">Nothing logged for this day yet.</p>
            <p className="footnote">Use the quick add below to capture your progress.</p>
          </div>
        )}
      </div>

      {/* Quick-Add Triggers */}
      <div className="mt-8 border-t border-cream-300 pt-6">
        <h4 className="section-label mb-3 text-xs text-ink-muted">Quick add metrics</h4>
        <div className="flex flex-wrap gap-2">
          {doses.length === 0 && (
            <button
              onClick={() => onTriggerLog('dose')}
              className="btn btn-ghost py-2 px-4 rounded-full text-sm font-medium border border-cream-300 active:scale-[0.97]"
              type="button"
            >
              + Log Dose
            </button>
          )}
          {!feeling && (
            <button
              onClick={() => onTriggerLog('feeling')}
              className="btn btn-ghost py-2 px-4 rounded-full text-sm font-medium border border-cream-300 active:scale-[0.97]"
              type="button"
            >
              + Log Feelings
            </button>
          )}
          {!vital && (
            <button
              onClick={() => onTriggerLog('vital')}
              className="btn btn-ghost py-2 px-4 rounded-full text-sm font-medium border border-cream-300 active:scale-[0.97]"
              type="button"
            >
              + Log Vitals
            </button>
          )}
          {!weighIn && (
            <button
              onClick={() => onTriggerLog('weight')}
              className="btn btn-ghost py-2 px-4 rounded-full text-sm font-medium border border-cream-300 active:scale-[0.97]"
              type="button"
            >
              + Log Weight
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
