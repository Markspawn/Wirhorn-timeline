import { useEffect, useMemo, useRef } from 'react';
import { DataSet } from 'vis-data/peer';
import { Timeline } from 'vis-timeline/peer';
import type { TimelineOptions } from 'vis-timeline/peer';
import type { TimelineEvent } from '../App';
import { timelineYearToValue, valueToTimelineYear } from '../lib/dateParser';
import { getGroupColor, getGroupIcon } from '../lib/groupColors';

type TimelineViewProps = {
  events: TimelineEvent[];
  onSelectEvent: (event: TimelineEvent) => void;
  onPreviewEvent: (event: TimelineEvent | null) => void;
  resetSignal: number;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const slugify = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const getEventMidpointValue = (event: TimelineEvent): number => {
  const start = timelineYearToValue(event.start);
  const end = typeof event.end === 'number' ? timelineYearToValue(event.end) : start;

  return start + (end - start) / 2;
};

const getClosestEventToValue = (events: TimelineEvent[], value: number): TimelineEvent | null => {
  if (events.length === 0) {
    return null;
  }

  return events.reduce((closest, event) => {
    const eventDistance = Math.abs(getEventMidpointValue(event) - value);
    const closestDistance = Math.abs(getEventMidpointValue(closest) - value);

    return eventDistance < closestDistance ? event : closest;
  }, events[0]);
};

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

const getStaggerClass = (index: number): string => `worldline-stagger-${index % 7}`;

export default function TimelineView({ events, onSelectEvent, onPreviewEvent, resetSignal }: TimelineViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<Timeline | null>(null);
  const eventsById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const items = new DataSet(
      events.map((event, index) => {
        const color = getGroupColor(event.group);
        const icon = getGroupIcon(event.group);
        const isRange = typeof event.end === 'number' && event.end !== event.start;
        const escapedTitle = escapeHtml(event.title);
        const escapedDate = escapeHtml(event.displayDate);
        const escapedGroup = escapeHtml(event.group);

        return {
          id: event.id,
          content: `<span class="worldline-marker" aria-hidden="true">${escapeHtml(icon)}</span>`,
          title: `<strong>${escapedTitle}</strong><br><span>${escapedDate}</span><br><em>${escapedGroup}</em>`,
          start: timelineYearToValue(event.start),
          end: isRange ? timelineYearToValue(event.end as number) : undefined,
          type: isRange ? 'range' : 'box',
          className: `timeline-item worldline-item worldline-${isRange ? 'range' : 'point'} ${getStaggerClass(index)} timeline-item-${slugify(event.group)}`,
          style: `--event-color:${color.color};--event-border:${color.border};--event-soft:${color.soft};--event-text:${color.text};`
        };
      })
    );

    const initialWindow = getInitialWindow(events);
    const options: TimelineOptions = {
      orientation: 'top',
      stack: true,
      moveable: true,
      horizontalScroll: true,
      zoomable: true,
      zoomKey: 'ctrlKey',
      zoomMin: timelineYearToValue(1) - timelineYearToValue(0),
      zoomMax: timelineYearToValue(9000) - timelineYearToValue(0),
      min: timelineYearToValue(-4500),
      max: timelineYearToValue(1300),
      start: initialWindow.start,
      end: initialWindow.end,
      margin: {
        item: {
          horizontal: 22,
          vertical: 12
        },
        axis: 34
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

    const timeline = new Timeline(containerRef.current, items, undefined, options);
    timeline.addCustomTime(new Date(timelineYearToValue(0)), 'shattering-divider');
    timelineRef.current = timeline;

    timeline.on('itemover', (properties: { item?: string | number }) => {
      const hoveredId = properties.item?.toString();
      onPreviewEvent(hoveredId ? eventsById.get(hoveredId) ?? null : null);
    });

    timeline.on('rangechange', (properties: { start: Date; end: Date; byUser?: boolean }) => {
      if (!properties.byUser) {
        return;
      }

      const centerValue = properties.start.getTime() + (properties.end.getTime() - properties.start.getTime()) / 2;
      const centerYear = valueToTimelineYear(centerValue);
      onPreviewEvent(getClosestEventToValue(events, timelineYearToValue(centerYear)));
    });

    timeline.on('select', (properties: { items: Array<string | number> }) => {
      const selectedId = properties.items[0]?.toString();
      const selectedEvent = selectedId ? eventsById.get(selectedId) : undefined;

      if (selectedEvent) {
        onPreviewEvent(selectedEvent);
        onSelectEvent(selectedEvent);
      }
    });

    const centeredEvent = getClosestEventToValue(events, (initialWindow.start + initialWindow.end) / 2);
    onPreviewEvent(centeredEvent);

    return () => {
      timeline.destroy();
      timelineRef.current = null;
    };
  }, [events, eventsById, onPreviewEvent, onSelectEvent]);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) {
      return;
    }

    const nextWindow = getInitialWindow(events);
    timeline.setWindow(nextWindow.start, nextWindow.end, { animation: true });
    onPreviewEvent(getClosestEventToValue(events, (nextWindow.start + nextWindow.end) / 2));
  }, [events, onPreviewEvent, resetSignal]);

  if (events.length === 0) {
    return (
      <div className="empty-state">
        <h2>No markers match these filters</h2>
        <p>Show more groups or eras to return entries to the worldline.</p>
      </div>
    );
  }

  return (
    <div className="worldline-wrap">
      <div className="era-ribbon" aria-hidden="true">
        <span>Before Shattering</span>
        <span>The Shattering</span>
        <span>Post Shattering</span>
      </div>
      <div ref={containerRef} className="timeline-shell worldline-shell" aria-label="Interactive Wirhorn world history timeline" />
    </div>
  );
}
