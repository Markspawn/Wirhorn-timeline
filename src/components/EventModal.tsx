import { getGroupColor } from '../lib/groupColors';
import type { TimelineEvent } from '../App';

type EventModalProps = {
  event: TimelineEvent | null;
  onClose: () => void;
};

export default function EventModal({ event, onClose }: EventModalProps) {
  if (!event) {
    return null;
  }

  const color = getGroupColor(event.group);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <article
        className="event-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close event details">
          ×
        </button>

        {event.media ? (
          <img className="modal-media" src={event.media} alt="" />
        ) : (
          <div className="modal-sigil" style={{ borderColor: color.border, color: color.text }}>
            ✦
          </div>
        )}

        <div className="modal-kicker" style={{ color: color.text }}>
          {event.displayDate} • {event.era}
        </div>
        <h2 id="event-modal-title">{event.title}</h2>
        <div className="modal-group" style={{ background: color.soft, borderColor: color.border }}>
          {event.group}
        </div>
        <p>{event.details}</p>
        {event.spoiler && <p className="spoiler-note">Marked as spoiler content.</p>}
      </article>
    </div>
  );
}
