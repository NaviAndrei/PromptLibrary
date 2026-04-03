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
import { LLM_MODELS } from './constants';

function App() {
    const [prompts, setPrompts] = useIndexedDB<Prompt>('prompts', []);
    const [workspaces, setWorkspaces] = useIndexedDB<Workspace>('workspaces', []);
    const [promptHistory, setPromptHistory] = useIndexedDB<PromptVersion>('history', [], 'prompt-history');

    const [currentWorkspaceId, setCurrentWorkspaceId] = useLocalStorage<string | null>('current-workspace', null);
    const [searchQuery, setSearchQuery] = useState('');
    const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
    const [viewMode, setViewMode] = useLocalStorage<'list' | 'grid'>('view-mode', 'grid');

    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const allTags = useMemo(() => {
        const counts: Record<string, number> = {};
        prompts.forEach(p => p.tags.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [prompts]);

    const allModels = useMemo(() => {
        const models = new Set(prompts.map(p => p.model));
        return Array.from(models).sort();
    }, [prompts]);

    const filteredPrompts = usePromptFilters(prompts, {
        searchQuery,
        selectedTag,
        currentWorkspaceId,
        selectedModel,
        dateRange
    });

    const handleSavePrompt = (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        if (editingPrompt) {
            const snapshot: PromptVersion = { promptId: editingPrompt.id, body: editingPrompt.body, savedAt: editingPrompt.updatedAt ?? now };
            setPromptHistory(prev => [snapshot, ...prev]);
            const updatedPrompts = prompts.map(p => p.id === editingPrompt.id ? { ...p, ...promptData, updatedAt: now } : p);
            setPrompts(updatedPrompts);
            setEditingPrompt(null);
            toast.success('Prompt updated successfully!');
        } else {
            const newPrompt: Prompt = { ...promptData, id: crypto.randomUUID(), createdAt: now, updatedAt: now, workspaceId: promptData.workspaceId ?? currentWorkspaceId ?? undefined };
            setPrompts([newPrompt, ...prompts]);
            toast.success('Prompt created successfully!');
        }
    };

    const handleImportPrompts = (imported: Prompt[]) => {
        setPrompts(imported);
        toast.success(`Successfully imported ${imported.length} prompts!`);
    };

    const handleEditPrompt = (prompt: Prompt) => {
        setEditingPrompt(prompt);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleClearForm = () => { setEditingPrompt(null); };

    const handleDeletePrompt = (id: string) => {
        setPrompts(prompts.filter(p => p.id !== id));
        setPromptHistory(prev => prev.filter(v => v.promptId !== id));
        if (editingPrompt?.id === id) setEditingPrompt(null);
        toast.info('Prompt deleted.');
    };

    const handleAddWorkspace = (ws: Workspace) => {
        setWorkspaces(prev => [...prev, ws]);
        toast.success(`Workspace "${ws.name}" created!`);
    };

    const handleDeleteWorkspace = (id: string) => {
        setWorkspaces(prev => prev.filter(ws => ws.id !== id));
        setPrompts(prev => prev.map(p => p.workspaceId === id ? { ...p, workspaceId: undefined } : p));
        if (currentWorkspaceId === id) setCurrentWorkspaceId(null);
        toast.info('Workspace deleted.');
    };

    const handleMovePromptToWorkspace = (promptId: string, workspaceId: string | null) => {
        const targetPrompt = prompts.find(p => p.id === promptId);
        if (!targetPrompt) return;
        const updatedPrompts = prompts.map(p => p.id === promptId ? { ...p, workspaceId: workspaceId || undefined, updatedAt: new Date().toISOString() } : p);
        setPrompts(updatedPrompts);
        const wsName = workspaceId ? workspaces.find(w => w.id === workspaceId)?.name : 'All Prompts';
        toast.success(`Prompt "${targetPrompt.title}" moved to ${wsName}`);
    };

    const getVersionsForPrompt = (promptId: string): PromptVersion[] => {
        return promptHistory.filter(v => v.promptId === promptId);
    };

    return (
        <div className="container" id="app-root">
            <Toaster position="bottom-right" richColors theme={theme === 'dark' ? 'dark' : 'light'} />
            <header className="header">
                <div style={{ flex: 1 }}>
                    <h1>Prompt Library</h1>
                    <p>Manage, filter, and synchronize your AI prompts.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className="btn-icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <DataActions prompts={prompts} onImport={handleImportPrompts} />
                </div>
            </header>

            <div className="app-layout">
                <aside className="sidebar">
                    <WorkspaceManager workspaces={workspaces} currentWorkspaceId={currentWorkspaceId} onSelect={setCurrentWorkspaceId} onAdd={handleAddWorkspace} onDelete={handleDeleteWorkspace} onMovePrompt={handleMovePromptToWorkspace}/>
                    <div className="sidebar-divider" />
                    <Sidebar tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
                    <div className="sidebar-divider" />
                    <TemplateManager onSelectTemplate={(t) => {
                        setEditingPrompt({ id: '', title: t.name, body: t.templateBody, tags: [t.category], model: LLM_MODELS[0], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} />
                    <CleanupAssistant prompts={prompts} onDelete={handleDeletePrompt} />
                    <StorageUsage promptsCount={prompts.length} />
                </aside>

                <main className="main-content">
                    {/* 🛠️ Modern Unified Control Bar */}
                    <div className="control-bar card">
                        <div className="control-row main-row">
                            <div className="search-container-wrapper">
                                <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
                            </div>
                            <div className="view-toggle-group">
                                <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View">
                                    <LayoutGrid size={18} />
                                </button>
                                <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List View">
                                    <List size={18} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="control-row filter-row">
                            <div className="filter-item">
                                <label className="label-text">Model:</label>
                                <select className="minimal-select" value={selectedModel || ''} onChange={e => setSelectedModel(e.target.value || null)}>
                                    <option value="">All Models</option>
                                    <optgroup label="Popular 2026 Models">
                                        {LLM_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </optgroup>
                                    {allModels.some(m => !LLM_MODELS.includes(m)) && (
                                        <optgroup label="Other">
                                            {allModels.filter(m => !LLM_MODELS.includes(m)).map(m => <option key={m} value={m}>{m}</option>)}
                                        </optgroup>
                                    )}
                                </select>
                            </div>
                            
                            <div className="filter-item">
                                <label className="label-text">From:</label>
                                <input type="date" className="minimal-date" onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value ? new Date(e.target.value) : null }))}/>
                            </div>

                            <div className="filter-item">
                                <label className="label-text">To:</label>
                                <input type="date" className="minimal-date" onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value ? new Date(e.target.value) : null }))}/>
                            </div>

                            {(selectedModel || dateRange.start || dateRange.end) && (
                                <button className="clear-btn-small" style={{ marginLeft: 'auto', border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px 12px', borderRadius: '20px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => { setSelectedModel(null); setDateRange({ start: null, end: null }); }}>
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    </div>

                    <PromptForm key={editingPrompt ? editingPrompt.id : 'new-prompt'} onSave={handleSavePrompt} editingPrompt={editingPrompt} existingTags={allTags.map(t => t[0])} onClear={handleClearForm} workspaces={workspaces} currentWorkspaceId={currentWorkspaceId}/>
                    
                    <div className="stats-bar">
                        <div className="stats">Total: {prompts.length} | Found: {filteredPrompts.length}</div>
                    </div>

                    <PromptList prompts={filteredPrompts} viewMode={viewMode} onEdit={handleEditPrompt} onDelete={handleDeletePrompt} getVersions={getVersionsForPrompt} workspaces={workspaces}/>
                </main>
            </div>
        </div>
    );
}

export default App;
