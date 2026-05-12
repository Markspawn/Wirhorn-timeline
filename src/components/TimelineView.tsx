import { useEffect, useMemo, useRef } from 'react';
import { DataSet } from 'vis-data/peer';
import { Timeline } from 'vis-timeline/peer';
import type { TimelineOptions } from 'vis-timeline/peer';
import type { TimelineEvent } from '../App';
import { timelineYearToValue } from '../lib/dateParser';
import { TIMELINE_GROUPS, getGroupColor } from '../lib/groupColors';

type TimelineViewProps = {
  events: TimelineEvent[];
  onSelectEvent: (event: TimelineEvent) => void;
  resetSignal: number;
};


const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const getInitialWindow = (events: TimelineEvent[]) => {
  if (events.length === 0) {
    return {
      start: timelineYearToValue(-500),
      end: timelineYearToValue(1100)
    };
  }

  const starts = events.map((event) => event.start);
  const ends = events.map((event) => event.end ?? event.start);
  const min = Math.min(...starts);
  const max = Math.max(...ends);
  const padding = Math.max(80, Math.round((max - min) * 0.08));

  return {
    start: timelineYearToValue(min - padding),
    end: timelineYearToValue(max + padding)
  };
};

export default function TimelineView({ events, onSelectEvent, resetSignal }: TimelineViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<Timeline | null>(null);
  const eventsById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const groups = new DataSet(
      TIMELINE_GROUPS.map((group, index) => {
        const color = getGroupColor(group);

        return {
          id: group,
          content: `<span class="group-label"><span class="group-dot" style="background:${color.color}"></span>${group}</span>`,
          order: index
        };
      })
    );

    const items = new DataSet(
      events.map((event) => {
        const color = getGroupColor(event.group);
        const isRange = typeof event.end === 'number' && event.end !== event.start;

        return {
          id: event.id,
          group: event.group,
          content: `<span class="timeline-card-title">${escapeHtml(event.title)}</span><span class="timeline-card-date">${escapeHtml(event.displayDate)}</span>`,
          title: `${event.title} — ${event.displayDate}`,
          start: timelineYearToValue(event.start),
          end: isRange ? timelineYearToValue(event.end as number) : undefined,
          type: isRange ? 'range' : 'box',
          className: `timeline-item timeline-item-${event.group.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          style: `--event-color:${color.color};--event-border:${color.border};--event-soft:${color.soft};--event-text:${color.text};`
        };
      })
    );

    const initialWindow = getInitialWindow(events);
    const options: TimelineOptions = {
      orientation: 'top',
      stack: true,
      horizontalScroll: true,
      zoomKey: 'ctrlKey',
      zoomMin: timelineYearToValue(1) - timelineYearToValue(0),
      zoomMax: timelineYearToValue(9000) - timelineYearToValue(0),
      min: timelineYearToValue(-4500),
      max: timelineYearToValue(1300),
      start: initialWindow.start,
      end: initialWindow.end,
      margin: {
        item: 14,
        axis: 18
      },
      showCurrentTime: false,
      tooltip: {
        followMouse: true,
        overflowMethod: 'cap'
      },
      format: {
        minorLabels: {
          millisecond: 'SSS',
          second: 's',
          minute: 'HH:mm',
          hour: 'HH:mm',
          weekday: 'ddd D',
          day: 'D',
          week: 'w',
          month: 'MMM',
          year: 'YYYY'
        },
        majorLabels: {
          millisecond: 'HH:mm:ss',
          second: 'D MMMM HH:mm',
          minute: 'ddd D MMMM',
          hour: 'ddd D MMMM',
          weekday: 'MMMM YYYY',
          day: 'MMMM YYYY',
          week: 'MMMM YYYY',
          month: 'YYYY',
          year: 'YYYY'
        }
      }
    };

    const timeline = new Timeline(containerRef.current, items, groups, options);

    timeline.on('select', (properties: { items: Array<string | number> }) => {
      const selectedId = properties.items[0]?.toString();
      const selectedEvent = selectedId ? eventsById.get(selectedId) : undefined;

      if (selectedEvent) {
        onSelectEvent(selectedEvent);
        timeline.setSelection([]);
      }
    });

    timelineRef.current = timeline;

    return () => {
      timeline.destroy();
      timelineRef.current = null;
    };
  }, [events, eventsById, onSelectEvent]);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) {
      return;
    }

    const initialWindow = getInitialWindow(events);
    timeline.setWindow(initialWindow.start, initialWindow.end, { animation: true });
  }, [resetSignal, events]);

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <h2>No visible events</h2>
        <p>Adjust filters, disable Player Mode, or clear the search field to reveal timeline entries.</p>
      </div>
    );
  }

  return <div className="timeline-shell" ref={containerRef} aria-label="Interactive campaign timeline" />;
}
