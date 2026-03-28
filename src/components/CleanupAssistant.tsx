import { useMemo, useState } from 'react';
import { Sparkles, Trash2, AlertTriangle, FileText, Copy } from 'lucide-react';
import type { Prompt } from '../types';

interface CleanupAssistantProps {
    prompts: Prompt[];
    onDelete: (id: string) => void;
}

interface Suggestion {
    id: string;
    promptId: string;
    type: 'large' | 'duplicate' | 'old';
    title: string;
    reason: string;
    impact: string;
}

/**
 * CleanupAssistant analyzes the prompt library for inefficient data storage.
 * Identifies:
 * - Large prompts (> 10,000 characters)
 * - Identical prompt bodies (Duplicates)
 * - Stale prompts (Not updated for 3+ months)
 */
export function CleanupAssistant({ prompts, onDelete }: CleanupAssistantProps) {
    // Stable reference for "current" time to satisfy purity rules
    const [now] = useState(() => Date.now());

    const suggestions = useMemo(() => {
        const list: Suggestion[] = [];
        const seenBodies = new Map<string, string>(); // body -> first prompt title
        
        const THREE_MONTHS = 90 * 24 * 60 * 60 * 1000;

        prompts.forEach(p => {
            // 1. Detect Duplicates by Body
            if (seenBodies.has(p.body)) {
                list.push({
                    id: `dup-${p.id}`,
                    promptId: p.id,
                    type: 'duplicate',
                    title: p.title,
                    reason: `Duplicate content of "${seenBodies.get(p.body)}"`,
                    impact: 'Redundant storage'
                });
            } else {
                seenBodies.set(p.body, p.title);
            }

            // 2. Detect Large Prompts (> 10KB)
            if (p.body.length > 10000) {
                list.push({
                    id: `large-${p.id}`,
                    promptId: p.id,
                    type: 'large',
                    title: p.title,
                    reason: `Large prompt (${(p.body.length / 1024).toFixed(1)} KB)`,
                    impact: 'High quota impact'
                });
            }

            // 3. Detect Stale Prompts (Unused for 90 days)
            const lastUpdate = new Date(p.updatedAt).getTime();
            if (now - lastUpdate > THREE_MONTHS) {
                list.push({
                    id: `stale-${p.id}`,
                    promptId: p.id,
                    type: 'old',
                    title: p.title,
                    reason: `Stale (Last updated ${Math.floor((now - lastUpdate) / (24 * 60 * 60 * 1000))} days ago)`,
                    impact: 'Likely outdated'
                });
            }
        });

        return list;
    }, [prompts, now]);

    if (suggestions.length === 0) return null;

    return (
        <div className="cleanup-assistant" style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: 'rgba(239, 68, 68, 0.05)', 
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--danger-color)'
        }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Sparkles size={16} /> Cleanup Suggestions ({suggestions.length})
            </h3>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {suggestions.slice(0, 3).map(s => (
                    <li key={s.id} style={{ 
                        fontSize: '0.8rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        gap: '0.5rem'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{s.title}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                {s.type === 'large' && <AlertTriangle size={10} style={{ display: 'inline', marginRight: '4px' }} />}
                                {s.type === 'duplicate' && <Copy size={10} style={{ display: 'inline', marginRight: '4px' }} />}
                                {s.type === 'old' && <FileText size={10} style={{ display: 'inline', marginRight: '4px' }} />}
                                {s.reason}
                            </div>
                        </div>
                        <button 
                            className="btn-icon delete" 
                            style={{ padding: '4px', opacity: 0.7 }} 
                            onClick={() => window.confirm(`Delete "${s.title}"?`) && onDelete(s.promptId)}
                        >
                            <Trash2 size={12} />
                        </button>
                    </li>
                ))}
            </ul>
            
            {suggestions.length > 3 && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
                    + {suggestions.length - 3} more suggestions
                </div>
            )}
        </div>
    );
}
