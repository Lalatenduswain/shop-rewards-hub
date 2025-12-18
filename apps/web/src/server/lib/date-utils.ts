/**
 * Date Utilities
 *
 * Helper functions for date range calculations, time series generation,
 * and analytics period handling.
 */

export type TimePeriod = '7d' | '30d' | '90d' | '1y' | 'mtd' | 'ytd' | 'custom';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface TimeSeriesPoint {
  label: string;
  date: Date;
  value: number;
}

/**
 * Get date range for a specified time period
 *
 * @param period - Time period identifier
 * @param customStart - Custom start date (for 'custom' period)
 * @param customEnd - Custom end date (for 'custom' period)
 * @returns Start and end dates for the period
 *
 * @example
 * const range = getDateRange('30d');
 * // Returns: { startDate: 30 days ago, endDate: now }
 */
export function getDateRange(
  period: TimePeriod,
  customStart?: Date,
  customEnd?: Date
): DateRange {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;

  switch (period) {
    case '7d':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;

    case '30d':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      break;

    case '90d':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 90);
      break;

    case '1y':
      startDate = new Date(now);
      startDate.setFullYear(now.getFullYear() - 1);
      break;

    case 'mtd': // Month to date
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;

    case 'ytd': // Year to date
      startDate = new Date(now.getFullYear(), 0, 1);
      break;

    case 'custom':
      if (!customStart || !customEnd) {
        throw new Error('Custom period requires customStart and customEnd dates');
      }
      startDate = customStart;
      endDate = customEnd;
      break;

    default:
      throw new Error(`Unknown time period: ${period}`);
  }

  return { startDate, endDate };
}

/**
 * Get the previous period for comparison
 * Used to calculate growth percentages
 *
 * @param currentRange - Current date range
 * @returns Previous period with same duration
 *
 * @example
 * const current = getDateRange('30d');
 * const previous = getPreviousPeriod(current);
 * // Returns: { startDate: 60 days ago, endDate: 30 days ago }
 */
export function getPreviousPeriod(currentRange: DateRange): DateRange {
  const duration =
    currentRange.endDate.getTime() - currentRange.startDate.getTime();

  return {
    startDate: new Date(currentRange.startDate.getTime() - duration),
    endDate: new Date(currentRange.endDate.getTime() - duration),
  };
}

/**
 * Calculate growth percentage between two values
 *
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Growth percentage (can be negative)
 *
 * @example
 * calculateGrowth(150, 100) // Returns: 50
 * calculateGrowth(75, 100)  // Returns: -25
 * calculateGrowth(100, 0)   // Returns: 100
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

/**
 * Generate time series intervals for charts
 * Creates evenly spaced date points between start and end
 *
 * @param startDate - Range start
 * @param endDate - Range end
 * @param points - Number of data points to generate
 * @returns Array of date intervals with labels
 *
 * @example
 * const intervals = generateTimeSeriesIntervals(
 *   new Date('2024-01-01'),
 *   new Date('2024-01-31'),
 *   7
 * );
 * // Returns 7 evenly spaced dates with labels like "Jan 1", "Jan 5", etc.
 */
export function generateTimeSeriesIntervals(
  startDate: Date,
  endDate: Date,
  points: number
): Array<{ date: Date; label: string }> {
  const intervals: Array<{ date: Date; label: string }> = [];
  const totalDuration = endDate.getTime() - startDate.getTime();
  const intervalDuration = totalDuration / (points - 1);

  for (let i = 0; i < points; i++) {
    const date = new Date(startDate.getTime() + intervalDuration * i);
    const label = formatDateLabel(date, startDate, endDate);
    intervals.push({ date, label });
  }

  return intervals;
}

/**
 * Format date label based on time range duration
 * Uses appropriate granularity (hours, days, months)
 *
 * @param date - Date to format
 * @param rangeStart - Start of the overall range
 * @param rangeEnd - End of the overall range
 * @returns Formatted label
 *
 * @example
 * formatDateLabel(new Date('2024-01-15'), rangeStart, rangeEnd)
 * // Returns: "Jan 15" for multi-day range
 * // Returns: "15" for same-month range
 * // Returns: "3:00 PM" for same-day range
 */
export function formatDateLabel(
  date: Date,
  rangeStart: Date,
  rangeEnd: Date
): string {
  const rangeDuration = rangeEnd.getTime() - rangeStart.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const oneMonthMs = 30 * oneDayMs;

  // Same day - show hours
  if (rangeDuration < oneDayMs) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  // Less than a month - show day
  if (rangeDuration < oneMonthMs) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  // More than a month - show month and year
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get start of day (midnight) for a date
 *
 * @param date - Input date
 * @returns Date set to 00:00:00.000
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day (23:59:59.999) for a date
 *
 * @param date - Input date
 * @returns Date set to 23:59:59.999
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check if a date is within a range (inclusive)
 *
 * @param date - Date to check
 * @param range - Date range
 * @returns Whether date is within range
 */
export function isWithinRange(date: Date, range: DateRange): boolean {
  const timestamp = date.getTime();
  return (
    timestamp >= range.startDate.getTime() &&
    timestamp <= range.endDate.getTime()
  );
}
