/**
 * Event status relative to current time.
 * Customize labels by editing EVENT_STATUS_LABELS below.
 */
export type EventStatus = 'upcoming' | 'in_progress' | 'ended';

/** Customize these labels (e.g. "Upcoming" / "Sắp diễn ra", "In progress" / "Đang diễn ra", "Ended" / "Kết thúc") */
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: 'Upcoming',
  in_progress: 'In progress',
  ended: 'Ended',
};

export function getEventStatus(start: Date, end: Date, now: Date = new Date()): EventStatus {
  const t = now.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();
  if (t < startTime) return 'upcoming';
  if (t <= endTime) return 'in_progress';
  return 'ended';
}

export function getEventStatusLabel(start: Date, end: Date, now: Date = new Date()): string {
  return EVENT_STATUS_LABELS[getEventStatus(start, end, now)];
}
