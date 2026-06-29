import { useState, useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
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

type LogCategory = 'dose' | 'feeling' | 'vital' | 'weight';

interface DayDetailProps {
  selectedDate: Date;
  doses: Dose[];
  feeling?: FeelingLog;
  vital?: VitalLog;
  weighIn?: WeighIn;
  weightUnit: 'kg' | 'lb';
  onTriggerLog: (category: LogCategory) => void;
  onDeleteLog: (category: LogCategory, id: number) => Promise<void>;
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
          <SwipeableLogCard
            key={dose.id}
            label="dose log"
            category="dose"
            id={dose.id}
            onEdit={() => onTriggerLog('dose')}
            onDelete={() => (dose.id ? onDeleteLog('dose', dose.id) : undefined)}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 shadow-inner-soft"
                aria-hidden="true"
              >
                <img src={medicineIcon} alt="" className="h-5.5 w-5.5 object-contain" />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-ink">
                  <span className="font-mono tabular-nums">{dose.dosageMg} mg</span>
                  <span className="text-sm tracking-tighter">{dose.injectionSite && dose.injectionSite !== 'None'
                    ? ` (${formatInjectionSite(dose.injectionSite)})`
                    : ''}</span>                 
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
          </SwipeableLogCard>
        ))}

        {/* Feeling */}
        {feeling && (
          <SwipeableLogCard
            label="feelings log"
            category="feeling"
            id={feeling.id}
            onEdit={() => onTriggerLog('feeling')}
            onDelete={() => (feeling.id ? onDeleteLog('feeling', feeling.id) : undefined)}
          >
            <div className="flex flex-col">
              <div className="flex w-full items-start gap-3">
                <span
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-accent-50 shadow-inner-soft"
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
                    {' '}
                    {feeling.symptoms.length === 0 ? 'Feeling great!' : feeling.symptoms.join(', ')}
                  </span>
                  {feeling.severity && feeling.symptoms.length > 0 && (
                    <span className="footnote mt-0.5 capitalize">{feeling.severity}</span>
                  )}
                </div>
              </div>
              {feeling.note && (
                <div className="mt-3 rounded-xl border border-cream-300 bg-cream-50 dark:bg-cream-100/85 dark:border-cream-300/60 dark:text-ink-soft p-3 text-sm italic text-ink-soft">
                  &ldquo;{feeling.note}&rdquo;
                </div>
              )}
            </div>
          </SwipeableLogCard>
        )}

        {/* Vitals */}
        {vital && (
          <SwipeableLogCard
            label="vitals log"
            category="vital"
            id={vital.id}
            onEdit={() => onTriggerLog('vital')}
            onDelete={() => (vital.id ? onDeleteLog('vital', vital.id) : undefined)}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-tone-rose-soft shadow-inner-soft"
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
          </SwipeableLogCard>
        )}

        {/* Weight */}
        {weighIn && (
          <SwipeableLogCard
            label="weight log"
            category="weight"
            id={weighIn.id}
            onEdit={() => onTriggerLog('weight')}
            onDelete={() => (weighIn.id ? onDeleteLog('weight', weighIn.id) : undefined)}
          >
            <div className="flex items-start gap-3">
              <span
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-tone-sun-soft shadow-inner-soft"
                aria-hidden="true"
              >
                <img src={weightIcon} alt="" className="h-5.5 w-5.5 object-contain" />
              </span>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-ink">
                  <span className="font-mono tabular-nums">{formatWeight(weighIn.weightKg, weightUnit)}</span>
                </span>
                <span className="footnote mt-1">
                  Logged{' '}
                  <span className="font-mono tabular-nums">
                    {new Date(weighIn.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </span>
              </div>
            </div>
          </SwipeableLogCard>
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

interface SwipeableLogCardProps {
  label: string;
  category: LogCategory;
  id?: number;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
  children: ReactNode;
}

const DELETE_REVEAL_PX = 88;
const SWIPE_REVEAL_THRESHOLD_PX = 44;
const TAP_CANCEL_THRESHOLD_PX = 8;

function SwipeableLogCard({
  label,
  category,
  id,
  onEdit,
  onDelete,
  children,
}: SwipeableLogCardProps) {
  const hintId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const deleteButtonRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseOffset: number; dragged: boolean } | null>(null);
  const suppressNextClickRef = useRef(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState(0);

  const closeReveal = () => {
    setIsRevealed(false);
    setOffset(0);
  };

  const openReveal = ({ focusDelete = false } = {}) => {
    if (!id) return;
    setIsRevealed(true);
    setOffset(-DELETE_REVEAL_PX);
    if (focusDelete) {
      setTimeout(() => {
        deleteButtonRef.current?.focus();
      }, 0);
    }
  };

  useEffect(() => {
    if (!isRevealed) return;

    const handleOutsidePointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        closeReveal();
      }
    };

    const handleScroll = () => {
      closeReveal();
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isRevealed]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!id) return;
    
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }

    const clientX = e.clientX ?? (e.nativeEvent as MouseEvent).clientX ?? 0;
    const clientY = e.clientY ?? (e.nativeEvent as MouseEvent).clientY ?? 0;

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      baseOffset: offset,
      dragged: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    
    const clientX = e.clientX ?? (e.nativeEvent as MouseEvent).clientX ?? 0;
    const clientY = e.clientY ?? (e.nativeEvent as MouseEvent).clientY ?? 0;

    const deltaX = clientX - dragRef.current.startX;
    const deltaY = clientY - dragRef.current.startY;

    if (!dragRef.current.dragged) {
      if (Math.abs(deltaX) > TAP_CANCEL_THRESHOLD_PX) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          dragRef.current.dragged = true;
        } else {
          dragRef.current = null;
          setIsDragging(false);
          return;
        }
      } else {
        return;
      }
    }

    let newOffset = dragRef.current.baseOffset + deltaX;
    newOffset = Math.max(-DELETE_REVEAL_PX, Math.min(0, newOffset));
    setOffset(newOffset);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }
    
    if (!dragRef.current) return;

    if (dragRef.current.dragged) {
      suppressNextClickRef.current = true;
      if (offset <= -SWIPE_REVEAL_THRESHOLD_PX) {
        openReveal();
      } else {
        closeReveal();
      }
    }
    
    dragRef.current = null;
    setIsDragging(false);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {
        // ignore
      }
    }
    dragRef.current = null;
    setIsDragging(false);
    closeReveal();
  };

  const handleClick = () => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }
    if (isRevealed) {
      closeReveal();
      return;
    }
    onEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && isRevealed) {
      e.preventDefault();
      closeReveal();
      cardRef.current?.focus();
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isRevealed) {
        closeReveal();
      } else {
        onEdit();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      openReveal({ focusDelete: true });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      closeReveal();
    }
  };

  return (
    <div
      ref={rootRef}
      onKeyDown={handleKeyDown}
      className="relative overflow-hidden rounded-2xl"
      data-log-category={category}
    >
      {id && (
        <div
          className={`absolute inset-y-0 right-0 flex w-[5.5rem] items-center justify-center bg-tone-rose-ink text-cream-50 dark:text-ink ${
            offset === 0 ? 'invisible' : ''
          }`}
        >
          <button
            ref={deleteButtonRef}
            onClick={onDelete}
            tabIndex={isRevealed ? 0 : -1}
            aria-label={`Delete ${label}`}
            className="h-full w-full font-semibold transition active:opacity-80 focus:outline-none focus-visible:ring-inset focus-visible:ring-4 focus-visible:ring-primary-300/50"
            type="button"
          >
            Delete
          </button>
        </div>
      )}

      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleCardKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        aria-describedby={id ? hintId : undefined}
        className={`card-quiet relative w-full cursor-pointer p-4 text-left hover:border-primary-200/70 hover:bg-cream-100/90 dark:hover:bg-cream-200/70 focus:outline-none focus-visible:ring-inset focus-visible:ring-4 focus-visible:ring-primary-300/50 touch-pan-y ${
          !isDragging ? 'transition-[transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]' : ''
        }`}
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
        
        {id && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-tone-rose-edge/80" />
            <span className="h-1.5 w-1.5 rounded-full bg-tone-rose-edge/80" />
          </span>
        )}
      </div>

      {id && (
        <span id={hintId} className="sr-only">
          Tap or press Enter to edit. Swipe left or press ArrowLeft to reveal delete.
        </span>
      )}
    </div>
  );
}

