import { useState } from 'react';
import type { Prompt } from '../types';

interface PromptFormProps {
    onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
    editingPrompt: Prompt | null;
    existingTags: string[];
    onClear: () => void;
}

// Formular pentru crearea sau editarea unui prompt
export function PromptForm({ onSave, editingPrompt, existingTags, onClear }: PromptFormProps) {
    // Inițializăm state-ul din prima cu valorile dorite (se va re-rula datorită prop-ului 'key' din App.tsx)
    const [title, setTitle] = useState(editingPrompt?.title || '');
    const [body, setBody] = useState(editingPrompt?.body || '');
    const [tagsInput, setTagsInput] = useState(editingPrompt ? editingPrompt.tags.join(', ') : '');
    const [model, setModel] = useState(editingPrompt?.model || 'GPT-4o');

    const resetForm = () => {
        setTitle('');
        setBody('');
        setTagsInput('');
        setModel('GPT-4o');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validări de bază (trim elimină spațiile goale exterioare)
        if (!title.trim() || !body.trim()) {
            alert('Titlul și corpul textului sunt necesare.');
            return;
        }

        // Parsăm tag-urile dintr-un string separat prin virgulă într-un array
        // Eliminăm tag-urile goale
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
                    />
                    <datalist id="tags-autocomplete">
                        {existingTags.map(tag => (
                            <option key={tag} value={tag} />
                        ))}
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

            <div className="form-group">
                <label>Corpul textului (Prompt):</label>
                <textarea 
                    value={body} 
                    onChange={e => setBody(e.target.value)} 
                    rows={6}
                    placeholder="Scrie corpul prompt-ului tău aici..."
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
