'use client';

import React, { useState, useEffect } from 'react';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface CalendarEvent {
  id: string;
  name: string;
  start: Date;
  end: Date;
  color?: string;
  notes?: string;
  recurrence?: RecurrenceType;
  recurrenceEnd?: Date;
  reminderMinutes?: number; // 0 = no reminder, 5, 15, 30, 60
}

export const REMINDER_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
] as const;

export const RECURRENCE_OPTIONS: { value: RecurrenceType; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export const EVENT_COLORS = [
  { value: '#3B82F6', label: 'Blue' },
  { value: '#10B981', label: 'Green' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Red' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#84CC16', label: 'Lime' },
] as const;

const DEFAULT_COLOR = EVENT_COLORS[0].value;

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'> & { id?: string }) => void;
  initialDate?: Date;
  editEvent?: CalendarEvent | null;
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const h = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function AddEventModal({ isOpen, onClose, onSave, initialDate, editEvent }: AddEventModalProps) {
  const now = new Date();
  const defaultStart = initialDate
    ? new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate(), 9, 0)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);

  const [name, setName] = useState('');
  const [startStr, setStartStr] = useState(toDatetimeLocal(defaultStart));
  const [endStr, setEndStr] = useState(toDatetimeLocal(defaultEnd));
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [notes, setNotes] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [recurrenceEndStr, setRecurrenceEndStr] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editEvent) {
        setName(editEvent.name);
        setStartStr(toDatetimeLocal(editEvent.start));
        setEndStr(toDatetimeLocal(editEvent.end));
        setColor(editEvent.color ?? DEFAULT_COLOR);
        setNotes(editEvent.notes ?? '');
        setRecurrence(editEvent.recurrence ?? 'none');
        setRecurrenceEndStr(editEvent.recurrenceEnd ? editEvent.recurrenceEnd.toISOString().slice(0, 10) : '');
        setReminderMinutes(editEvent.reminderMinutes ?? 0);
      } else {
        const start = initialDate
          ? new Date(initialDate.getFullYear(), initialDate.getMonth(), initialDate.getDate(), 9, 0)
          : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        setName('');
        setStartStr(toDatetimeLocal(start));
        setEndStr(toDatetimeLocal(end));
        setColor(DEFAULT_COLOR);
        setNotes('');
        setRecurrence('none');
        setRecurrenceEndStr('');
        setReminderMinutes(0);
      }
      setError('');
    }
  }, [isOpen, initialDate, editEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (!name.trim()) {
      setError('Please enter an event name.');
      return;
    }
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Invalid date or time.');
      return;
    }
    if (end <= start) {
      setError('End time must be after start time.');
      return;
    }
    if (recurrence !== 'none' && recurrenceEndStr && isNaN(new Date(recurrenceEndStr).getTime())) {
      setError('Invalid recurrence end date.');
      return;
    }
    setError('');
    const recurrenceEnd = recurrence !== 'none' && recurrenceEndStr ? new Date(recurrenceEndStr) : undefined;
    onSave({
      name: name.trim(),
      start,
      end,
      color,
      notes: notes.trim() || undefined,
      recurrence: recurrence === 'none' ? undefined : recurrence,
      recurrenceEnd,
      reminderMinutes: reminderMinutes || undefined,
      ...(editEvent && { id: editEvent.id }),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-xl font-semibold text-slate-800">{editEvent ? 'Edit event' : 'Add event'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="event-name" className="mb-1 block text-sm font-medium text-slate-700">
              Event name
            </label>
            <input
              id="event-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Team meeting"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="event-start" className="mb-1 block text-sm font-medium text-slate-700">
              Start
            </label>
            <input
              id="event-start"
              type="datetime-local"
              value={startStr}
              onChange={(e) => setStartStr(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="event-end" className="mb-1 block text-sm font-medium text-slate-700">
              End
            </label>
            <input
              id="event-end"
              type="datetime-local"
              value={endStr}
              onChange={(e) => setEndStr(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label htmlFor="event-notes" className="mb-1 block text-sm font-medium text-slate-700">
              Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="event-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Location, meeting link..."
              rows={2}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Repeat</label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {RECURRENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {recurrence !== 'none' && (
              <div className="mt-2">
                <label className="mb-1 block text-xs text-slate-500">End date (optional)</label>
                <input
                  type="date"
                  value={recurrenceEndStr}
                  onChange={(e) => setRecurrenceEndStr(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-800"
                />
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Remind me</label>
            <select
              value={reminderMinutes}
              onChange={(e) => setReminderMinutes(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {REMINDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">Event color</span>
            <div className="flex flex-wrap gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    color === c.value ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
