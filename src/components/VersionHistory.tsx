import type { PromptVersion } from '../types';
import { X, Clock } from 'lucide-react';

interface VersionHistoryProps {
    promptTitle: string;
    versions: PromptVersion[];
    onClose: () => void;
}

// ========================
// Algoritm LCS (Longest Common Subsequence) pentru diff vizual nativ
// Returnează un array de operații: 'equal' | 'added' | 'removed'
// ========================
interface DiffPart {
    text: string;
    type: 'equal' | 'added' | 'removed';
}

function computeDiff(oldText: string, newText: string): DiffPart[] {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');

    const m = oldLines.length;
    const n = newLines.length;

    // Construim matricea LCS
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (oldLines[i - 1] === newLines[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Reconstruim diff-ul urmând calea prin matricea LCS
    const parts: DiffPart[] = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
            parts.unshift({ text: oldLines[i - 1], type: 'equal' });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            parts.unshift({ text: newLines[j - 1], type: 'added' });
            j--;
        } else {
            parts.unshift({ text: oldLines[i - 1], type: 'removed' });
            i--;
        }
    }

    return parts;
}

// Sub-componentă pentru afișarea unui diff între două versiuni
function DiffView({ oldBody, newBody }: { oldBody: string; newBody: string }) {
    const parts = computeDiff(oldBody, newBody);

    return (
        <div className="diff-view">
            {parts.map((part, idx) => (
                <div key={idx} className={`diff-line diff-${part.type}`}>
                    <span className="diff-marker">
                        {part.type === 'added' ? '+' : part.type === 'removed' ? '−' : ' '}
                    </span>
                    <span className="diff-text">{part.text || '\u00A0'}</span>
                </div>
            ))}
        </div>
    );
}

// Formatează data ISO într-un string human-readable românesc
function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('ro-RO', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export function VersionHistory({ promptTitle, versions, onClose }: VersionHistoryProps) {
    // Versiunile sortate de la cea mai nouă la cea mai veche
    const sorted = [...versions].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content version-history-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={18} /> Istoricul versiunilor
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{promptTitle}</span>
                        <button className="btn-icon" onClick={onClose}><X size={18} /></button>
                    </div>
                </div>

                {sorted.length < 2 ? (
                    // Nu există suficiente versiuni pentru a afișa un diff
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <Clock size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p>Nu există versiuni anterioare salvate.</p>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            Editează și salvează acest prompt pentru a crea primul snapshot.
                        </p>
                    </div>
                ) : (
                    // Afișăm câte un diff între fiecare versiune consecutivă
                    <div className="version-list">
                        {sorted.slice(0, -1).map((version, idx) => (
                            <div key={version.savedAt} className="version-entry">
                                <div className="version-meta">
                                    <span className="version-badge">v{sorted.length - idx - 1} → v{sorted.length - idx}</span>
                                    <span className="version-date">{formatDate(version.savedAt)}</span>
                                </div>
                                <DiffView
                                    oldBody={sorted[idx + 1].body}
                                    newBody={version.body}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
