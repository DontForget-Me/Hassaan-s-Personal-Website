'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ProjectTimelineEvent } from '@/types/database';

interface Props {
  projectId: string;
}

const EVENT_ICONS: Record<string, string> = {
  message: '💬',
  file_upload: '📎',
  milestone_approved: '✅',
  milestone_completed: '✔️',
  project_started: '🚀',
  project_completed: '🎉',
  extension_requested: '📅',
  extension_approved: '👍',
  payment_made: '💰',
};

export default function ProjectTimeline({ projectId }: Props) {
  const [events, setEvents] = useState<ProjectTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('project_timeline_events')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setEvents(data as ProjectTimelineEvent[]);
        setLoading(false);
      });
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading timeline...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No activity yet.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div
        className="absolute left-[11px] top-2 bottom-2 w-px"
        style={{ backgroundColor: 'var(--border)' }}
      />

      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="flex gap-3">
            <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
              style={{ backgroundColor: 'var(--bg-secondary)' }}>
              {EVENT_ICONS[event.event_type] ?? '📌'}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {event.description}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                {new Date(event.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
