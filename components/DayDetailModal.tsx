'use client';

import React from 'react';
import type { CalendarEvent } from './AddEventModal';
import { expandRecurringEvents } from '@/lib/recurrence';
import { EventStatusBadge } from '@/lib/EventStatusBadge';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatTime(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function formatEventTimeRange(start: Date, end: Date): string {
  const sameDay =
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();
  if (sameDay) {
    return `${formatTime(start)} – ${formatTime(end)}`;
  }
  const d = (date: Date) => `${date.getDate()}/${date.getMonth() + 1}`;
  return `${d(start)} ${formatTime(start)} – ${d(end)} ${formatTime(end)}`;
}

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: { day: number; month: number; year: number };
  events: CalendarEvent[];
  onAddEvent: () => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onRequestDelete?: (event: CalendarEvent) => void;
}

export function DayDetailModal({ isOpen, onClose, date, events, onAddEvent, onEditEvent, onRequestDelete }: DayDetailModalProps) {
  if (!isOpen) return null;

  const dateLabel = `${date.day} ${monthNames[date.month]} ${date.year}`;
  const rangeStart = new Date(date.year, date.month, date.day);
  const rangeEnd = new Date(date.year, date.month, date.day, 23, 59, 59);
  const expandedForDay = expandRecurringEvents(events, rangeStart, rangeEnd);
  const sortedEvents = [...expandedForDay].sort((a, b) => a.start.getTime() - b.start.getTime());
  const defaultColor = '#3B82F6';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">{dateLabel}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          {sortedEvents.length === 0 ? (
            <p className="py-4 text-center text-slate-500">No events on this day.</p>
          ) : (
            <ul className="space-y-3">
              {sortedEvents.map((ex, i) => (
                <li
                  key={`${ex.event.id}-${ex.start.getTime()}-${i}`}
                  className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 pl-5"
                  style={{ borderLeft: `4px solid ${ex.event.color || defaultColor}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-800">{ex.event.name}</span>
                        <EventStatusBadge start={ex.start} end={ex.end} />
                      </div>
                      {ex.event.recurrence && ex.event.recurrence !== 'none' && (
                        <span className="ml-0 mt-1 block text-xs text-slate-400">(Repeats {ex.event.recurrence})</span>
                      )}
                      <span className="mt-1 block text-sm text-slate-500">
                        {formatEventTimeRange(ex.start, ex.end)}
                      </span>
                      {ex.event.notes && (
                        <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{ex.event.notes}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {onEditEvent && (
                        <button
                          type="button"
                          onClick={() => onEditEvent(ex.event)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                          title="Edit"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onRequestDelete && (
                        <button
                          type="button"
                          onClick={() => onRequestDelete(ex.event)}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600"
                          title="Delete"
                        >
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onAddEvent}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            + Add event
          </button>
        </div>
      </div>
    </div>
  );
}
