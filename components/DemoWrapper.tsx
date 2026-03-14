'use client';

import React, { useState, useCallback, useEffect } from "react";
import { useSnack } from "@/app/SnackProvider";
import { ContinuousCalendar } from "@/components/ContinuousCalendar";
import { AddEventModal, type CalendarEvent } from "@/components/AddEventModal";
import { DayDetailModal } from "@/components/DayDetailModal";
import { AllEventsModal } from "@/components/AllEventsModal";
import { useEventReminders } from "@/hooks/useEventReminders";
import { supabase } from "@/lib/supabase";
import * as XLSX from 'xlsx';

type DbEvent = {
  id: string;
  name: string;
  start: string;
  end: string;
  color: string | null;
  notes: string | null;
  recurrence: string | null;
  recurrence_end: string | null;
  reminder_minutes: number | null;
};

function dbToEvent(row: DbEvent): CalendarEvent {
  return {
    id: row.id,
    name: row.name,
    start: new Date(row.start),
    end: new Date(row.end),
    color: row.color ?? undefined,
    notes: row.notes ?? undefined,
    recurrence: (row.recurrence as CalendarEvent['recurrence']) ?? undefined,
    recurrenceEnd: row.recurrence_end ? new Date(row.recurrence_end) : undefined,
    reminderMinutes: row.reminder_minutes ?? undefined,
  };
}

export default function DemoWrapper() {
  const { createSnack } = useSnack();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start', { ascending: true });
      if (error) {
        createSnack('Failed to load events', 'error');
      } else {
        setEvents((data as DbEvent[]).map(dbToEvent));
      }
      setLoading(false);
    };
    fetchEvents();

    const channel = supabase
      .channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalInitialDate, setAddModalInitialDate] = useState<Date | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<{ day: number; month: number; year: number } | null>(null);
  const [showAllEventsModal, setShowAllEventsModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEventReminders(events);

  const onClickHandler = useCallback((day: number, month: number, year: number) => {
    const cell = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    cell.setHours(0, 0, 0, 0);
    if (cell < today) return;
    setSelectedDay({ day, month, year });
  }, []);

  const handleAddEventClick = useCallback(() => {
    setEditingEvent(null);
    setAddModalInitialDate(undefined);
    setShowAddModal(true);
  }, []);

  const handleAddEventForDay = useCallback(() => {
    if (selectedDay) {
      setEditingEvent(null);
      setAddModalInitialDate(new Date(selectedDay.year, selectedDay.month, selectedDay.day));
      setShowAddModal(true);
    }
  }, [selectedDay]);

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent(event);
    setAddModalInitialDate(undefined);
    setShowAddModal(true);
  }, []);

  const handleDeleteEvent = useCallback(async (ev: CalendarEvent) => {
    const { error } = await supabase.from('events').delete().eq('id', ev.id);
    if (error) {
      createSnack('Failed to delete event', 'error');
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
      createSnack('Event deleted', 'success');
    }
  }, [createSnack]);

  const handleExport = useCallback(() => {
    const rows = events.map((ev) => ({
      Name: ev.name,
      Start: ev.start.toLocaleString(),
      End: ev.end.toLocaleString(),
      Notes: ev.notes ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Events');
    XLSX.writeFile(wb, `calendar-events-${new Date().toISOString().slice(0, 10)}.xlsx`);
    createSnack(`Exported ${events.length} event(s) to Excel`, 'success');
  }, [events, createSnack]);

  const handleSaveEvent = useCallback(async (event: Omit<CalendarEvent, 'id'> & { id?: string }) => {
    if (event.id) {
      const { error } = await supabase
        .from('events')
        .update({
          name: event.name,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
          color: event.color ?? null,
          notes: event.notes ?? null,
          recurrence: event.recurrence ?? null,
          recurrence_end: event.recurrenceEnd?.toISOString() ?? null,
          reminder_minutes: event.reminderMinutes ?? null,
        })
        .eq('id', event.id);
      if (error) {
        createSnack('Failed to update event', 'error');
        return;
      }
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? ({ ...e, ...event, id: e.id } as CalendarEvent)
            : e
        )
      );
      createSnack('Event updated: ' + event.name, 'success');
    } else {
      const newId = `evt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const { error } = await supabase.from('events').insert({
        id: newId,
        name: event.name,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        color: event.color ?? '#3B82F6',
        notes: event.notes ?? null,
        recurrence: event.recurrence ?? null,
        recurrence_end: event.recurrenceEnd?.toISOString() ?? null,
        reminder_minutes: event.reminderMinutes ?? null,
      });
      if (error) {
        createSnack('Failed to add event', 'error');
        return;
      }
      setEvents((prev) => [
        ...prev,
        {
          ...event,
          id: newId,
          color: event.color ?? '#3B82F6',
        } as CalendarEvent,
      ]);
      createSnack('Event added: ' + event.name, 'success');
    }
    setEditingEvent(null);
  }, [createSnack]);

  return (
    <div className="relative flex h-screen max-h-screen w-full flex-col gap-4 px-4 pt-4 items-center justify-center">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      )}
      <div className="relative h-full overflow-auto mt-20">
        <ContinuousCalendar
          onClick={onClickHandler}
          events={events}
          onAddEventClick={handleAddEventClick}
          onAllEventsClick={() => setShowAllEventsModal(true)}
        />
      </div>
      <DayDetailModal
        isOpen={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        date={selectedDay ?? { day: 1, month: 0, year: new Date().getFullYear() }}
        events={events}
        onAddEvent={handleAddEventForDay}
        onEditEvent={handleEditEvent}
        onRequestDelete={handleDeleteEvent}
      />
      <AllEventsModal
        isOpen={showAllEventsModal}
        onClose={() => setShowAllEventsModal(false)}
        events={events}
        onEditEvent={handleEditEvent}
        onRequestDelete={handleDeleteEvent}
        onExport={handleExport}
      />
      <AddEventModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingEvent(null); }}
        onSave={handleSaveEvent}
        initialDate={addModalInitialDate}
        editEvent={editingEvent}
      />
    </div>
  );
}
