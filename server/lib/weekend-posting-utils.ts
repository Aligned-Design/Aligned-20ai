/**
 * Weekend Posting Utilities
 *
 * Helper functions for weekend posting scheduling and validation
 * Respects brand timezone settings for accurate weekend detection
 */

/**
 * Check if a given date is a weekend (Saturday = 6, Sunday = 0)
 * Respects timezone for accurate weekend detection
 *
 * @param date - The date to check
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns true if the date is Saturday or Sunday in the given timezone
 */
export function isWeekend(date: Date, timezone: string = 'UTC'): boolean {
  try {
    // Get day of week in the specified timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long'
    });

    const dayName = formatter.format(date);
    return dayName === 'Saturday' || dayName === 'Sunday';
  } catch (error) {
    // Fallback to UTC if timezone is invalid
    console.warn(`Invalid timezone ${timezone}, falling back to UTC:`, error);
    const dayOfWeek = date.getUTCDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = Sunday, 6 = Saturday
  }
}

/**
 * Check if posting should be allowed for a given date
 *
 * @param date - The date to check
 * @param weekendPostingEnabled - Whether weekend posting is allowed
 * @param timezone - IANA timezone string
 * @returns true if posting is allowed on this date
 */
export function canPostOnDate(
  date: Date,
  weekendPostingEnabled: boolean,
  timezone: string = 'UTC'
): boolean {
  // If weekend posting is enabled, all days are allowed
  if (weekendPostingEnabled) {
    return true;
  }

  // If weekend posting is disabled, check if date is a weekend
  return !isWeekend(date, timezone);
}

/**
 * Get the next available posting date based on weekend posting settings
 *
 * @param currentDate - Starting date
 * @param weekendPostingEnabled - Whether weekend posting is allowed
 * @param timezone - IANA timezone string
 * @returns The next date when posting is allowed
 */
export function getNextPostingDate(
  currentDate: Date,
  weekendPostingEnabled: boolean,
  timezone: string = 'UTC'
): Date {
  if (weekendPostingEnabled) {
    // All days are available
    return currentDate;
  }

  // Find next weekday
  const nextDate = new Date(currentDate);
  let attempts = 0;
  const maxAttempts = 7; // Max 7 days to find a weekday

  while (!canPostOnDate(nextDate, weekendPostingEnabled, timezone) && attempts < maxAttempts) {
    nextDate.setDate(nextDate.getDate() + 1);
    attempts++;
  }

  return nextDate;
}

/**
 * Calculate delay until next available posting time
 * Used to reschedule posts that would be published on a disabled weekend
 *
 * @param scheduledTime - Original scheduled time
 * @param weekendPostingEnabled - Whether weekend posting is allowed
 * @param timezone - IANA timezone string
 * @returns Date when post should actually be published
 */
export function calculatePostingDelay(
  scheduledTime: Date,
  weekendPostingEnabled: boolean,
  timezone: string = 'UTC'
): Date {
  if (canPostOnDate(scheduledTime, weekendPostingEnabled, timezone)) {
    // No delay needed
    return scheduledTime;
  }

  // Find next available date
  return getNextPostingDate(scheduledTime, weekendPostingEnabled, timezone);
}

/**
 * Get posting statistics for a date range
 * Shows how many days are available for posting with current settings
 *
 * @param startDate - Start of range
 * @param endDate - End of range
 * @param weekendPostingEnabled - Whether weekend posting is allowed
 * @param timezone - IANA timezone string
 * @returns Object with posting statistics
 */
export function getPostingStats(
  startDate: Date,
  endDate: Date,
  weekendPostingEnabled: boolean,
  timezone: string = 'UTC'
): {
  totalDays: number;
  availableDays: number;
  weekendDays: number;
  weekdayDays: number;
} {
  let totalDays = 0;
  let availableDays = 0;
  let weekendDays = 0;
  let weekdayDays = 0;

  const current = new Date(startDate);
  while (current <= endDate) {
    totalDays++;

    if (isWeekend(current, timezone)) {
      weekendDays++;
      if (weekendPostingEnabled) {
        availableDays++;
      }
    } else {
      weekdayDays++;
      availableDays++;
    }

    current.setDate(current.getDate() + 1);
  }

  return {
    totalDays,
    availableDays,
    weekendDays,
    weekdayDays
  };
}

/**
 * Format weekend posting status for logging/display
 *
 * @param enabled - Whether weekend posting is enabled
 * @param timezone - IANA timezone string
 * @returns Human-readable status string
 */
export function getWeekendPostingStatus(enabled: boolean, timezone: string = 'UTC'): string {
  if (enabled) {
    return `Weekend posting enabled (Timezone: ${timezone})`;
  }
  return `Weekend posting disabled - only weekday posts allowed (Timezone: ${timezone})`;
}

/**
 * Parse brand posting config to check weekend posting setting
 * Handles missing/undefined config gracefully
 *
 * @param postingConfig - Brand's posting configuration (JSONB object)
 * @returns Whether weekend posting is enabled (default: true)
 */
export function getWeekendPostingFromConfig(postingConfig: unknown): boolean {
  // Default to true if not specified
  if (!postingConfig) {
    return true;
  }

  if (typeof postingConfig === 'string') {
    try {
      const parsed = JSON.parse(postingConfig);
      return parsed.weekendPostingEnabled !== false;
    } catch {
      return true;
    }
  }

  return postingConfig.weekendPostingEnabled !== false;
}
