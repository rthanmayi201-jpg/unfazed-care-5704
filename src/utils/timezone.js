import { format as formatFns, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'India Standard Time (IST, GMT+5:30)' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST, GMT+4:00)' },
  { value: 'Asia/Singapore', label: 'Singapore Time (SGT, GMT+8:00)' },
  { value: 'Europe/London', label: 'London Time (GMT / BST)' },
  { value: 'America/New_York', label: 'Eastern Time (ET, GMT-5:00/4:00)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT, GMT-8:00/7:00)' },
  { value: 'Australia/Sydney', label: 'Sydney Time (AEST/AEDT, GMT+10:00/11:00)' }
];

export function getLocalTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}

export function formatInTz(date, formatStr, timeZone = 'Asia/Kolkata') {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  try {
    return formatInTimeZone(d, timeZone, formatStr);
  } catch {
    return formatFns(d, formatStr);
  }
}

export function formatDualTime(isoString, therapistTz = 'Asia/Kolkata', clientTz = getLocalTimezone()) {
  if (!isoString) return '';
  const dateObj = typeof isoString === 'string' ? parseISO(isoString) : isoString;
  const clientTime = formatInTz(dateObj, 'EEE, dd MMM yyyy, h:mm a', clientTz);
  if (therapistTz === clientTz) {
    return clientTime;
  }
  const therapistTime = formatInTz(dateObj, 'h:mm a (z)', therapistTz);
  return `${clientTime} (${therapistTime} Therapist's Time)`;
}
