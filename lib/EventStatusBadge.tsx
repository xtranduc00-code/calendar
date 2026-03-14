'use client';

import React from 'react';
import { getEventStatus, getEventStatusLabel } from './eventStatus';

const statusStyles: Record<'upcoming' | 'in_progress' | 'ended', string> = {
  upcoming: 'bg-sky-100 text-sky-700',
  in_progress: 'bg-emerald-100 text-emerald-700',
  ended: 'bg-slate-100 text-slate-500',
};

interface EventStatusBadgeProps {
  start: Date;
  end: Date;
  now?: Date;
}

export function EventStatusBadge({ start, end, now }: EventStatusBadgeProps) {
  const status = getEventStatus(start, end, now);
  const label = getEventStatusLabel(start, end, now);
  return (
    <span
      className={`inline rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}
      title={label}
    >
      {label}
    </span>
  );
}
