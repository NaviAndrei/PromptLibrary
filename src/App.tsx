import { useState, useMemo } from 'react';
import type { Prompt } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SearchBar } from './components/SearchBar';
import { PromptForm } from './components/PromptForm';
import { PromptList } from './components/PromptList';

function App() {
    // Stocăm array-ul de prompt-uri în localStorage
    const [prompts, setPrompts] = useLocalStorage<Prompt[]>('prompts', []);
    
    // Stocăm query-ul de căutare din SearchBar
    const [searchQuery, setSearchQuery] = useState('');
    
    // Stocăm prompt-ul pe care îl edităm în mod curent
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

    // Căutare (Memorizăm rezultatele ca să nu refacem căutarea inutil de multe ori dacă nu s-au schimbat datele/query-ul)
    const filteredPrompts = useMemo(() => {
        if (!searchQuery.trim()) return prompts;
        
        const lowerQuery = searchQuery.toLowerCase();
        
        return prompts.filter(p => {
            const matchesTitle = p.title.toLowerCase().includes(lowerQuery);
            const matchesBody = p.body.toLowerCase().includes(lowerQuery);
            const matchesTags = p.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
            
            return matchesTitle || matchesBody || matchesTags;
        });
    }, [prompts, searchQuery]);

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
    };

    return (
        <div className="container">
            <header className="header">
                <h1>Prompt Library</h1>
                <p>Gestionează, filtrează și reutilizează prompt-urile AI direct din browser.</p>
            </header>

            <main>
                <SearchBar 
                    searchQuery={searchQuery} 
                    onSearchChange={setSearchQuery} 
                />

                <PromptForm 
                    key={editingPrompt ? editingPrompt.id : 'new-prompt'}
                    onSave={handleSavePrompt} 
                    editingPrompt={editingPrompt} 
                    onClear={handleClearForm} 
                />

                <div className="stats">
                    Total: {prompts.length} | Găsite: {filteredPrompts.length}
                </div>

                <PromptList 
                    prompts={filteredPrompts} 
                    onEdit={handleEditPrompt} 
                    onDelete={handleDeletePrompt} 
                />
            </main>
        </div>
    );
}

export default App;
