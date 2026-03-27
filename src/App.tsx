import { useState, useMemo } from 'react';
import type { Prompt } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SearchBar } from './components/SearchBar';
import { PromptForm } from './components/PromptForm';
import { PromptList } from './components/PromptList';
import { Sidebar } from './components/Sidebar';
import { DataActions } from './components/DataActions';
import { Toaster, toast } from 'sonner';
import { LayoutGrid, List } from 'lucide-react';

function App() {
    // Stocăm array-ul de prompt-uri în localStorage
    const [prompts, setPrompts] = useLocalStorage<Prompt[]>('prompts', []);
    
    // Stocăm query-ul de căutare din SearchBar
    const [searchQuery, setSearchQuery] = useState('');
    
    // Stocăm prompt-ul pe care îl edităm în mod curent
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

    // UI state
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Compute all unique tags for the sidebar
    const allTags = useMemo(() => {
        const counts: Record<string, number> = {};
        prompts.forEach(p => p.tags.forEach(t => {
            counts[t] = (counts[t] || 0) + 1;
        }));
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [prompts]);

    // Căutare și filtrare
    const filteredPrompts = useMemo(() => {
        let result = prompts;
        
        if (selectedTag) {
            result = result.filter(p => p.tags.includes(selectedTag));
        }
        
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
    }, [prompts, searchQuery, selectedTag]);

    // Handler pentru Creare sau Update complet
    const handleSavePrompt = (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        
        if (editingPrompt) {
            // Dacă doar se modifică, facem map peste tot array-ul și înlocuim valoarea unde ID-urile coincid
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
                updatedAt: now
            };
            // Adăugăm prima dată noul prompt
            setPrompts([newPrompt, ...prompts]);
            toast.success('Prompt creat cu succes!');
        }
    };

    // Funcția pentru a deschide formularul pre-completat pentru un prompt existent
    const handleEditPrompt = (prompt: Prompt) => {
        setEditingPrompt(prompt);
        // Putem să dăm "scroll to top" ca re-asigurare că utilizatorul vede formularul
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Funcția de anulare a selecției
    const handleClearForm = () => {
        setEditingPrompt(null);
    };

    // Filtrează array-ul și îl exclude pe cel șters
    const handleDeletePrompt = (id: string) => {
        setPrompts(prompts.filter(p => p.id !== id));
        if (editingPrompt?.id === id) {
            setEditingPrompt(null);
        }
        toast.info('Promptul a fost șters.');
    };

    return (
        <div className="container">
            <Toaster position="bottom-right" richColors />
            
            <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <h1>Prompt Library</h1>
                    <p>Gestionează, filtrează și sincronizează prompt-urile AI direct din browser.</p>
                </div>
                <DataActions prompts={prompts} onImport={setPrompts} />
            </header>

            <div className="app-layout">
                <Sidebar tags={allTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
                
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
                    />

                <div className="stats-bar">
                    <div className="stats">
                        Total: {prompts.length} | Găsite: {filteredPrompts.length}
                    </div>
                </div>

                <PromptList 
                    prompts={filteredPrompts} 
                    viewMode={viewMode}
                    onEdit={handleEditPrompt} 
                    onDelete={handleDeletePrompt} 
                />
                </main>
            </div>
        </div>
    );
}

export default App;
