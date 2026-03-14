'use client';

import React, { useState, useMemo } from 'react';
import type { CalendarEvent } from './AddEventModal';
import { EventStatusBadge } from '@/lib/EventStatusBadge';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatTime(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function formatEventDateRange(start: Date, end: Date): string {
  const sameDay =
    start.getDate() === end.getDate() &&
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();
  if (sameDay) {
    return `${monthNames[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} · ${formatTime(start)} – ${formatTime(end)}`;
  }
  return `${monthNames[start.getMonth()]} ${start.getDate()}, ${start.getFullYear()} ${formatTime(start)} – ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()} ${formatTime(end)}`;
}

interface AllEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: CalendarEvent[];
  onEditEvent?: (event: CalendarEvent) => void;
  onRequestDelete?: (event: CalendarEvent) => void;
  onExport?: () => void;
}

export function AllEventsModal({ isOpen, onClose, events, onEditEvent, onRequestDelete, onExport }: AllEventsModalProps) {
  const [search, setSearch] = useState('');

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? events.filter(
          (ev) =>
            ev.name.toLowerCase().includes(q) || (ev.notes?.toLowerCase().includes(q) ?? false)
        )
      : events;
    return [...list].sort((a, b) => a.start.getTime() - b.start.getTime());
  }, [events, search]);

  if (!isOpen) return null;

  const defaultColor = '#3B82F6';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">All saved events</h2>
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
          <input
            type="search"
            placeholder="Search by name or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <div className="mt-3 flex gap-2">
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-gray-50"
              >
                Export Excel
              </button>
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {filteredAndSorted.length === 0 ? (
            <p className="py-8 text-center text-slate-500">{search.trim() ? 'No events match your search.' : 'No saved events yet.'}</p>
          ) : (
            <ul className="space-y-3">
              {filteredAndSorted.map((ev) => (
                <li
                  key={ev.id}
                  className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 pl-5"
                  style={{ borderLeft: `4px solid ${ev.color || defaultColor}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-slate-800">{ev.name}</span>
                        <EventStatusBadge start={ev.start} end={ev.end} />
                      </div>
                      {ev.recurrence && ev.recurrence !== 'none' && (
                        <span className="ml-0 mt-1 block text-xs text-slate-400">(Repeats {ev.recurrence})</span>
                      )}
                      <span className="mt-1 block text-sm text-slate-500">
                        {formatEventDateRange(ev.start, ev.end)}
                      </span>
                      {ev.notes && (
                        <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{ev.notes}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {onEditEvent && (
                        <button
                          type="button"
                          onClick={() => onEditEvent(ev)}
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
                          onClick={() => onRequestDelete(ev)}
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
      </div>
    </div>
  );
}
