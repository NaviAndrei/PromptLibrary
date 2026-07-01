import { useState, useRef } from 'react';
import type { Prompt } from '../types';
import { toast } from 'sonner';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Download, Upload, CloudSync, X } from 'lucide-react';

interface DataActionsProps {
    prompts: Prompt[];
    onImport: (imported: Prompt[]) => void;
}

// Minimum shape an imported record must have to be a usable prompt.
type ImportedPrompt = Partial<Prompt> & Pick<Prompt, 'id' | 'title' | 'body'>;

// Guard: payload must be an array of objects carrying at least id/title/body strings.
function isValidPromptArray(data: unknown): data is ImportedPrompt[] {
    return (
        Array.isArray(data) &&
        data.every(
            (p) =>
                !!p &&
                typeof p === 'object' &&
                typeof (p as Prompt).id === 'string' &&
                typeof (p as Prompt).title === 'string' &&
                typeof (p as Prompt).body === 'string',
        )
    );
}

// Coerce a loosely-typed imported record into a complete, render-safe Prompt.
// Guarantees tags is an array and model is a string so downstream consumers never crash.
function normalizePrompt(p: ImportedPrompt): Prompt {
    const nowIso = new Date().toISOString();
    return {
        id: p.id,
        title: p.title,
        body: p.body,
        tags: Array.isArray(p.tags) ? p.tags.filter((t): t is string => typeof t === 'string') : [],
        model: typeof p.model === 'string' && p.model ? p.model : 'Unknown',
        createdAt: typeof p.createdAt === 'string' ? p.createdAt : nowIso,
        updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : nowIso,
        workspaceId: typeof p.workspaceId === 'string' ? p.workspaceId : undefined,
    };
}

