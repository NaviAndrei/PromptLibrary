import { useState, useRef } from 'react';
import type { Prompt } from '../types';
import { toast } from 'sonner';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Download, Upload, CloudSync, X } from 'lucide-react';

interface DataActionsProps {
    prompts: Prompt[];
    onImport: (imported: Prompt[]) => void;
}

export function DataActions({ prompts, onImport }: DataActionsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showSyncModal, setShowSyncModal] = useState(false);
    
    // Gist state
    const [githubToken, setGithubToken] = useLocalStorage('github_token', '');
    const [gistId, setGistId] = useLocalStorage('github_gist_id', '');
    const [isSyncing, setIsSyncing] = useState(false);

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
                
                if (Array.isArray(parsed) && parsed.every(p => p.title && p.body && p.id)) {
                    onImport(parsed);
                    // Dispatch custom event for storage sync
                    window.dispatchEvent(new Event('storage-sync'));
                    toast.success(`${parsed.length} prompts imported successfully!`);
                } else {
                    toast.error('Invalid JSON structure. Needs to be Prompt[].');
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
            if (Array.isArray(parsed)) {
                onImport(parsed);
                window.dispatchEvent(new Event('storage-sync'));
                toast.success(`Loaded ${parsed.length} prompts from Cloud!`);
            } else {
                console.warn('Gist data is not an array:', parsed);
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
                            <div className="modal-actions" style={{justifyContent: 'flex-end'}}>
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
            )}
        </div>
    );
}
