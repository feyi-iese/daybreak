import type { Dose, FeelingLog, VitalLog, WeighIn } from '../../db/db';
import { formatWeight } from '../../lib/units';
import { formatDateKey } from '../../lib/dateUtils';

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
          <div key={dose.id} className="card-quiet flex items-center justify-between p-4">
            <div className="flex flex-col">
              <span className="text-base font-semibold text-ink">
                💊 Dose: {dose.dosageMg} mg
                {dose.injectionSite && dose.injectionSite !== 'None' ? ` (${dose.injectionSite})` : ''}
              </span>
              <span className="footnote mt-1">
                {dose.name} &middot; Logged {new Date(dose.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onTriggerLog('dose')}
                className="btn btn-ghost text-xs py-1 px-2.5 rounded-lg"
                type="button"
              >
                Edit
              </button>
              <button
                onClick={() => dose.id && onDeleteLog('dose', dose.id)}
                className="btn btn-ghost text-xs py-1 px-2.5 rounded-lg text-tone-rose-ink hover:bg-tone-rose-soft"
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
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="text-base font-semibold text-ink">
                  😊 Feelings:{' '}
                  {feeling.symptoms.length === 0
                    ? 'Feeling great!'
                    : feeling.symptoms.join(', ')}
                </span>
                {feeling.severity && feeling.symptoms.length > 0 && (
                  <span className="footnote mt-0.5">Severity: {feeling.severity}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onTriggerLog('feeling')}
                  className="btn btn-ghost text-xs py-1 px-2.5 rounded-lg"
                  type="button"
                >
                  Edit
                </button>
                <button
                  onClick={() => feeling.id && onDeleteLog('feeling', feeling.id)}
                  className="btn btn-ghost text-xs py-1 px-2.5 rounded-lg text-tone-rose-ink hover:bg-tone-rose-soft"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
            {feeling.note && (
              <div className="mt-3 p-3 bg-cream-50 rounded-xl border border-cream-300 text-sm text-ink-soft italic">
                &ldquo;{feeling.note}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Vitals */}
        {vital && (
          <div className="card-quiet flex items-center justify-between p-4">
            <div className="flex flex-col space-y-1">
              <span className="text-base font-semibold text-ink">❤️ Vitals Logged</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink-soft mt-1">
                {vital.bloodSugar && (
                  <span>
                    Sugar: <strong className="text-ink">{vital.bloodSugar}</strong> mg/dL
                  </span>
                )}
                {vital.bloodPressureSystolic && vital.bloodPressureDiastolic && (
                  <span>
                    BP:{' '}
                    <strong className="text-ink">
                      {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                    </strong>{' '}
                    mmHg
                  </span>
                )}
                {vital.heartRate && (
                  <span>
                    HR: <strong className="text-ink">{vital.heartRate}</strong> bpm
                  </span>
                )}
                {vital.waistCircumferenceCm && (
                  <span>
                    Waist: <strong className="text-ink">{vital.waistCircumferenceCm}</strong> cm
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onTriggerLog('vital')}
                className="btn btn-ghost text-xs py-1 px-2.5 rounded-lg"
                type="button"
              >
                Edit
              </button>
              <button
                onClick={() => vital.id && onDeleteLog('vital', vital.id)}
                className="btn btn-ghost text-xs py-1 px-2.5 rounded-lg text-tone-rose-ink hover:bg-tone-rose-soft"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Weight */}
        {weighIn && (
          <div className="card-quiet flex items-center justify-between p-4">
            <div className="flex flex-col">
              <span className="text-base font-semibold text-ink">
                ⚖️ Weight: {formatWeight(weighIn.weightKg, weightUnit)}
              </span>
              <span className="footnote mt-1">
                Logged {new Date(weighIn.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onTriggerLog('weight')}
                className="btn btn-ghost text-xs py-1 px-2.5 rounded-lg"
                type="button"
              >
                Edit
              </button>
              <button
                onClick={() => weighIn.id && onDeleteLog('weight', weighIn.id)}
                className="btn btn-ghost text-xs py-1 px-2.5 rounded-lg text-tone-rose-ink hover:bg-tone-rose-soft"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasAnyLogs && (
          <p className="hero-sub text-center py-4 italic text-ink-muted">
            Nothing logged for this day yet. Ready to capture your progress?
          </p>
        )}
      </div>

      {/* Quick-Add Triggers */}
      <div className="mt-8 border-t border-cream-300 pt-6">
        <h4 className="section-label mb-3 text-xs text-ink-muted">Quick add metrics</h4>
        <div className="flex flex-wrap gap-2">
          {doses.length === 0 && (
            <button
              onClick={() => onTriggerLog('dose')}
              className="btn btn-ghost py-2 px-4 rounded-full text-sm font-medium border border-cream-300"
              type="button"
            >
              + Log Dose
            </button>
          )}
          {!feeling && (
            <button
              onClick={() => onTriggerLog('feeling')}
              className="btn btn-ghost py-2 px-4 rounded-full text-sm font-medium border border-cream-300"
              type="button"
            >
              + Log Feelings
            </button>
          )}
          {!vital && (
            <button
              onClick={() => onTriggerLog('vital')}
              className="btn btn-ghost py-2 px-4 rounded-full text-sm font-medium border border-cream-300"
              type="button"
            >
              + Log Vitals
            </button>
          )}
          {!weighIn && (
            <button
              onClick={() => onTriggerLog('weight')}
              className="btn btn-ghost py-2 px-4 rounded-full text-sm font-medium border border-cream-300"
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
