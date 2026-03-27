import { useState } from 'react';
import type { Workspace } from '../types';
import { FolderOpen, Plus, Trash2, Check } from 'lucide-react';

// Culori predefinite pentru workspace-uri noi
const PRESET_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
];

// Emoji-uri predefinite pentru workspace-uri
const PRESET_ICONS = ['💼', '🚀', '🎨', '📚', '🔧', '🌟', '🎯', '🧠'];

interface WorkspaceManagerProps {
    workspaces: Workspace[];
    currentWorkspaceId: string | null;
    onSelect: (id: string | null) => void;
    onAdd: (ws: Workspace) => void;
    onDelete: (id: string) => void;
}

export function WorkspaceManager({
    workspaces,
    currentWorkspaceId,
    onSelect,
    onAdd,
    onDelete,
}: WorkspaceManagerProps) {
    // State-ul formularului pentru creare workspace nou
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState('💼');
    const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

    // Handler pentru confirmare creare workspace
    const handleAdd = () => {
        if (!newName.trim()) return;
        const ws: Workspace = {
            id: crypto.randomUUID(),
            name: newName.trim(),
            icon: newIcon,
            color: newColor,
            createdAt: new Date().toISOString(),
        };
        onAdd(ws);
        // Resetăm formularul
        setNewName('');
        setNewIcon('💼');
        setNewColor(PRESET_COLORS[0]);
        setIsAdding(false);
    };

    return (
        <div className="workspace-manager">
            <div className="workspace-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.95rem' }}>
                    <FolderOpen size={16} /> Workspace-uri
                </span>
                <button
                    className="btn-icon"
                    onClick={() => setIsAdding(!isAdding)}
                    title="Adaugă workspace nou"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Formularul de creare workspace */}
            {isAdding && (
                <div className="workspace-add-form">
                    <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Numele workspace-ului"
                        className="workspace-name-input"
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        autoFocus
                    />
                    {/* Selector emoji */}
                    <div className="workspace-icons-grid">
                        {PRESET_ICONS.map(icon => (
                            <button
                                key={icon}
                                onClick={() => setNewIcon(icon)}
                                className={`workspace-icon-btn ${newIcon === icon ? 'selected' : ''}`}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                    {/* Selector culoare */}
                    <div className="workspace-colors-grid">
                        {PRESET_COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => setNewColor(color)}
                                className="workspace-color-btn"
                                style={{ background: color, outline: newColor === color ? `2px solid ${color}` : 'none', outlineOffset: '2px' }}
                            />
                        ))}
                    </div>
                    <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleAdd}>
                        <Check size={14} /> Creează
                    </button>
                </div>
            )}

            {/* Lista workspace-urilor existente */}
            <ul className="workspace-list">
                {/* Opțiunea "Toate" */}
                <li
                    className={`workspace-item ${currentWorkspaceId === null ? 'active' : ''}`}
                    onClick={() => onSelect(null)}
                >
                    <span>🗂️</span>
                    <span className="workspace-item-name">Toate</span>
                </li>

                {workspaces.map(ws => (
                    <li
                        key={ws.id}
                        className={`workspace-item ${currentWorkspaceId === ws.id ? 'active' : ''}`}
                        onClick={() => onSelect(ws.id)}
                        style={{ borderLeft: `3px solid ${ws.color}` }}
                    >
                        <span>{ws.icon}</span>
                        <span className="workspace-item-name">{ws.name}</span>
                        <button
                            className="btn-icon workspace-delete-btn"
                            onClick={e => { e.stopPropagation(); onDelete(ws.id); }}
                            title="Șterge workspace"
                        >
                            <Trash2 size={12} />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
