import { useState } from 'react';
import type { Prompt } from '../types';
import { toast } from 'sonner';
import { Edit2, Copy, Trash2, ChevronDown, ChevronUp, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PromptListProps {
    prompts: Prompt[];
    viewMode: 'list' | 'grid';
    onEdit: (prompt: Prompt) => void;
    onDelete: (id: string) => void;
}

// Renderizează lista de prompt-uri și acțiunile asociate fiecăruia
export function PromptList({ prompts, viewMode, onEdit, onDelete }: PromptListProps) {
    // Păstrăm local un array cu ID-urile prompturilor extinse (pentru afișarea conținutului complet)
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // Funcție pentru a copia în clipboard body-ul
    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Promptul a fost copiat în clipboard!');
        } catch (err) {
            console.error('Eroare la copiere:', err);
            toast.error('Copierea a eșuat.');
        }
    };

    const handleExportMD = (prompt: Prompt) => {
        const content = `# ${prompt.title}\n\n**Tags:** ${prompt.tags.map(t => `#${t}`).join(', ')}\n**Model:** ${prompt.model}\n\n---\n\n${prompt.body}`;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Exportat: ${prompt.title}.md`);
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    if (prompts.length === 0) {
        return (
            <div className="empty-state">
                <p>Nu s-a găsit niciun prompt valid. Adaugă unul nou sau modifică filtrele!</p>
            </div>
        );
    }

    return (
        <div className={`prompt-list ${viewMode}`}>
            {prompts.map(prompt => {
                const isExpanded = expandedIds.has(prompt.id);
                
                return (
                    <div key={prompt.id} className="prompt-card card">
                        <div className="prompt-header">
                            <div>
                                <h4>{prompt.title}</h4>
                                <span className="model-badge">{prompt.model}</span>
                            </div>
                            <div className="prompt-actions">
                                <button onClick={() => onEdit(prompt)} className="btn-icon" title="Edit">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleCopy(prompt.body)} className="btn-icon" title="Copy">
                                    <Copy size={16} />
                                </button>
                                <button onClick={() => handleExportMD(prompt)} className="btn-icon" title="Export ca Markdown">
                                    <Download size={16} />
                                </button>
                                {/* Folosim window.confirm pentru confirmarea ștergerii, o metodă integrată nativ */}
                                <button 
                                    onClick={() => window.confirm('Ești sigur că vrei să ștergi?') && onDelete(prompt.id)} 
                                    className="btn-icon delete"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="prompt-tags">
                            {prompt.tags.map(tag => (
                                <span key={tag} className="tag-badge">#{tag}</span>
                            ))}
                            <span className="token-badge" title="Estimated Tokens">
                                ~{Math.round(prompt.body.length / 4)} tokens
                            </span>
                        </div>

                        <div className="prompt-body-preview">
                            {isExpanded ? (
                                <div className="markdown-body">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            code({ inline, className, children, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { inline?: boolean }) {
                                                const match = /language-(\w+)/.exec(className || '');
                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                const { ref, ...rest } = props;
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        style={vscDarkPlus as any}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        {...(rest as any)}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                );
                                            }
                                        }}
                                    >
                                        {prompt.body}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <pre className="collapsed">
                                    {prompt.body.length > 100 ? prompt.body.substring(0, 100) + '...' : prompt.body}
                                </pre>
                            )}
                            
                            {prompt.body.length > 100 && (
                                <button className="expand-btn" onClick={() => toggleExpand(prompt.id)}>
                                    {isExpanded ? (
                                        <><ChevronUp size={16} /> Restrânge</>
                                    ) : (
                                        <><ChevronDown size={16} /> Extinde</>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
