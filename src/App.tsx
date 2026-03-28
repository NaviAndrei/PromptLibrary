import { useState, useMemo, useEffect } from 'react';
import type { Prompt, Workspace, PromptVersion } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SearchBar } from './components/SearchBar';
import { PromptForm } from './components/PromptForm';
import { PromptList } from './components/PromptList';
import { Sidebar } from './components/Sidebar';
import { DataActions } from './components/DataActions';
import { WorkspaceManager } from './components/WorkspaceManager';
import { TemplateManager } from './components/TemplateManager';
import { StorageUsage } from './components/StorageUsage';
import { CleanupAssistant } from './components/CleanupAssistant';
import { Toaster, toast } from 'sonner';
import { LayoutGrid, List, Moon, Sun } from 'lucide-react';
import { usePromptFilters } from './hooks/usePromptFilters';
import { useIndexedDB } from './hooks/useIndexedDB';

function App() {
    // Large Datasets use IndexedDB for unlimited capacity
    const [prompts, setPrompts] = useIndexedDB<Prompt>('prompts', []);
    const [workspaces, setWorkspaces] = useIndexedDB<Workspace>('workspaces', []);
    const [promptHistory, setPromptHistory] = useIndexedDB<PromptVersion>('history', []);

    // Lightweight UI settings continue to use localStorage for instant initialization
    const [currentWorkspaceId, setCurrentWorkspaceId] = useLocalStorage<string | null>('current-workspace', null);
    const [searchQuery, setSearchQuery] = useState('');
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
    const [viewMode, setViewMode] = useLocalStorage<'list' | 'grid'>('view-mode', 'grid');

    // UI State for editing and filtering (ephemeral)
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Advanced search filters
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });

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

    // Compute all unique AI models for filtering
    const allModels = useMemo(() => {
        const models = new Set(prompts.map(p => p.model));
        return Array.from(models).sort();
    }, [prompts]);

    // Encapsulated data filtering logic using custom hook
    const filteredPrompts = usePromptFilters(prompts, {
        searchQuery,
        selectedTag,
        currentWorkspaceId,
        selectedModel,
        dateRange
    });

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

    // Move a prompt from one workspace to another (Drag-and-Drop)
    const handleMovePromptToWorkspace = (promptId: string, workspaceId: string | null) => {
        const targetPrompt = prompts.find(p => p.id === promptId);
        if (!targetPrompt) return;

        // Do nothing if the prompt is already in the target workspace
        if (targetPrompt.workspaceId === (workspaceId || undefined)) return;

        const updatedPrompts = prompts.map(p => 
            p.id === promptId ? { ...p, workspaceId: workspaceId || undefined, updatedAt: new Date().toISOString() } : p
        );
        
        setPrompts(updatedPrompts);
        
        const wsName = workspaceId ? workspaces.find(w => w.id === workspaceId)?.name : 'All Prompts';
        toast.success(`Prompt "${targetPrompt.title}" moved to ${wsName}`);
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
                        onMovePrompt={handleMovePromptToWorkspace}
                    />
                    <div className="sidebar-divider" />
                    <Sidebar tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
                    <div className="sidebar-divider" />
                    <TemplateManager 
                        onSelectTemplate={(template) => {
                            setEditingPrompt({
                                id: '', // Mark as new for handleSavePrompt
                                title: template.name,
                                body: template.templateBody,
                                tags: [template.category],
                                model: 'Choose AI Model', // Default placeholder
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} 
                    />
                    <CleanupAssistant prompts={prompts} onDelete={handleDeletePrompt} />
                    <StorageUsage promptsCount={prompts.length} />
                </aside>

                <main className="main-content">
                    <div className="search-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
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

                    {/* Advanced Filter Bar */}
                    <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        <select 
                            className="workspace-select" 
                            style={{ flex: 1, minWidth: '150px' }}
                            value={selectedModel || ''} 
                            onChange={e => setSelectedModel(e.target.value || null)}
                        >
                            <option value="">All Models</option>
                            {allModels.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 2 }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>From:</label>
                            <input 
                                type="date" 
                                className="workspace-name-input" 
                                style={{ flex: 1 }}
                                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value ? new Date(e.target.value) : null }))}
                            />
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>To:</label>
                            <input 
                                type="date" 
                                className="workspace-name-input" 
                                style={{ flex: 1 }}
                                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value ? new Date(e.target.value) : null }))}
                            />
                        </div>

                        {(selectedModel || dateRange.start || dateRange.end) && (
                            <button 
                                className="btn-secondary" 
                                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                                onClick={() => {
                                    setSelectedModel(null);
                                    setDateRange({ start: null, end: null });
                                }}
                            >
                                Clear Filters
                            </button>
                        )}
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
