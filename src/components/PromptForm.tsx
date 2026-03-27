import { useState } from 'react';
import type { Prompt, Workspace } from '../types';

interface PromptFormProps {
    onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
    editingPrompt: Prompt | null;
    existingTags: string[];
    onClear: () => void;
    workspaces: Workspace[];
    currentWorkspaceId: string | null;
}

// Form for creating or editing a prompt
export function PromptForm({ onSave, editingPrompt, existingTags, onClear, workspaces, currentWorkspaceId }: PromptFormProps) {
    // Initial state set based on editingPrompt or defaults
    const [title, setTitle] = useState(editingPrompt?.title || '');
    const [body, setBody] = useState(editingPrompt?.body || '');
    const [tagsInput, setTagsInput] = useState(editingPrompt ? editingPrompt.tags.join(', ') : '');
    const [model, setModel] = useState(editingPrompt?.model || 'GPT-4o');
    // Selected workspace in the form (defaults to current or prompt's workspace)
    const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(
        editingPrompt?.workspaceId ?? currentWorkspaceId ?? ''
    );

    const resetForm = () => {
        setTitle('');
        setBody('');
        setTagsInput('');
        setModel('GPT-4o');
        setSelectedWorkspaceId(currentWorkspaceId ?? '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!title.trim() || !body.trim()) {
            alert('Title and prompt body are required.');
            return;
        }

        // Parse tags from comma-separated string to array
        const tagsArray = tagsInput
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        // Call callback from App.tsx with clean data
        onSave({
            title: title.trim(),
            body: body.trim(),
            tags: tagsArray,
            model: model.trim() || 'Generic',
            workspaceId: selectedWorkspaceId || undefined,
        });

        // Clear form only on creation (not on edit)
        if (!editingPrompt) {
            resetForm();
        }
    };

    return (
        <form className="prompt-form card" onSubmit={handleSubmit} id="prompt-form">
            <h3>{editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}</h3>

            <div className="form-group">
                <label>Title:</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g., Python Code Refactor"
                />
            </div>

            <div className="form-group row-group">
                <div className="flex-1">
                    <label>Tags (comma separated):</label>
                    <input
                        type="text"
                        value={tagsInput}
                        onChange={e => setTagsInput(e.target.value)}
                        placeholder="e.g., refactor, python, clean-code"
                        list="tags-autocomplete"
                        autoComplete="off"
                    />
                    <datalist id="tags-autocomplete">
                        {(() => {
                            // Multi-tag autocomplete logic using native datalist
                            const parts = tagsInput.split(',');
                            const lastPart = parts[parts.length - 1].trim();
                            const prefix = parts.length > 1
                                ? parts.slice(0, -1).join(', ') + ', '
                                : '';

                            return existingTags
                                .filter(tag =>
                                    tag.toLowerCase().includes(lastPart.toLowerCase()) &&
                                    !parts.map(p => p.trim().toLowerCase()).includes(tag.toLowerCase())
                                )
                                .slice(0, 10)
                                .map(tag => (
                                    <option key={tag} value={`${prefix}${tag}`} />
                                ));
                        })()}
                    </datalist>
                </div>
                <div className="flex-1">
                    <label>Recommended Model:</label>
                    <input
                        type="text"
                        value={model}
                        onChange={e => setModel(e.target.value)}
                        placeholder="e.g., Claude 3.5 Sonnet"
                    />
                </div>
            </div>

            {/* Workspace Selector - visible if workspaces exist */}
            {workspaces.length > 0 && (
                <div className="form-group">
                    <label>Workspace:</label>
                    <select
                        value={selectedWorkspaceId}
                        onChange={e => setSelectedWorkspaceId(e.target.value)}
                        className="workspace-select"
                    >
                        <option value="">— No workspace (General) —</option>
                        {workspaces.map(ws => (
                            <option key={ws.id} value={ws.id}>
                                {ws.icon} {ws.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="form-group">
                <label>Prompt Body:</label>
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    rows={6}
                    placeholder="Write your prompt body here... Use {{variable}} for dynamic injection."
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="btn-primary">
                    {editingPrompt ? 'Update Prompt' : 'Add Prompt'}
                </button>
                <button type="button" onClick={onClear} className="btn-secondary">
                    Clear / Cancel
                </button>
            </div>
        </form>
    );
}
