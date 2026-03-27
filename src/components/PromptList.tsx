import { useState } from 'react';
import type { Prompt } from '../types';

interface PromptListProps {
    prompts: Prompt[];
    onEdit: (prompt: Prompt) => void;
    onDelete: (id: string) => void;
}

// Renderizează lista de prompt-uri și acțiunile asociate fiecăruia
export function PromptList({ prompts, onEdit, onDelete }: PromptListProps) {
    // Păstrăm local un array cu ID-urile prompturilor extinse (pentru afișarea conținutului complet)
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Funcție pentru a copia în clipboard body-ul
    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            alert('Promptul a fost copiat în clipboard!');
        } catch (err) {
            console.error('Eroare la copiere:', err);
            alert('Copierea a eșuat.');
        }
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    if (prompts.length === 0) {
        return (
            <div className="empty-state">
                <p>Nu s-a găsit niciun prompt valid. Adaugă unul nou sau modifică filtrele!</p>
            </div>
        );
    }

    return (
        <div className="prompt-list">
            {prompts.map(prompt => {
                const isExpanded = expandedIds.has(prompt.id);
                
                return (
                    <div key={prompt.id} className="prompt-card card">
                        <div className="prompt-header">
                            <div>
                                <h4>{prompt.title}</h4>
                                <span className="model-badge">{prompt.model}</span>
                            </div>
                            <div className="prompt-actions">
                                <button onClick={() => onEdit(prompt)} className="btn-icon">✏️ Edit</button>
                                <button onClick={() => handleCopy(prompt.body)} className="btn-icon">📋 Copy</button>
                                {/* Folosim window.confirm pentru confirmarea ștergerii, o metodă integrată nativ */}
                                <button 
                                    onClick={() => window.confirm('Ești sigur că vrei să ștergi?') && onDelete(prompt.id)} 
                                    className="btn-icon delete"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                        
                        <div className="prompt-tags">
                            {prompt.tags.map(tag => (
                                <span key={tag} className="tag-badge">#{tag}</span>
                            ))}
                        </div>

                        <div className="prompt-body-preview" onClick={() => toggleExpand(prompt.id)}>
                            {/* Afișăm complet dacă e expandat, altfel tăiem la 100 de caractere */}
                            <pre className={isExpanded ? 'expanded' : 'collapsed'}>
                                {isExpanded ? prompt.body : (prompt.body.length > 100 ? prompt.body.substring(0, 100) + '...' : prompt.body)}
                            </pre>
                            <div className="expand-hint">
                                {prompt.body.length > 100 && (isExpanded ? 'Apasă pentru a restrânge' : 'Apasă pentru a extinde')}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
