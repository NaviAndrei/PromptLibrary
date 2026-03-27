import { Tag } from 'lucide-react';

interface SidebarProps {
    tags: [string, number][]; // Array of [tagName, count]
    selectedTag: string | null;
    onSelectTag: (tag: string | null) => void;
}

export function Sidebar({ tags, selectedTag, onSelectTag }: SidebarProps) {
    if (tags.length === 0) {
        return (
            <aside className="sidebar">
                <h3>Tags</h3>
                <p className="text-muted">Niciun tag disponibil.</p>
            </aside>
        );
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h3><Tag size={18} /> Tags Cloud</h3>
            </div>
            
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
        </aside>
    );
}
