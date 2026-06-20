import {
  getStartOfDay,
  getEndOfDay,
  getDayRange,
  isSameDay,
  formatDateKey,
  getCalendarMonthGrid,
} from '../dateUtils';

describe('dateUtils', () => {
  it('correctly returns start and end of day', () => {
    const d = new Date(2026, 5, 18, 14, 30, 15); // June 18, 2026 14:30:15
    const start = getStartOfDay(d);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
    expect(start.getMilliseconds()).toBe(0);

    const end = getEndOfDay(d);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getMilliseconds()).toBe(999);
  });

  it('correctly returns day range for a timestamp', () => {
    const d = new Date(2026, 5, 18, 14, 30, 15);
    const range = getDayRange(d.getTime());
    expect(range.start).toBe(getStartOfDay(d).getTime());
    expect(range.end).toBe(getEndOfDay(d).getTime());
  });

  it('correctly matches same day', () => {
    const t1 = new Date(2026, 5, 18, 8, 0, 0).getTime();
    const t2 = new Date(2026, 5, 18, 22, 30, 0).getTime();
    const t3 = new Date(2026, 5, 19, 1, 0, 0).getTime();

    expect(isSameDay(t1, t2)).toBe(true);
    expect(isSameDay(t1, t3)).toBe(false);
  });

  it('formats dates to YYYY-MM-DD keys', () => {
    const d = new Date(2026, 0, 5); // Jan 5, 2026
    expect(formatDateKey(d)).toBe('2026-01-05');
  });

  it('generates a month calendar grid', () => {
    // June 2026.
    // June 1st, 2026 is a Monday.
    // Sunday (June 0) is May 31.
    // So grid should start with May 31 (isCurrentMonth: false).
    const grid = getCalendarMonthGrid(2026, 5);
    expect(grid).toHaveLength(35); // 5 weeks * 7 = 35
    expect(grid[0].key).toBe('2026-05-31');
    expect(grid[0].isCurrentMonth).toBe(false);

    expect(grid[1].key).toBe('2026-06-01');
    expect(grid[1].isCurrentMonth).toBe(true);

    // June has 30 days.
    // June 30th is a Tuesday.
    // So next month days (July 1st, 2nd, etc.) should pad to 35.
    const lastDayInGrid = grid[34];
    expect(lastDayInGrid.key).toBe('2026-07-04');
    expect(lastDayInGrid.isCurrentMonth).toBe(false);
  });
});
