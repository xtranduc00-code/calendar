import type { CalendarEvent, RecurrenceType } from '@/components/AddEventModal';

export interface ExpandedEvent {
  event: CalendarEvent;
  start: Date;
  end: Date;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function addWeeks(d: Date, n: number): Date {
  return addDays(d, n * 7);
}

function addMonths(d: Date, n: number): Date {
  const out = new Date(d);
  out.setMonth(out.getMonth() + n);
  return out;
}

function dayStart(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function expandRecurringEvents(
  events: CalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date
): ExpandedEvent[] {
  const result: ExpandedEvent[] = [];
  const rangeStartT = dayStart(rangeStart);
  const rangeEndT = dayStart(rangeEnd);

  for (const ev of events) {
    const recurrence = ev.recurrence ?? 'none';
    const recurrenceEnd = ev.recurrenceEnd;
    const evStart = new Date(ev.start);
    const evEnd = new Date(ev.end);
    const duration = evEnd.getTime() - evStart.getTime();

    if (recurrence === 'none') {
      const startT = dayStart(evStart);
      if (startT <= rangeEndT && dayStart(evEnd) >= rangeStartT) {
        result.push({ event: ev, start: evStart, end: evEnd });
      }
      continue;
    }

    let curStart = new Date(evStart);
    let curEnd = new Date(evEnd);
    const maxOccurrences = 500;
    let count = 0;

    while (curStart.getTime() <= rangeEnd.getTime() && count < maxOccurrences) {
      if (recurrenceEnd && curStart > recurrenceEnd) break;
      const curStartT = dayStart(curStart);
      if (curStartT <= rangeEndT && dayStart(curEnd) >= rangeStartT) {
        result.push({ event: ev, start: new Date(curStart.getTime()), end: new Date(curEnd.getTime()) });
      }
      count++;
      if (recurrence === 'daily') {
        curStart = addDays(curStart, 1);
        curEnd = addDays(curEnd, 1);
      } else if (recurrence === 'weekly') {
        curStart = addWeeks(curStart, 1);
        curEnd = addWeeks(curEnd, 1);
      } else if (recurrence === 'monthly') {
        curStart = addMonths(curStart, 1);
        curEnd = addMonths(curEnd, 1);
      }
    }
  }

  return result.sort((a, b) => a.start.getTime() - b.start.getTime());
}
