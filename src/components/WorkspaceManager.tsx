import { useState } from 'react';
import type { Workspace } from '../types';
import { FolderOpen, Plus, Trash2, Check, X } from 'lucide-react';

// Preset colors for new workspaces
const PRESET_COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
];

// Preset emojis for workspaces
const PRESET_ICONS = ['💼', '🚀', '🎨', '📚', '🔧', '🌟', '🎯', '🧠'];

interface WorkspaceManagerProps {
    workspaces: Workspace[];
    currentWorkspaceId: string | null;
    onSelect: (id: string | null) => void;
    onAdd: (ws: Workspace) => void;
    onDelete: (id: string) => void;
    // Callback to move a prompt from one workspace to another
    onMovePrompt?: (promptId: string, workspaceId: string | null) => void;
}

export function WorkspaceManager({
    workspaces,
    currentWorkspaceId,
    onSelect,
    onAdd,
    onDelete,
    onMovePrompt,
}: WorkspaceManagerProps) {
    // Form state for creating new workspace
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState('💼');
    const [newColor, setNewColor] = useState(PRESET_COLORS[0]);

    // Handler for confirming workspace creation
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
        // Reset form
        setNewName('');
        setNewIcon('💼');
        setNewColor(PRESET_COLORS[0]);
        setIsAdding(false);
    };

    return (
        <div className="workspace-manager">
            <div className="workspace-header">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.95rem' }}>
                    <FolderOpen size={16} /> Workspaces
                </span>
                <button
                    className="btn-icon"
                    onClick={() => setIsAdding(!isAdding)}
                    title={isAdding ? 'Cancel' : 'Add new workspace'}
                >
                    {isAdding ? <X size={16} /> : <Plus size={16} />}
                </button>
            </div>

            {/* Workspace creation form */}
            {isAdding && (
                <div className="workspace-add-form" id="workspace-add-form">
                    <input
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Workspace name"
                        className="workspace-name-input"
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                        autoFocus
                    />
                    {/* Emoji selector */}
                    <div className="workspace-icons-grid">
                        {PRESET_ICONS.map(icon => (
                            <button
                                type="button"
                                key={icon}
                                onClick={() => setNewIcon(icon)}
                                className={`workspace-icon-btn ${newIcon === icon ? 'selected' : ''}`}
                                aria-label={`Select icon ${icon}`}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                    {/* Color selector */}
                    <div className="workspace-colors-grid">
                        {PRESET_COLORS.map(color => (
                            <button
                                type="button"
                                key={color}
                                onClick={() => setNewColor(color)}
                                className="workspace-color-btn"
                                style={{ background: color, outline: newColor === color ? `2px solid ${color}` : 'none', outlineOffset: '2px' }}
                                aria-label={`Select color ${color}`}
                            />
                        ))}
                    </div>
                    <button className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={handleAdd}>
                        <Check size={14} /> Create
                    </button>
                </div>
            )}

            {/* List of existing workspaces (Drop Targets) */}
            <ul className="workspace-list" id="workspace-list">
                {/* "All" option */}
                <li
                    className={`workspace-item ${currentWorkspaceId === null ? 'active' : ''}`}
                    onClick={() => onSelect(null)}
                    onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).classList.add('drag-over'); }}
                    onDragLeave={e => (e.currentTarget as HTMLElement).classList.remove('drag-over')}
                    onDrop={e => {
                        e.preventDefault();
                        const target = e.currentTarget as HTMLElement;
                        target.classList.remove('drag-over');
                        const promptId = e.dataTransfer.getData('promptId');
                        if (promptId && onMovePrompt) onMovePrompt(promptId, null);
                    }}
                >
                    <span>🗂️</span>
                    <span className="workspace-item-name">All Prompts</span>
                </li>

                {workspaces.map(ws => (
                    <li
                        key={ws.id}
                        className={`workspace-item ${currentWorkspaceId === ws.id ? 'active' : ''}`}
                        onClick={() => onSelect(ws.id)}
                        onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).classList.add('drag-over'); }}
                        onDragLeave={e => (e.currentTarget as HTMLElement).classList.remove('drag-over')}
                        onDrop={e => {
                            e.preventDefault();
                            const target = e.currentTarget as HTMLElement;
                            target.classList.remove('drag-over');
                            const promptId = e.dataTransfer.getData('promptId');
                            if (promptId && onMovePrompt) onMovePrompt(promptId, ws.id);
                        }}
                        style={{ borderLeft: `3px solid ${ws.color}` }}
                    >
                        <span>{ws.icon}</span>
                        <span className="workspace-item-name">{ws.name}</span>
                        <button
                            className="btn-icon workspace-delete-btn"
                            onClick={e => { 
                                e.stopPropagation(); 
                                if (window.confirm(`Delete workspace "${ws.name}"?`)) {
                                    onDelete(ws.id);
                                }
                            }}
                            title="Delete workspace"
                        >
                            <Trash2 size={12} />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