export function DataActions({ prompts, onImport }: DataActionsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showSyncModal, setShowSyncModal] = useState(false);
    
    // Gist state
    const [githubToken, setGithubToken] = useLocalStorage('github_token', '');
    const [gistId, setGistId] = useLocalStorage('github_gist_id', '');
    const [isSyncing, setIsSyncing] = useState(false);

    // Non-destructive import: merge by id (default) or replace, never a silent wipe.
    const applyImport = (incoming: Prompt[]) => {
        if (prompts.length === 0) {
            onImport(incoming);
            toast.success(`Imported ${incoming.length} prompts.`);
            return;
        }
        const merge = window.confirm(
            `You have ${prompts.length} existing prompts.\n\n` +
                `OK = Merge (imported entries overwrite matching IDs)\n` +
                `Cancel = Replace everything with the ${incoming.length} imported prompts`,
        );
        if (merge) {
            const byId = new Map(prompts.map((p) => [p.id, p]));
            incoming.forEach((p) => byId.set(p.id, p));
            const merged = Array.from(byId.values());
            onImport(merged);
            toast.success(`Merged ${incoming.length} prompts (${merged.length} total).`);
        } else {
            onImport(incoming);
            toast.success(`Replaced library with ${incoming.length} imported prompts.`);
        }
    };

    const forgetToken = () => {
        setGithubToken('');
        setGistId('');
        toast.success('GitHub token and Gist ID cleared from this browser.');
    };

    const handleExport = () => {
        const dataStr = JSON.stringify(prompts, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `prompt-library-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Backup JSON exported successfully!');
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const result = event.target?.result as string;
                const parsed = JSON.parse(result);

                if (isValidPromptArray(parsed)) {
                    applyImport(parsed.map(normalizePrompt));
                    window.dispatchEvent(new Event('storage-sync'));
                } else {
                    toast.error('Invalid backup: expected an array of prompts with id, title, and body.');
                }
            } catch (err) {
                console.error('JSON parsing error:', err);
                toast.error('Error reading or processing JSON file.');
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    const syncToGist = async () => {
        if (!githubToken) return toast.error('Set a GitHub Personal Access Token first!');
        
        setIsSyncing(true);
        try {
            const content = JSON.stringify(prompts, null, 2);
            const method = gistId ? 'PATCH' : 'POST';
            const url = gistId ? `https://api.github.com/gists/${gistId}` : 'https://api.github.com/gists';

            const res = await fetch(url, {
                method,
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    description: 'Prompts table from PromptLibrary',
                    public: false,
                    files: {
                        'prompt-library-db.json': {
                            content: content
                        }
                    }
                })
            });

            if (!res.ok) throw new Error('Request failed with status ' + res.status);
            
            const data = await res.json();
            if (!gistId) setGistId(data.id);
            
            toast.success('Cloud Sync (' + (gistId ? 'Update' : 'Create') + ') successful!');
        } catch (error) {
            console.error(error);
            toast.error('Error syncing to Gist.');
        }
        setIsSyncing(false);
    };

    const syncFromGist = async () => {
        if (!githubToken || !gistId) return toast.error('Token and Gist ID are required to pull from cloud!');
        
        setIsSyncing(true);
        try {
            const res = await fetch(`https://api.github.com/gists/${gistId}`, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            });

            if (!res.ok) throw new Error('Gist not found');
            
            const data = await res.json();
            const fileData = data.files['prompt-library-db.json'];
            if (!fileData) throw new Error('Gist does not contain the expected file');
            
            const parsed = JSON.parse(fileData.content);
            if (isValidPromptArray(parsed)) {
                applyImport(parsed.map(normalizePrompt));
                window.dispatchEvent(new Event('storage-sync'));
            } else {
                toast.error('Cloud backup is not a valid prompt array.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error downloading from Gist.');
        }
        setIsSyncing(false);
    };

    return (
        <div className="data-actions" id="data-actions">
            <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImportFile} 
            />
            
            <button className="btn-secondary" onClick={handleExport} title="Download Local Backup">
                <Download size={16} /> <span className="hide-mobile">Export JSON</span>
            </button>
            <button className="btn-secondary" onClick={triggerImport} title="Upload Local Backup">
                <Upload size={16} /> <span className="hide-mobile">Import JSON</span>
            </button>
            <button className="btn-primary" onClick={() => setShowSyncModal(true)} title="Sync via GitHub">
                <CloudSync size={16} /> <span className="hide-mobile">Cloud Sync</span>
            </button>

            {showSyncModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>GitHub Gist Sync</h3>
                            <button className="btn-icon" onClick={() => setShowSyncModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                                Automatically save your prompts to a Secret Gist. 
                                Create a <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer" style={{color: 'var(--primary-color)'}}>New Token</a> with the `gist` scope.
                            </p>
                            <div className="form-group">
                                <label>GitHub PAT Token (saved locally only)</label>
                                <input 
                                    type="password" 
                                    value={githubToken} 
                                    onChange={e => setGithubToken(e.target.value)} 
                                    placeholder="ghp_xxxxxxxxxxxxxxx"
                                />
                            </div>
                            <div className="form-group">
                                <label>Gist ID (auto-filled on first Push)</label>
                                <input 
                                    type="text" 
                                    value={gistId} 
                                    onChange={e => setGistId(e.target.value)} 
                                    placeholder="e.g., abcd1234efgh5678"
                                />
                            </div>
                            <div className="modal-actions modal-actions-split">
                                <button
                                    className="btn-secondary"
                                    onClick={forgetToken}
                                    disabled={isSyncing || (!githubToken && !gistId)}
                                    title="Clear the saved token and Gist ID from this browser"
                                >
                                    Forget Token
                                </button>
                                <div className="modal-actions-group">
                                    <button className="btn-secondary" onClick={syncFromGist} disabled={isSyncing}>
                                        Pull (Load from Cloud)
                                    </button>
                                    <button className="btn-primary" onClick={syncToGist} disabled={isSyncing}>
                                        Push (Save to Cloud)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
