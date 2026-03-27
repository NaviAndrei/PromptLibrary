import { useState, useMemo, useEffect } from 'react';
import type { Prompt, Workspace, PromptVersion } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SearchBar } from './components/SearchBar';
import { PromptForm } from './components/PromptForm';
import { PromptList } from './components/PromptList';
import { Sidebar } from './components/Sidebar';
import { DataActions } from './components/DataActions';
import { WorkspaceManager } from './components/WorkspaceManager';
import { Toaster, toast } from 'sonner';
import { LayoutGrid, List, Moon, Sun } from 'lucide-react';

function App() {
    // Stocăm array-ul de prompt-uri în localStorage
    const [prompts, setPrompts] = useLocalStorage<Prompt[]>('prompts', []);

    // Stocăm workspace-urile în localStorage
    const [workspaces, setWorkspaces] = useLocalStorage<Workspace[]>('workspaces', []);

    // Stocăm istoricul versiunilor în localStorage (indexat după promptId)
    const [promptHistory, setPromptHistory] = useLocalStorage<PromptVersion[]>('prompt-history', []);

    // Workspace-ul selectat curent (null = toate prompt-urile)
    const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);

    // Stocăm query-ul de căutare din SearchBar
    const [searchQuery, setSearchQuery] = useState('');

    // Stocăm prompt-ul pe care îl edităm în mod curent
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

    // UI state
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

    // Aplică tema globală la nivel de HTML tag
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Compute all unique tags for the sidebar
    const allTags = useMemo(() => {
        const counts: Record<string, number> = {};
        prompts.forEach(p => p.tags.forEach(t => {
            counts[t] = (counts[t] || 0) + 1;
        }));
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [prompts]);

    // Căutare și filtrare (inclusiv după workspace)
    const filteredPrompts = useMemo(() => {
        let result = prompts;

        // Filtrare după workspace selectat
        if (currentWorkspaceId) {
            result = result.filter(p => p.workspaceId === currentWorkspaceId);
        }

        // Filtrare după tag selectat
        if (selectedTag) {
            result = result.filter(p => p.tags.includes(selectedTag));
        }

        // Filtrare după textul de căutare
        if (searchQuery.trim()) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p => {
                const matchesTitle = p.title.toLowerCase().includes(lowerQuery);
                const matchesBody = p.body.toLowerCase().includes(lowerQuery);
                const matchesTags = p.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
                return matchesTitle || matchesBody || matchesTags;
            });
        }

        return result;
    }, [prompts, searchQuery, selectedTag, currentWorkspaceId]);

    // Handler pentru Creare sau Update complet
    const handleSavePrompt = (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();

        if (editingPrompt) {
            // Capturăm un snapshot al versiunii curente ÎNAINTE de actualizare
            const snapshot: PromptVersion = {
                promptId: editingPrompt.id,
                body: editingPrompt.body,
                savedAt: now,
            };
            setPromptHistory(prev => [snapshot, ...prev]);

            // Actualizăm prompt-ul
            const updatedPrompts = prompts.map(p =>
                p.id === editingPrompt.id
                    ? { ...p, ...promptData, updatedAt: now }
                    : p
            );
            setPrompts(updatedPrompts);
            setEditingPrompt(null);
            toast.success('Promptul a fost actualizat cu succes!');
        } else {
            // Dacă e nou creat, generăm UUID valid de browser (nativ)
            const newPrompt: Prompt = {
                ...promptData,
                id: crypto.randomUUID(),
                createdAt: now,
                updatedAt: now,
                workspaceId: currentWorkspaceId ?? undefined,
            };
            setPrompts([newPrompt, ...prompts]);
            toast.success('Prompt creat cu succes!');
        }
    };

    // Funcția pentru a procesa importul JSON
    const handleImportPrompts = (imported: Prompt[]) => {
        setPrompts(imported);
        window.localStorage.setItem('prompts', JSON.stringify(imported));
        toast.success(`Am importat ${imported.length} prompt-uri!`);
    };

    const handleEditPrompt = (prompt: Prompt) => {
        setEditingPrompt(prompt);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClearForm = () => {
        setEditingPrompt(null);
    };

    const handleDeletePrompt = (id: string) => {
        setPrompts(prompts.filter(p => p.id !== id));
        // Ștergem și istoricul versiunilor pentru acest prompt
        setPromptHistory(prev => prev.filter(v => v.promptId !== id));
        if (editingPrompt?.id === id) {
            setEditingPrompt(null);
        }
        toast.info('Promptul a fost șters.');
    };

    // Handlers pentru workspace-uri
    const handleAddWorkspace = (ws: Workspace) => {
        setWorkspaces(prev => [...prev, ws]);
        toast.success(`Workspace "${ws.name}" creat!`);
    };

    const handleDeleteWorkspace = (id: string) => {
        setWorkspaces(prev => prev.filter(ws => ws.id !== id));
        // Dacă workspace-ul șters era selectat, revenim la "Toate"
        if (currentWorkspaceId === id) setCurrentWorkspaceId(null);
        toast.info('Workspace șters.');
    };

    // Returnează versiunile pentru un anumit prompt
    const getVersionsForPrompt = (promptId: string): PromptVersion[] => {
        return promptHistory.filter(v => v.promptId === promptId);
    };

    return (
        <div className="container">
            <Toaster position="bottom-right" richColors theme={theme === 'dark' ? 'dark' : 'light'} />

            <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h1>Prompt Library</h1>
                    <p>Gestionează, filtrează și sincronizează prompt-urile AI direct din browser.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        className="btn-icon" 

                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        title={theme === 'light' ? 'Treci pe Dark Mode' : 'Treci pe Light Mode'}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <DataActions prompts={prompts} onImport={handleImportPrompts} />
                </div>
            </header>

            <div className="app-layout">
                <aside className="sidebar">
                    {/* Workspace Manager deasupra Tags Cloud */}
                    <WorkspaceManager
                        workspaces={workspaces}
                        currentWorkspaceId={currentWorkspaceId}
                        onSelect={setCurrentWorkspaceId}
                        onAdd={handleAddWorkspace}
                        onDelete={handleDeleteWorkspace}
                    />
                    <div className="sidebar-divider" />
                    <Sidebar tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
                </aside>

                <main className="main-content">
                    <div className="search-row" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <SearchBar
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                            />
                        </div>
                        <div className="view-toggle">
                            <button
                                className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>

                    <PromptForm
                        key={editingPrompt ? editingPrompt.id : 'new-prompt'}
                        onSave={handleSavePrompt}
                        editingPrompt={editingPrompt}
                        existingTags={allTags.map(t => t[0])}
                        onClear={handleClearForm}
                        workspaces={workspaces}
                        currentWorkspaceId={currentWorkspaceId}
                    />

                    <div className="stats-bar">
                        <div className="stats">
                            Total: {prompts.length} | Găsite: {filteredPrompts.length}
                            {currentWorkspaceId && workspaces.find(w => w.id === currentWorkspaceId) && (
                                <span className="workspace-filter-badge" style={{
                                    marginLeft: '0.5rem',
                                    background: workspaces.find(w => w.id === currentWorkspaceId)?.color,
                                    color: 'white',
                                    padding: '0.1rem 0.5rem',
                                    borderRadius: '99px',
                                    fontSize: '0.8rem',
                                }}>
                                    {workspaces.find(w => w.id === currentWorkspaceId)?.icon} {workspaces.find(w => w.id === currentWorkspaceId)?.name}
                                </span>
                            )}
                        </div>
                    </div>

                    <PromptList
                        prompts={filteredPrompts}
                        viewMode={viewMode}
                        onEdit={handleEditPrompt}
                        onDelete={handleDeletePrompt}
                        getVersions={getVersionsForPrompt}
                        workspaces={workspaces}
                    />
                </main>
            </div>
        </div>
    );
}

export default App;
