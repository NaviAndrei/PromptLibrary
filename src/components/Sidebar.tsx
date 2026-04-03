import { Tag } from 'lucide-react';

interface SidebarProps {
  tags: [string, number][]; // Array of [tagName, count]
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

// Sidebar displays only Tags Cloud - WorkspaceManager is rendered separately in App.tsx
export function Sidebar({ tags, selectedTag, onSelectTag }: SidebarProps) {
  return (
    <div className="sidebar-tags-section" id="sidebar-tags">
      <div className="sidebar-header">
        <h3>
          <Tag size={18} /> Tags Cloud
        </h3>
      </div>

      <p className="sidebar-section-note">Filter prompts by topic.</p>

      {tags.length === 0 ? (
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            padding: '0.5rem 0',
          }}
        >
          No tags available.
        </p>
      ) : (
        <ul className="tags-list">
          <li
            className={selectedTag === null ? 'active' : ''}
            onClick={() => onSelectTag(null)}
          >
            All
          </li>
          {tags.map(([tag, count]) => (
            <li
              key={tag}
              className={selectedTag === tag ? 'active' : ''}
              onClick={() => onSelectTag(tag === selectedTag ? null : tag)}
            >
              <span className="tag-name">#{tag}</span>
              <span className="tag-count">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
