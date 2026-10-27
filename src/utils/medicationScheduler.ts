import type { Medication, MedicationStatus } from '../types';

/**
 * Parses "HH:MM" into minutes from midnight
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Formats minutes from midnight into 12-hour format e.g. "08:30 AM"
 */
export function minutesTo12Hour(minutes: number): string {
  const normMin = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normMin / 60);
  const mins = normMin % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`;
}

/**
 * Given a medication and the current time (in "HH:MM"), calculate its dynamic status
 */
export function calculateMedicationStatus(
  med: Medication,
  currentTimeStr: string
): MedicationStatus {
  if (med.status === 'completed' || med.status === 'skipped') {
    return med.status;
  }

  const currentMinutes = timeStringToMinutes(currentTimeStr);
  const scheduledMinutes = timeStringToMinutes(med.scheduledTime);
  const diff = currentMinutes - scheduledMinutes;

  // If more than 15 minutes past scheduled time
  if (diff > 15) {
    return 'overdue';
  }
  // If between 30 mins before and 15 mins after scheduled time
  if (diff >= -30 && diff <= 15) {
    return 'due';
  }
  // Otherwise upcoming
  return 'upcoming';
}

/**
 * Returns human-readable relative label for medication timing
 */
export function getMedicationTimeLabel(
  med: Medication,
  currentTimeStr: string
): { label: string; urgency: 'critical' | 'warning' | 'info' | 'success' } {
  if (med.status === 'completed') {
    return {
      label: med.administeredAt ? `Given at ${med.administeredAt}` : 'Given',
      urgency: 'success',
    };
  }

  const currentMinutes = timeStringToMinutes(currentTimeStr);
  const scheduledMinutes = timeStringToMinutes(med.scheduledTime);
  const diff = currentMinutes - scheduledMinutes;

  if (diff > 0) {
    // Past scheduled time
    if (diff > 15) {
      return {
        label: `Overdue by ${diff} min (${minutesTo12Hour(scheduledMinutes)})`,
        urgency: 'critical',
      };
    }
    return {
      label: `Due now (${diff} min ago)`,
      urgency: 'warning',
    };
  } else {
    const minsUntil = Math.abs(diff);
    if (minsUntil <= 30) {
      return {
        label: `Due in ${minsUntil} min (${minutesTo12Hour(scheduledMinutes)})`,
        urgency: 'warning',
      };
    }
    return {
      label: `Scheduled for ${minutesTo12Hour(scheduledMinutes)}`,
      urgency: 'info',
    };
  }
}
