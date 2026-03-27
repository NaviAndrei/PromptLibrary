import { useState, useMemo } from 'react';
import type { Prompt, PromptVersion, Workspace } from '../types';
import { toast } from 'sonner';
import { Edit2, Copy, Trash2, ChevronDown, ChevronUp, Download, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { VariableInjector } from './VariableInjector';
import { VersionHistory } from './VersionHistory';

interface PromptListProps {
    prompts: Prompt[];
    viewMode: 'list' | 'grid';
    onEdit: (prompt: Prompt) => void;
    onDelete: (id: string) => void;
    getVersions: (promptId: string) => PromptVersion[];
    workspaces: Workspace[];
}

// Renders the list of prompts and associated actions
export function PromptList({ prompts, viewMode, onEdit, onDelete, getVersions, workspaces }: PromptListProps) {
    // Local state for expanded prompt IDs (vertical expansion)
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // State for which prompt's history is being viewed
    const [historyPromptId, setHistoryPromptId] = useState<string | null>(null);

    // Optimized O(1) workspace lookup
    const workspaceMap = useMemo(() => {
        const map: Record<string, Workspace> = {};
        workspaces.forEach(ws => {
            map[ws.id] = ws;
        });
        return map;
    }, [workspaces]);

    // Copy to clipboard handler
    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Prompt copied to clipboard!');
        } catch (err) {
            console.error('Copy failure:', err);
            toast.error('Copy failed.');
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
        toast.success(`Exported: ${prompt.title}.md`);
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
                <p>No valid prompts found. Add a new one or clear filters!</p>
            </div>
        );
    }

    // Selected prompt for history view
    const historyPrompt = historyPromptId ? prompts.find(p => p.id === historyPromptId) : null;

    return (
        <>
            {/* Version History Modal */}
            {historyPrompt && (
                <VersionHistory
                    promptTitle={historyPrompt.title}
                    versions={[
                        // Include current version as latest snapshot
                        { promptId: historyPrompt.id, body: historyPrompt.body, savedAt: historyPrompt.updatedAt },
                        ...getVersions(historyPrompt.id),
                    ]}
                    onClose={() => setHistoryPromptId(null)}
                />
            )}

            <div className={`prompt-list ${viewMode}`} id="prompt-list">
                {prompts.map(prompt => {
                    const isExpanded = expandedIds.has(prompt.id);
                    // O(1) Lookup of the workspace associated with the prompt
                    const promptWorkspace = prompt.workspaceId ? workspaceMap[prompt.workspaceId] : null;

                    return (
                        <div key={prompt.id} className="prompt-card card">
                            <div className="prompt-header">
                                <div>
                                    <h4>
                                        {prompt.title}
                                        {/* Workspace badge */}
                                        {promptWorkspace && (
                                            <span
                                                className="workspace-chip"
                                                style={{ background: promptWorkspace.color }}
                                                title={`Workspace: ${promptWorkspace.name}`}
                                            >
                                                {promptWorkspace.icon} {promptWorkspace.name}
                                            </span>
                                        )}
                                    </h4>
                                    <span className="model-badge">{prompt.model}</span>
                                </div>
                                <div className="prompt-actions">
                                    <button onClick={() => onEdit(prompt)} className="btn-icon" title="Edit">
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleCopy(prompt.body)} className="btn-icon" title="Copy">
                                        <Copy size={16} />
                                    </button>
                                    <button onClick={() => handleExportMD(prompt)} className="btn-icon" title="Export as Markdown">
                                        <Download size={16} />
                                    </button>
                                    {/* Version History button */}
                                    <button
                                        onClick={() => setHistoryPromptId(prompt.id)}
                                        className="btn-icon"
                                        title="Version History"
                                    >
                                        <Clock size={16} />
                                    </button>
                                    <button
                                        onClick={() => window.confirm('Are you sure you want to delete this prompt?') && onDelete(prompt.id)}
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
                                    <>
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
                                        {/* VariableInjector - visible only when expanded and tags present */}
                                        <VariableInjector body={prompt.body} />
                                    </>
                                ) : (
                                    <pre className="collapsed">
                                        {prompt.body.length > 100 ? prompt.body.substring(0, 100) + '...' : prompt.body}
                                    </pre>
                                )}

                                {prompt.body.length > 100 && (
                                    <button className="expand-btn" onClick={() => toggleExpand(prompt.id)}>
                                        {isExpanded ? (
                                            <><ChevronUp size={16} /> Collapse</>
                                        ) : (
                                            <><ChevronDown size={16} /> Expand</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
