import { TIMELINE_GROUPS, getGroupColor, type TimelineGroup } from '../lib/groupColors';

type FilterPanelProps = {
  selectedGroups: Set<TimelineGroup>;
  selectedEras: Set<string>;
  availableEras: string[];
  playerMode: boolean;
  onToggleGroup: (group: TimelineGroup) => void;
  onToggleEra: (era: string) => void;
  onTogglePlayerMode: () => void;
  onSelectAll: () => void;
  onClearAll: () => void;
};

export default function FilterPanel({
  selectedGroups,
  selectedEras,
  availableEras,
  playerMode,
  onToggleGroup,
  onToggleEra,
  onTogglePlayerMode,
  onSelectAll,
  onClearAll
}: FilterPanelProps) {
  return (
    <aside className="filter-panel" aria-label="Timeline filters">
      <div className="panel-section panel-section--mode">
        <div>
          <span className="eyebrow">Visibility</span>
          <h2>Filters</h2>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" checked={playerMode} onChange={onTogglePlayerMode} />
          <span className="slider" />
          <span>Player Mode</span>
        </label>
      </div>

      <div className="filter-actions">
        <button type="button" onClick={onSelectAll}>Show all</button>
        <button type="button" onClick={onClearAll}>Hide all</button>
      </div>

      <div className="panel-section">
        <h3>Eras</h3>
        <div className="filter-list">
          {availableEras.map((era) => (
            <label key={era} className="filter-chip filter-chip--era">
              <input
                type="checkbox"
                checked={selectedEras.has(era)}
                onChange={() => onToggleEra(era)}
              />
              <span>{era}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3>Event Groups</h3>
        <div className="filter-list">
          {TIMELINE_GROUPS.map((group) => {
            const color = getGroupColor(group);

            return (
              <label key={group} className="filter-chip">
                <input
                  type="checkbox"
                  checked={selectedGroups.has(group)}
                  onChange={() => onToggleGroup(group)}
                />
                <span className="color-dot" style={{ background: color.color, boxShadow: `0 0 12px ${color.color}` }} />
                <span>{group}</span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
