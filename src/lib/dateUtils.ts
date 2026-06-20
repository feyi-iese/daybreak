export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  key: string; // YYYY-MM-DD
}

/** Get the start of the day (00:00:00.000) for a given Date */
export function getStartOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/** Get the end of the day (23:59:59.999) for a given Date */
export function getEndOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

/** Get start and end epoch ms of the day for a timestamp in local time */
export function getDayRange(timestamp: number): { start: number; end: number } {
  const date = new Date(timestamp);
  const start = getStartOfDay(date).getTime();
  const end = getEndOfDay(date).getTime();
  return { start, end };
}

/** Check if two timestamps represent the same calendar day in local time */
export function isSameDay(t1: number, t2: number): boolean {
  const d1 = new Date(t1);
  const d2 = new Date(t2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/** Format date as YYYY-MM-DD */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns a 35 or 42 day grid representing the calendar month.
 * @param year - full year (e.g. 2026)
 * @param month - 0-indexed month (0 = Jan, 11 = Dec)
 */
export function getCalendarMonthGrid(year: number, month: number): CalendarDay[] {
  const grid: CalendarDay[] = [];

  // First day of target month
  const firstDay = new Date(year, month, 1);
  // Day of the week firstDay falls on (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();

  // Days from previous month to display
  const prevMonthDate = new Date(year, month, 0); // Last day of prev month
  const totalPrevDays = firstDayOfWeek; // if Sunday (0) -> 0 days, if Tuesday (2) -> 2 days

  for (let i = totalPrevDays - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthDate.getDate() - i);
    grid.push({
      date: d,
      isCurrentMonth: false,
      key: formatDateKey(d),
    });
  }

  // Days of current month
  const totalCurrentDays = new Date(year, month + 1, 0).getDate(); // Last day of current month
  for (let i = 1; i <= totalCurrentDays; i++) {
    const d = new Date(year, month, i);
    grid.push({
      date: d,
      isCurrentMonth: true,
      key: formatDateKey(d),
    });
  }

  // Days of next month to pad the grid to 35 or 42 days (multiples of 7)
  const currentTotal = grid.length;
  const targetTotal = currentTotal <= 35 ? 35 : 42;
  const remainingDays = targetTotal - currentTotal;

  for (let i = 1; i <= remainingDays; i++) {
    const d = new Date(year, month + 1, i);
    grid.push({
      date: d,
      isCurrentMonth: false,
      key: formatDateKey(d),
    });
  }

  return grid;
}
