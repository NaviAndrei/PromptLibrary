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
    // Store prompts in localStorage
    const [prompts, setPrompts] = useLocalStorage<Prompt[]>('prompts', []);

    // Store workspaces in localStorage
    const [workspaces, setWorkspaces] = useLocalStorage<Workspace[]>('workspaces', []);

    // Store version history in localStorage (indexed by promptId)
    const [promptHistory, setPromptHistory] = useLocalStorage<PromptVersion[]>('prompt-history', []);

    // Current selected workspace (null = all prompts)
    const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);

    // Store search query from SearchBar
    const [searchQuery, setSearchQuery] = useState('');

    // Store prompt currently being edited
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

    // UI state
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

    // Apply global theme to the HTML tag
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

    // Search and filtering (including workspace)
    const filteredPrompts = useMemo(() => {
        let result = prompts;

        // Filter by selected workspace
        if (currentWorkspaceId) {
            result = result.filter(p => p.workspaceId === currentWorkspaceId);
        }

        // Filter by selected tag
        if (selectedTag) {
            result = result.filter(p => p.tags.includes(selectedTag));
        }

        // Filter by search text
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

    // Handler for Create or Update save
    const handleSavePrompt = (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();

        if (editingPrompt) {
            // Capture a snapshot of the OLD version - use its own updatedAt timestamp
            // This ensures stable sort order and avoids duplicate keys in history
            const snapshot: PromptVersion = {
                promptId: editingPrompt.id,
                body: editingPrompt.body,
                savedAt: editingPrompt.updatedAt ?? now,
            };
            setPromptHistory(prev => [snapshot, ...prev]);

            // Update existing prompt
            const updatedPrompts = prompts.map(p =>
                p.id === editingPrompt.id
                    ? { ...p, ...promptData, updatedAt: now }
                    : p
            );
            setPrompts(updatedPrompts);
            setEditingPrompt(null);
            toast.success('Prompt updated successfully!');
        } else {
            // Create new prompt (priority: form selection > global filter)
            const newPrompt: Prompt = {
                ...promptData,
                id: crypto.randomUUID(),
                createdAt: now,
                updatedAt: now,
                workspaceId: promptData.workspaceId ?? currentWorkspaceId ?? undefined,
            };
            setPrompts([newPrompt, ...prompts]);
            toast.success('Prompt created successfully!');
        }
    };

    // Handler to process JSON import
    const handleImportPrompts = (imported: Prompt[]) => {
        setPrompts(imported);
        window.localStorage.setItem('prompts', JSON.stringify(imported));
        toast.success(`Successfully imported ${imported.length} prompts!`);
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
        // Clear delete prompt version history
        setPromptHistory(prev => prev.filter(v => v.promptId !== id));
        if (editingPrompt?.id === id) {
            setEditingPrompt(null);
        }
        toast.info('Prompt deleted.');
    };

    // Workspace handlers
    const handleAddWorkspace = (ws: Workspace) => {
        setWorkspaces(prev => [...prev, ws]);
        toast.success(`Workspace "${ws.name}" created!`);
    };

    const handleDeleteWorkspace = (id: string) => {
        setWorkspaces(prev => prev.filter(ws => ws.id !== id));
        // Detach deleted workspace from all associated prompts for consistency
        setPrompts(prev => prev.map(p =>
            p.workspaceId === id ? { ...p, workspaceId: undefined } : p
        ));
        // Reset to "All" if current workspace is deleted
        if (currentWorkspaceId === id) setCurrentWorkspaceId(null);
        toast.info('Workspace deleted.');
    };

    // Get versions for a specific prompt
    const getVersionsForPrompt = (promptId: string): PromptVersion[] => {
        return promptHistory.filter(v => v.promptId === promptId);
    };

    return (
        <div className="container" id="app-root">
            <Toaster position="bottom-right" richColors theme={theme === 'dark' ? 'dark' : 'light'} />

            <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h1>Prompt Library</h1>
                    <p>Manage, filter, and synchronize your AI prompts directly from your browser.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        className="btn-icon"
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                    >
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <DataActions prompts={prompts} onImport={handleImportPrompts} />
                </div>
            </header>

            <div className="app-layout">
                <aside className="sidebar">
                    {/* Workspace Manager above Tags Cloud */}
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
                            Total: {prompts.length} | Found: {filteredPrompts.length}
                            {(() => {
                                // Optimized lookup: find the workspace once per render
                                const currentWs = currentWorkspaceId ? workspaces.find(w => w.id === currentWorkspaceId) : null;
                                if (!currentWs) return null;
                                return (
                                    <span className="workspace-filter-badge" style={{
                                        marginLeft: '0.5rem',
                                        background: currentWs.color,
                                        color: 'white',
                                        padding: '0.1rem 0.5rem',
                                        borderRadius: '99px',
                                        fontSize: '0.8rem',
                                    }}>
                                        {currentWs.icon} {currentWs.name}
                                    </span>
                                );
                            })()}
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
