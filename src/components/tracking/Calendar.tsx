import { useRef, useEffect } from 'react';
import { getCalendarMonthGrid, formatDateKey } from '../../lib/dateUtils';

interface CalendarProps {
  selectedDate: Date;
  onChangeSelectedDate: (date: Date) => void;
  currentMonth: Date; // Keep track of the active month being viewed
  onChangeCurrentMonth: (date: Date) => void;
  loggedDates: Record<string, { doses?: boolean; feelings?: boolean; vitals?: boolean; weighIn?: boolean }>;
}

export default function Calendar({
  selectedDate,
  onChangeSelectedDate,
  currentMonth,
  onChangeCurrentMonth,
  loggedDates,
}: CalendarProps) {
  const activeYear = currentMonth.getFullYear();
  const activeMonth = currentMonth.getMonth(); // 0-indexed

  const grid = getCalendarMonthGrid(activeYear, activeMonth);
  const selectedKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(new Date());

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Ref array for day buttons to handle keyboard focus
  const dayRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    // Re-size or clear the refs array as grid updates
    dayRefs.current = dayRefs.current.slice(0, grid.length);
  }, [grid]);

  // Navigate months
  const handlePrevMonth = () => {
    onChangeCurrentMonth(new Date(activeYear, activeMonth - 1, 1));
  };

  const handleNextMonth = () => {
    onChangeCurrentMonth(new Date(activeYear, activeMonth + 1, 1));
  };

  // Keyboard navigation for cells
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    let handled = false;

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = index + 1;
        handled = true;
        break;
      case 'ArrowLeft':
        nextIndex = index - 1;
        handled = true;
        break;
      case 'ArrowDown':
        nextIndex = index + 7;
        handled = true;
        break;
      case 'ArrowUp':
        nextIndex = index - 7;
        handled = true;
        break;
      default:
        break;
    }

    if (handled) {
      e.preventDefault();
      // Boundary checks
      if (nextIndex >= 0 && nextIndex < grid.length) {
        const nextDay = grid[nextIndex];
        onChangeSelectedDate(nextDay.date);

        // If next day is outside the current month, auto-scroll month
        if (nextDay.date.getMonth() !== activeMonth || nextDay.date.getFullYear() !== activeYear) {
          onChangeCurrentMonth(new Date(nextDay.date.getFullYear(), nextDay.date.getMonth(), 1));
        }

        // Focus the next element after render
        setTimeout(() => {
          dayRefs.current[nextIndex]?.focus();
        }, 10);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Calendar Header / Month Switcher */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="section-title text-ink">
          {monthNames[activeMonth]} {activeYear}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={handlePrevMonth}
            className="btn btn-ghost p-2 rounded-full"
            aria-label="Previous month"
            type="button"
          >
            <svg
              className="h-5 w-5 text-ink-soft"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNextMonth}
            className="btn btn-ghost p-2 rounded-full"
            aria-label="Next month"
            type="button"
          >
            <svg
              className="h-5 w-5 text-ink-soft"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Week Headers */}
      <div className="mb-2 grid grid-cols-7 text-center">
        {daysOfWeek.map((day) => (
          <span key={day} className="section-label text-xs font-semibold text-ink-muted">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-2 text-center" role="grid">
        {grid.map((day, idx) => {
          const isSelected = day.key === selectedKey;
          const isToday = day.key === todayKey;
          const isCurrentMonth = day.date.getMonth() === activeMonth;
          const logs = loggedDates[day.key] || {};

          // Accessibility label
          const ariaLabelParts = [day.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })];
          const loggedItems = [];
          if (logs.doses) loggedItems.push('Dose');
          if (logs.feelings) loggedItems.push('Feelings');
          if (logs.vitals) loggedItems.push('Vitals');
          if (logs.weighIn) loggedItems.push('Weight');
          if (loggedItems.length > 0) {
            ariaLabelParts.push(`logged: ${loggedItems.join(', ')}`);
          }

          return (
            <div key={day.key} role="gridcell" className="relative">
              <button
                ref={(el) => (dayRefs.current[idx] = el)}
                onClick={() => {
                  onChangeSelectedDate(day.date);
                  if (day.date.getMonth() !== activeMonth || day.date.getFullYear() !== activeYear) {
                    onChangeCurrentMonth(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                tabIndex={isSelected ? 0 : -1}
                className={`relative mx-auto flex h-11 w-11 flex-col items-center justify-center rounded-2xl transition duration-200 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300/50 active:scale-90
                  ${isToday && !isSelected ? 'ring-1 ring-inset ring-primary-400 font-semibold' : ''}
                  ${
                    isSelected
                      ? 'bg-primary-sheen text-cream-50 font-semibold shadow-glow-primary'
                      : `${!isCurrentMonth ? 'text-ink-muted/60' : 'text-ink'} hover:-translate-y-0.5 hover:bg-primary-50`
                  }
                `}
                aria-label={ariaLabelParts.join(', ')}
                type="button"
              >
                <span className="font-mono text-sm tabular-nums leading-none">{day.date.getDate()}</span>

                {/* Indicator Dots */}
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5 h-1">
                  {logs.doses && (
                    <span
                      className={`w-1 h-1 rounded-full ${isSelected ? 'bg-cream-50' : 'bg-primary-500'}`}
                      aria-hidden="true"
                    />
                  )}
                  {logs.feelings && (
                    <span
                      className={`w-1 h-1 rounded-full ${isSelected ? 'bg-cream-50' : 'bg-accent-400'}`}
                      aria-hidden="true"
                    />
                  )}
                  {logs.vitals && (
                    <span
                      className={`w-1 h-1 rounded-full ${isSelected ? 'bg-cream-50' : 'bg-sun-400'}`}
                      aria-hidden="true"
                    />
                  )}
                  {logs.weighIn && (
                    <span
                      className={`w-1 h-1 rounded-full ${isSelected ? 'bg-cream-50' : 'bg-ink-soft'}`}
                      aria-hidden="true"
                    />
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
