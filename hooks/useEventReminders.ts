"use client";

import { useEffect, useRef } from "react";
import type { CalendarEvent } from "@/components/AddEventModal";

const REMINDER_STORAGE_KEY = "calendar-reminded";
const CHECK_INTERVAL_MS = 30_000; // 30 seconds

function loadNotifiedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

function saveNotifiedIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore
  }
}

export function useEventReminders(events: CalendarEvent[]) {
  const notifiedRef = useRef<Set<string>>(loadNotifiedIds());

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const requestPermission = () => {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    };
    requestPermission();

    const check = () => {
      const now = Date.now();
      for (const ev of events) {
        const reminder = ev.reminderMinutes ?? 0;
        if (reminder <= 0) continue;
        const start = ev.start.getTime();
        const windowStart = start - reminder * 60 * 1000;
        const windowEnd = start + 60 * 1000; // 1 min after start
        if (
          now >= windowStart &&
          now <= windowEnd &&
          !notifiedRef.current.has(ev.id)
        ) {
          try {
            if (Notification.permission === "granted") {
              new Notification("Event reminder", {
                body: `${ev.name} — reminder (${reminder} min before)`,
                icon: "/next.svg",
              });
              notifiedRef.current.add(ev.id);
              saveNotifiedIds(notifiedRef.current);
            }
          } catch {
            // ignore
          }
        }
      }
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [events]);
}
