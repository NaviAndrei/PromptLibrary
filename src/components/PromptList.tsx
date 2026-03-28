import { useState, useMemo } from 'react';
import type { ReactElement } from 'react';
import type { Prompt, PromptVersion, Workspace } from '../types';
import { toast } from 'sonner';
import { Edit2, Copy, Trash2, ChevronDown, ChevronUp, Download, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { VariableInjector } from './VariableInjector';
import { VersionHistory } from './VersionHistory';
import { FixedSizeList as List } from 'react-window';

interface ListChildData<T = unknown> {
    index: number;
    style: React.CSSProperties;
    data: T;
    isScrolling?: boolean;
}

// Sub-component for the top section of a prompt card
interface PromptCardHeaderProps {
    prompt: Prompt;
    workspace?: Workspace | null;
}

function PromptCardHeader({ prompt, workspace }: PromptCardHeaderProps) {
    return (
        <div>
            <h4>
                {prompt.title}
                {workspace && (
                    <span
                        className="workspace-chip"
                        style={{ background: workspace.color }}
                        title={`Workspace: ${workspace.name}`}
                    >
                        {workspace.icon} {workspace.name}
                    </span>
                )}
            </h4>
            <span className="model-badge">{prompt.model}</span>
        </div>
    );
}

// Sub-component for the action buttons on a prompt card
interface PromptCardActionsProps {
    prompt: Prompt;
    onEdit: (p: Prompt) => void;
    onCopy: (body: string) => void;
    onExportMD: (p: Prompt) => void;
    onExportJSON: (p: Prompt) => void;
    onViewHistory: (id: string) => void;
    onDelete: (id: string) => void;
}

function PromptCardActions({ 
    prompt, onEdit, onCopy, onExportMD, onExportJSON, onViewHistory, onDelete 
}: PromptCardActionsProps) {
    return (
        <div className="prompt-actions">
            <button onClick={() => onEdit(prompt)} className="btn-icon" title="Edit">
                <Edit2 size={16} />
            </button>
            <button onClick={() => onCopy(prompt.body)} className="btn-icon" title="Copy">
                <Copy size={16} />
            </button>
            <button onClick={() => onExportMD(prompt)} className="btn-icon" title="Export as Markdown">
                <Download size={16} />
            </button>
            <button onClick={() => onExportJSON(prompt)} className="btn-icon" title="Export as JSON">
                <Download size={16} style={{ color: 'var(--primary-color)' }} />
            </button>
            <button onClick={() => onViewHistory(prompt.id)} className="btn-icon" title="History">
                <Clock size={16} />
            </button>
            <button
                onClick={() => window.confirm('Are you sure you want to delete?') && onDelete(prompt.id)}
                className="btn-icon delete"
                title="Delete"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}

// Sub-component for displaying tags and token count
function PromptCardTags({ tags, bodyLength }: { tags: string[], bodyLength: number }) {
    return (
        <div className="prompt-tags">
            {tags.map(tag => (
                <span key={tag} className="tag-badge">#{tag}</span>
            ))}
            <span className="token-badge">~{Math.round(bodyLength / 4)} tokens</span>
        </div>
    );
}

// Sub-component for the body preview and variable injection
interface PromptCardBodyProps {
    prompt: Prompt;
    isExpanded: boolean;
    onToggleExpand: (id: string) => void;
}

function PromptCardBody({ prompt, isExpanded, onToggleExpand }: PromptCardBodyProps) {
    return (
        <div className="prompt-body-preview">
            {isExpanded ? (
                <>
                    <div className="markdown-body">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                code({ inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    // Remove ref to avoid type conflicts and linting errors
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
                                    const { ref, ...rest } = props as any;
                                    
                                    return !inline && match ? (
                                        <SyntaxHighlighter
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            style={vscDarkPlus as any}
                                            language={match[1]}
                                            PreTag="div"
                                            {...rest}
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
                    <VariableInjector body={prompt.body} />
                </>
            ) : (
                <pre className="collapsed">
                    {prompt.body.length > 100 ? prompt.body.substring(0, 100) + '...' : prompt.body}
                </pre>
            )}

            {prompt.body.length > 100 && (
                <button className="expand-btn" onClick={() => onToggleExpand(prompt.id)}>
                    {isExpanded ? <><ChevronUp size={16} /> Collapse</> : <><ChevronDown size={16} /> Expand</>}
                </button>
            )}
        </div>
    );
}

interface PromptListProps {
    prompts: Prompt[];
    viewMode: 'list' | 'grid';
    onEdit: (prompt: Prompt) => void;
    onDelete: (id: string) => void;
    getVersions: (promptId: string) => PromptVersion[];
    workspaces: Workspace[];
}

export function PromptList({ prompts, viewMode, onEdit, onDelete, getVersions, workspaces }: PromptListProps) {
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [historyPromptId, setHistoryPromptId] = useState<string | null>(null);

    // O(1) workspace lookup optimization using Object.fromEntries
    const workspaceMap = useMemo(() =>   
        Object.fromEntries(workspaces.map((ws: Workspace) => [ws.id, ws])),   
        [workspaces]  
    );

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

    const handleExportJSON = (prompt: Prompt) => {
        const content = JSON.stringify(prompt, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Exported: ${prompt.title}.json`);
    };

    const handleExportMultiple = () => {
        if (prompts.length === 0) return;
        
        const content = prompts.map((p: Prompt) => 
            `# ${p.title}\n\n**Tags:** ${p.tags.join(', ')}\n**Model:** ${p.model}\n\n${p.body}\n\n---\n`
        ).join('\n');
        
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `exported_prompts_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Batch exported ${prompts.length} prompts!`);
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
                <p>No prompts found. Add a new one or clear the filters!</p>
            </div>
        );
    }

    const historyPrompt = historyPromptId ? prompts.find(p => p.id === historyPromptId) : null;

    // Rendering an individual row for virtualization (v2 API)
    const PromptRow = ({ index, style, data }: ListChildData<Prompt[]>): ReactElement | null => {
        const prompt = data[index];
        if (!prompt) return null;
        
        const isExpanded = expandedIds.has(prompt.id);
        const promptWorkspace = prompt.workspaceId ? workspaceMap[prompt.workspaceId] : null;

        return (
            <div 
                style={style} 
                className="prompt-card-wrapper"
                draggable="true"
                onDragStart={(e) => {
                    e.dataTransfer.setData('promptId', prompt.id);
                    e.dataTransfer.effectAllowed = 'move';
                }}
            >
                <div className="prompt-card card">
                    <div className="prompt-header">
                        <PromptCardHeader prompt={prompt} workspace={promptWorkspace} />
                        <PromptCardActions 
                            prompt={prompt}
                            onEdit={onEdit}
                            onCopy={handleCopy}
                            onExportMD={handleExportMD}
                            onExportJSON={handleExportJSON}
                            onViewHistory={setHistoryPromptId}
                            onDelete={onDelete}
                        />
                    </div>

                    <PromptCardTags tags={prompt.tags} bodyLength={prompt.body.length} />

                    <PromptCardBody 
                        prompt={prompt} 
                        isExpanded={isExpanded} 
                        onToggleExpand={toggleExpand} 
                    />
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="list-header-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button 
                    className="btn-secondary" 
                    onClick={handleExportMultiple}
                    style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Download size={14} /> Batch Export ({prompts.length})
                </button>
            </div>

            {historyPrompt && (
                <VersionHistory
                    promptTitle={historyPrompt.title}
                    versions={[
                        { promptId: historyPrompt.id, body: historyPrompt.body, savedAt: historyPrompt.updatedAt },
                        ...getVersions(historyPrompt.id),
                    ]}
                    onClose={() => setHistoryPromptId(null)}
                />
            )}

            {viewMode === 'list' && prompts.length > 5 ? (
                <List
                    height={800}
                    width="100%"
                    itemCount={prompts.length}
                    itemSize={280}
                    itemData={prompts}
                    className="prompt-list list virtualized"
                >
                    {PromptRow}
                </List>
            ) : (
                <div className={`prompt-list ${viewMode}`} id="prompt-list">
                    {prompts.map((_: Prompt, idx: number) => (
                        <PromptRow 
                            key={prompts[idx].id} 
                            index={idx} 
                            style={{ position: 'relative' }} 
                            data={prompts}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
