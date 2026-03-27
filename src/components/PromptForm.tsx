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

// Formarul pentru crearea sau editarea unui prompt
export function PromptForm({ onSave, editingPrompt, existingTags, onClear, workspaces, currentWorkspaceId }: PromptFormProps) {
    // Inițializăm state-ul din prima cu valorile dorite (se va re-rula datorită prop-ului 'key' din App.tsx)
    const [title, setTitle] = useState(editingPrompt?.title || '');
    const [body, setBody] = useState(editingPrompt?.body || '');
    const [tagsInput, setTagsInput] = useState(editingPrompt ? editingPrompt.tags.join(', ') : '');
    const [model, setModel] = useState(editingPrompt?.model || 'GPT-4o');
    // Workspace-ul selectat în formular (implicit cel curent sau cel de pe prompt în editare)
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

        // Validări de bază (trim elimină spațiile goale exterioare)
        if (!title.trim() || !body.trim()) {
            alert('Titlul și corpul textului sunt necesare.');
            return;
        }

        // Parsăm tag-urile dintr-un string separat prin virgulă într-un array
        const tagsArray = tagsInput
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        // Apelăm funcția callback trimisă ca prop (din App.tsx) cu datele curate
        onSave({
            title: title.trim(),
            body: body.trim(),
            tags: tagsArray,
            model: model.trim() || 'Generic',
            workspaceId: selectedWorkspaceId || undefined,
        });

        // Curățăm formularul nativ doar dacă este o creare (nu o editare)
        if (!editingPrompt) {
            resetForm();
        }
    };

    return (
        <form className="prompt-form card" onSubmit={handleSubmit}>
            <h3>{editingPrompt ? 'Editează Prompt' : 'Adaugă Prompt Nou'}</h3>

            <div className="form-group">
                <label>Titlu:</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: Refactorizare cod Python"
                />
            </div>

            <div className="form-group row-group">
                <div className="flex-1">
                    <label>Tag-uri (separate prin virgulă):</label>
                    <input
                        type="text"
                        value={tagsInput}
                        onChange={e => setTagsInput(e.target.value)}
                        placeholder="Ex: refactor, python, clean-code"
                        list="tags-autocomplete"
                        autoComplete="off"
                    />
                    <datalist id="tags-autocomplete">
                        {(() => {
                            // Logica pentru autocomplete multi-tag folosind datalist nativ
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
                    <label>Model recomandat:</label>
                    <input
                        type="text"
                        value={model}
                        onChange={e => setModel(e.target.value)}
                        placeholder="Ex: Claude 3.5 Sonnet"
                    />
                </div>
            </div>

            {/* Selector Workspace – apare doar dacă există workspace-uri create */}
            {workspaces.length > 0 && (
                <div className="form-group">
                    <label>Workspace:</label>
                    <select
                        value={selectedWorkspaceId}
                        onChange={e => setSelectedWorkspaceId(e.target.value)}
                        className="workspace-select"
                    >
                        <option value="">— Fără workspace (general) —</option>
                        {workspaces.map(ws => (
                            <option key={ws.id} value={ws.id}>
                                {ws.icon} {ws.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="form-group">
                <label>Corpul textului (Prompt):</label>
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    rows={6}
                    placeholder="Scrie corpul prompt-ului tău aici... Poți folosi {{variabile}} pentru injectare dinamică."
                />
            </div>

            <div className="form-actions">
                <button type="submit" className="btn-primary">
                    {editingPrompt ? 'Actualizează' : 'Adaugă'}
                </button>
                <button type="button" onClick={onClear} className="btn-secondary">
                    Curăță / Anulează
                </button>
            </div>
        </form>
    );
}
