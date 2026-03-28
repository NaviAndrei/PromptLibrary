import { useState } from 'react';
import type { PromptTemplate } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Layout, Plus, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateManagerProps {
    onSelectTemplate: (template: PromptTemplate) => void;
}

const DEFAULT_TEMPLATES: PromptTemplate[] = [
    {
        id: '1',
        name: 'Code Refactor',
        description: 'Standard refactoring prompt for logic and readability',
        variables: ['code', 'language', 'focus'],
        templateBody: 'Please refactor the following {{language}} code while focusing on {{focus}}:\n\n```{{language}}\n{{code}}\n```',
        category: 'Development'
    },
    {
        id: '2',
        name: 'Email Draft',
        description: 'Professional email generator',
        variables: ['recipient', 'context', 'tone'],
        templateBody: 'Write a professional email to {{recipient}}. The context is {{context}} and the tone should be {{tone}}.',
        category: 'Communication'
    }
];

export function TemplateManager({ onSelectTemplate }: TemplateManagerProps) {
    const [templates, setTemplates] = useLocalStorage<PromptTemplate[]>('prompt-templates', DEFAULT_TEMPLATES);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form state for new template
    const [form, setForm] = useState({
        name: '',
        description: '',
        templateBody: '',
        category: 'General'
    });

    const handleAdd = () => {
        if (!form.name || !form.templateBody) {
            toast.error('Name and Template Body are required!');
            return;
        }

        // Simple regex to extract variables from the template body
        const variables = Array.from(form.templateBody.matchAll(/\{\{(\w+)(?::\w+)?(?::[^}]+)?\}\}/g)).map(m => m[1]);
        
        const newTemplate: PromptTemplate = {
            id: crypto.randomUUID(),
            name: form.name,
            description: form.description,
            variables: [...new Set(variables)], // Unique variables
            templateBody: form.templateBody,
            category: form.category
        };

        setTemplates([newTemplate, ...templates]);
        setForm({ name: '', description: '', templateBody: '', category: 'General' });
        setIsAdding(false);
        toast.success(`Template "${newTemplate.name}" created!`);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Delete this template?')) {
            setTemplates(templates.filter(t => t.id !== id));
            toast.info('Template deleted.');
        }
    };

    return (
        <div className="template-manager" style={{ marginTop: '1.5rem' }}>
            <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                    <Layout size={16} /> Templates
                </h3>
                <button 
                    className="btn-icon" 
                    onClick={() => setIsAdding(!isAdding)}
                    title="Add new template"
                >
                    <Plus size={16} />
                </button>
            </div>

            {isAdding && (
                <div className="workspace-add-form" style={{ gap: '0.75rem', padding: '1rem' }}>
                    <input 
                        type="text" 
                        placeholder="Template Name..." 
                        className="workspace-name-input" 
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                    />
                    <textarea 
                        placeholder="Template Body (use {{var}})..." 
                        className="workspace-name-input"
                        rows={3}
                        style={{ resize: 'vertical' }}
                        value={form.templateBody}
                        onChange={e => setForm({...form, templateBody: e.target.value})}
                    />
                    <input 
                        type="text" 
                        placeholder="Category (e.g. Writing)" 
                        className="workspace-name-input" 
                        value={form.category}
                        onChange={e => setForm({...form, category: e.target.value})}
                    />
                    <button className="btn-primary" onClick={handleAdd}>Create Template</button>
                </div>
            )}

            <ul className="workspace-list">
                {templates.map(t => (
                    <li 
                        key={t.id} 
                        className="workspace-item" 
                        onClick={() => onSelectTemplate(t)}
                        style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '0.75rem' }}
                    >
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                {t.name}
                            </span>
                            <Trash2 
                                size={12} 
                                className="workspace-delete-btn" 
                                style={{ opacity: 0.6 }}
                                onClick={(e) => handleDelete(e, t.id)} 
                            />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {t.description || 'No description'}
                        </span>
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                            <span className="tag-badge" style={{ fontSize: '0.65rem' }}>
                                <Tag size={10} /> {t.category}
                            </span>
                            {t.variables.map(v => (
                                <span key={v} className="model-badge" style={{ fontSize: '0.65rem', background: 'var(--bg-color)' }}>
                                    {v}
                                </span>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
