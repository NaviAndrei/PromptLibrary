import { useMemo } from 'react';
import type { PromptVersion } from '../types';
import { X, Clock } from 'lucide-react';

interface VersionHistoryProps {
    promptTitle: string;
    versions: PromptVersion[];
    onClose: () => void;
}

// ========================
// LCS (Longest Common Subsequence) – O(m·n) native visual diff
// NOTE: Capped at MAX_LINES per side to prevent UI blocking on very long prompts.
// ========================
const MAX_LINES = 300;

interface DiffPart {
    text: string;
    type: 'equal' | 'added' | 'removed';
}

function computeDiff(oldText: string, newText: string): DiffPart[] {
    // Limit input size to cap worst-case O(m·n) memory and time usage
    const oldLines = oldText.split('\n').slice(0, MAX_LINES);
    const newLines = newText.split('\n').slice(0, MAX_LINES);

    const m = oldLines.length;
    const n = newLines.length;

    // Build LCS matrix
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

    // Reconstruct diff by backtracking through the LCS matrix
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

// Sub-component: memoizes the diff to avoid recalculation on parent re-renders
function DiffView({ oldBody, newBody }: { oldBody: string; newBody: string }) {
    // useMemo ensures computeDiff only runs when the content actually changes
    const parts = useMemo(() => computeDiff(oldBody, newBody), [oldBody, newBody]);

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

// Formats ISO date into a human-readable string (EN locale)
function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export function VersionHistory({ promptTitle, versions, onClose }: VersionHistoryProps) {
    // Sort versions from newest to oldest
    const sorted = [...versions].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    );

    return (
        <div className="modal-overlay" onClick={onClose} id="history-modal">
            <div className="modal-content version-history-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={18} /> Version History
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{promptTitle}</span>
                        <button className="btn-icon" onClick={onClose}><X size={18} /></button>
                    </div>
                </div>

                {sorted.length < 2 ? (
                    // Not enough versions to show a diff
                    <div className="empty-state" style={{ padding: '2rem' }}>
                        <Clock size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p>No previous versions saved yet.</p>
                        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                            Edit and save this prompt to create your first snapshot.
                        </p>
                    </div>
                ) : (
                    // Show diffs between consecutive versions
                    <div className="version-list">
                        {sorted.slice(0, -1).map((version, idx) => (
                            // Composite key: promptId + savedAt + idx guarantees uniqueness
                            <div key={`${version.promptId}-${version.savedAt}-${idx}`} className="version-entry">
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
