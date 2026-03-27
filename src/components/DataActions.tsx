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
        toast.success('Backup JSON exportat cu succes!');
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                if (Array.isArray(parsed) && parsed.every(p => p.title && p.body && p.id)) {
                    // Dacă vrem să suprascriem sau să facem append, acum facem simplu overwrite:
                    if (window.confirm(`Gata de a suprascrie baza de date cu ${parsed.length} prompt-uri?`)) {
                        onImport(parsed);
                        toast.success(`${parsed.length} prompt-uri importate con succes!`);
                    }
                } else {
                    toast.error('Fișierul JSON nu are formatul corect de Prompt[].');
                }
            } catch {
                toast.error('Eroare la citirea fișierului JSON.');
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    const syncToGist = async () => {
        if (!githubToken) return toast.error('Setează un GitHub Personal Access Token întâi!');
        
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
                    description: 'Tabelul de Prompt-uri din PromptLibrary',
                    public: false,
                    files: {
                        'prompt-library-db.json': {
                            content: content
                        }
                    }
                })
            });

            if (!res.ok) throw new Error('Request a eșuat ' + res.status);
            
            const data = await res.json();
            if (!gistId) setGistId(data.id); // Save exactly once
            
            toast.success('Sincronizare în Cloud (' + (gistId ? 'Update' : 'Creare') + ') reușită!');
        } catch (error) {
            console.error(error);
            toast.error('Eroare la sincronizarea pe Gist.');
        }
        setIsSyncing(false);
    };

    const syncFromGist = async () => {
        if (!githubToken || !gistId) return toast.error('Token și Gist ID sunt necesare pentru a citi din cloud!');
        
        setIsSyncing(true);
        try {
            const res = await fetch(`https://api.github.com/gists/${gistId}`, {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                }
            });

            if (!res.ok) throw new Error('Nu am găsit Gist-ul');
            
            const data = await res.json();
            const fileData = data.files['prompt-library-db.json'];
            if (!fileData) throw new Error('Gist-ul nu conține fișierul așteptat');
            
            const parsed = JSON.parse(fileData.content);
            if (Array.isArray(parsed)) {
                if (window.confirm(`Acest cont conține ${parsed.length} prompt-uri. Suprascrii local?`)) {
                    onImport(parsed);
                    toast.success(`Au fost încărcate ${parsed.length} prompt-uri din Cloud!`);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Eroare la descărcarea din Gist.');
        }
        setIsSyncing(false);
    };

    return (
        <div className="data-actions">
            <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleImportFile} 
            />
            
            <button className="btn-secondary" onClick={handleExport} title="Descarcă Backup Local">
                <Download size={16} /> <span className="hide-mobile">Export JSON</span>
            </button>
            <button className="btn-secondary" onClick={triggerImport} title="Încarcă Backup Local">
                <Upload size={16} /> <span className="hide-mobile">Import JSON</span>
            </button>
            <button className="btn-primary" onClick={() => setShowSyncModal(true)} title="Sincronizează via GitHub">
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
                                Salvează automat prompturile tale într-un Gist Secret. 
                                Creează un <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer" style={{color: 'var(--primary-color)'}}>Token Nou</a> cu permisiunea (scope) `gist`.
                            </p>
                            <div className="form-group">
                                <label>GitHub PAT Token (salvat strict local)</label>
                                <input 
                                    type="password" 
                                    value={githubToken} 
                                    onChange={e => setGithubToken(e.target.value)} 
                                    placeholder="ghp_xxxxxxxxxxxxxxx"
                                />
                            </div>
                            <div className="form-group">
                                <label>Gist ID (se completează auto. la primul Push)</label>
                                <input 
                                    type="text" 
                                    value={gistId} 
                                    onChange={e => setGistId(e.target.value)} 
                                    placeholder="ex: abcd1234efgh5678"
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
