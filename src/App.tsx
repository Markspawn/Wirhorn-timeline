import { useCallback, useEffect, useMemo, useState } from 'react';
import EventModal from './components/EventModal';
import FilterPanel from './components/FilterPanel';
import SearchBar from './components/SearchBar';
import TimelineView from './components/TimelineView';
import { getEraForYear, parseFantasyDate } from './lib/dateParser';
import { TIMELINE_GROUPS, getGroupColor, type TimelineGroup } from './lib/groupColors';

export type TimelineEvent = {
  id: string;
  title: string;
  displayDate: string;
  start: number;
  end?: number;
  era: 'Before Shattering' | 'Post Shattering' | string;
  group: TimelineGroup | string;
  summary: string;
  details: string;
  spoiler: boolean;
  media: string | null;
};

type LoadState = 'loading' | 'ready' | 'error';

const normalizeEvent = (event: TimelineEvent): TimelineEvent => {
  const parsed = parseFantasyDate(event.displayDate);

  return {
    ...event,
    start: Number.isFinite(event.start) ? event.start : parsed.start,
    end: Number.isFinite(event.end) ? event.end : parsed.end,
    era: event.era || getEraForYear(parsed.start),
    spoiler: Boolean(event.spoiler),
    media: event.media ?? null
  };
};

function TimelinePreview({ event }: { event: TimelineEvent | null }) {
  if (!event) {
    return (
      <aside className="timeline-preview timeline-preview--empty" aria-label="Timeline event preview">
        <p className="eyebrow">Worldline Navigator</p>
        <h2>Drag across the timeline</h2>
        <p>
          Pan left or right, hover an event, or click a marker to inspect individual moments in
          the history of Wirhorn.
        </p>
      </aside>
    );
  }

  const color = getGroupColor(event.group);

  return (
    <aside className="timeline-preview" aria-label="Timeline event preview">
      <div className="preview-accent" style={{ background: color.color, boxShadow: `0 0 28px ${color.color}` }} />
      <div>
        <p className="eyebrow" style={{ color: color.text }}>{event.group}</p>
        <h2>{event.title}</h2>
        <div className="preview-meta">
          <span>{event.displayDate}</span>
          <span>{event.era}</span>
        </div>
        <p>{event.summary}</p>
      </div>
    </aside>
  );
}

export default function App() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<Set<TimelineGroup>>(new Set(TIMELINE_GROUPS));
  const [selectedEras, setSelectedEras] = useState<Set<string>>(new Set(['Before Shattering', 'Post Shattering']));
  const [query, setQuery] = useState('');
  const [playerMode, setPlayerMode] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [previewEvent, setPreviewEvent] = useState<TimelineEvent | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/data/events.json', { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Could not load /data/events.json (${response.status})`);
        }

        const data = (await response.json()) as TimelineEvent[];

        if (!Array.isArray(data)) {
          throw new Error('events.json must contain an array of timeline entries.');
        }

        const normalized = data.map(normalizeEvent).sort((a, b) => a.start - b.start);
        setEvents(normalized);
        setPreviewEvent(normalized[0] ?? null);
        setSelectedEras(new Set(Array.from(new Set(normalized.map((event) => event.era)))));
        setLoadState('ready');
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unknown timeline data error.');
        setLoadState('error');
      });

    return () => controller.abort();
  }, []);

  const availableEras = useMemo(
    () => Array.from(new Set(events.map((event) => event.era))).sort(),
    [events]
  );

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return events.filter((event) => {
      const groupAllowed = TIMELINE_GROUPS.includes(event.group as TimelineGroup)
        ? selectedGroups.has(event.group as TimelineGroup)
        : true;
      const eraAllowed = selectedEras.has(event.era);
      const spoilerAllowed = !playerMode || !event.spoiler;
      const searchAllowed =
        normalizedQuery.length === 0 ||
        [event.title, event.displayDate, event.group, event.era, event.summary, event.details]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      return groupAllowed && eraAllowed && spoilerAllowed && searchAllowed;
    });
  }, [events, playerMode, query, selectedEras, selectedGroups]);

  useEffect(() => {
    if (!previewEvent || !filteredEvents.some((event) => event.id === previewEvent.id)) {
      setPreviewEvent(filteredEvents[0] ?? null);
    }
  }, [filteredEvents, previewEvent]);

  const toggleGroup = useCallback((group: TimelineGroup) => {
    setSelectedGroups((current) => {
      const next = new Set(current);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  }, []);

  const toggleEra = useCallback((era: string) => {
    setSelectedEras((current) => {
      const next = new Set(current);
      if (next.has(era)) {
        next.delete(era);
      } else {
        next.add(era);
      }
      return next;
    });
  }, []);

  const resetView = () => setResetSignal((value) => value + 1);

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Wirhorn Campaign Archive</p>
          <h1>Timeline of the World</h1>
          <p className="hero-copy">
            Explore eras, wars, divine upheavals, artifacts, and campaign milestones in a
            player-facing chronicle built for table lore.
          </p>
        </div>
        <div className="hero-card" aria-label="Timeline summary">
          <span>{events.length}</span>
          <small>known entries</small>
        </div>
      </header>

      <main className="layout-grid">
        <FilterPanel
          selectedGroups={selectedGroups}
          selectedEras={selectedEras}
          availableEras={availableEras}
          playerMode={playerMode}
          onToggleGroup={toggleGroup}
          onToggleEra={toggleEra}
          onTogglePlayerMode={() => setPlayerMode((value) => !value)}
          onSelectAll={() => {
            setSelectedGroups(new Set(TIMELINE_GROUPS));
            setSelectedEras(new Set(availableEras));
          }}
          onClearAll={() => {
            setSelectedGroups(new Set());
            setSelectedEras(new Set());
          }}
        />

        <section className="timeline-panel">
          <TimelinePreview event={previewEvent} />

          <div className="toolbar">
            <SearchBar value={query} onChange={setQuery} />
            <button className="reset-button" type="button" onClick={resetView}>
              Reset View
            </button>
          </div>

          <div className="timeline-status">
            <span>{filteredEvents.length} visible entries</span>
            <span>{playerMode ? 'Spoilers hidden' : 'Spoilers visible'}</span>
            <span>Drag to pan</span>
            <span>Ctrl + wheel to zoom</span>
            <span>Click an event for full lore</span>
          </div>

          {loadState === 'loading' && (
            <div className="loading-state">
              <div className="loader" />
              <p>Opening the campaign chronicle...</p>
            </div>
          )}

          {loadState === 'error' && (
            <div className="error-state">
              <h2>The archive could not be opened</h2>
              <p>{errorMessage}</p>
              <p>Check that <code>/data/events.json</code> exists and contains valid JSON.</p>
            </div>
          )}

          {loadState === 'ready' && (
            <TimelineView
              events={filteredEvents}
              onSelectEvent={setSelectedEvent}
              onPreviewEvent={setPreviewEvent}
              resetSignal={resetSignal}
            />
          )}
        </section>
      </main>

      <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
}
