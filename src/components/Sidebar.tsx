import { Tag } from 'lucide-react';

interface SidebarProps {
    tags: [string, number][]; // Array of [tagName, count]
    selectedTag: string | null;
    onSelectTag: (tag: string | null) => void;
}

// Sidebar afișează doar Tags Cloud - WorkspaceManager e rendat separat în App.tsx
export function Sidebar({ tags, selectedTag, onSelectTag }: SidebarProps) {
    return (
        <div className="sidebar-tags-section">
            <div className="sidebar-header">
                <h3><Tag size={18} /> Tags Cloud</h3>
            </div>

            {tags.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                    Niciun tag disponibil.
                </p>
            ) : (
                <ul className="tags-list">
                    <li
                        className={selectedTag === null ? 'active' : ''}
                        onClick={() => onSelectTag(null)}
                    >
                        Toate
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
