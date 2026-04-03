import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { PromptTemplate } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Layout, Plus, Trash2, Tag, X } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateManagerProps {
  onAddAsPrompt: (template: PromptTemplate) => void;
}

const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: '1',
    name: 'Code Refactor',
    description: 'Standard refactoring prompt for logic and readability',
    variables: ['code', 'language', 'focus'],
    templateBody:
      'Please refactor the following {{language}} code while focusing on {{focus}}:\n\n```{{language}}\n{{code}}\n```',
    category: 'Development',
  },
  {
    id: '2',
    name: 'Email Draft',
    description: 'Professional email generator',
    variables: ['recipient', 'context', 'tone'],
    templateBody:
      'Write a professional email to {{recipient}}. The context is {{context}} and the tone should be {{tone}}.',
    category: 'Communication',
  },
];

export function TemplateManager({ onAddAsPrompt }: TemplateManagerProps) {
  const [templates, setTemplates] = useLocalStorage<PromptTemplate[]>(
    'prompt-templates',
    DEFAULT_TEMPLATES,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );

  // Form state for new or edited template
  const [form, setForm] = useState({
    name: '',
    description: '',
    templateBody: '',
    category: 'General',
  });

  const extractVariables = (templateBody: string) => {
    return Array.from(
      templateBody.matchAll(/\{\{([\w\s-]+)(?:[:=][^}]+)?\}\}/g),
    ).map((m) => m[1].trim());
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      templateBody: '',
      category: 'General',
    });
    setEditingTemplateId(null);
    setIsModalOpen(false);
  };

  const loadTemplateIntoForm = (template: PromptTemplate) => {
    setEditingTemplateId(template.id);
    setForm({
      name: template.name,
      description: template.description,
      templateBody: template.templateBody,
      category: template.category,
    });
    setIsModalOpen(true);
  };

  const buildTemplateFromForm = (id: string): PromptTemplate => {
    const variables = extractVariables(form.templateBody);

    return {
      id,
      name: form.name,
      description: form.description,
      variables: [...new Set(variables)],
      templateBody: form.templateBody,
      category: form.category,
    };
  };

  const handleSaveTemplate = () => {
    if (!form.name || !form.templateBody) {
      toast.error('Name and Template Body are required!');
      return;
    }

    const templateId = editingTemplateId ?? crypto.randomUUID();
    const updatedTemplate = buildTemplateFromForm(templateId);

    if (editingTemplateId) {
      setTemplates(
        templates.map((t) =>
          t.id === editingTemplateId ? updatedTemplate : t,
        ),
      );
      toast.success(`Template "${updatedTemplate.name}" updated!`);
    } else {
      setTemplates([updatedTemplate, ...templates]);
      toast.success(`Template "${updatedTemplate.name}" created!`);
    }

    resetForm();
  };

  const handleAddAsPrompt = () => {
    if (!form.name || !form.templateBody) {
      toast.error('Name and Template Body are required!');
      return;
    }

    onAddAsPrompt(
      buildTemplateFromForm(editingTemplateId ?? crypto.randomUUID()),
    );
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this template?')) {
      setTemplates(templates.filter((t) => t.id !== id));
      toast.info('Template deleted.');
    }
  };

  return (
    <div className="template-manager" style={{ marginTop: '1.5rem' }}>
      <div
        className="sidebar-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
          <Layout size={16} /> Templates
        </h3>
        <button
          className="btn-icon"
          onClick={() => {
            setForm({
              name: '',
              description: '',
              templateBody: '',
              category: 'General',
            });
            setEditingTemplateId(null);
            setIsModalOpen(true);
          }}
          title="Add new template"
        >
          <Plus size={16} />
        </button>
      </div>

      <p className="sidebar-section-note">
        Reuse prompt patterns and variables.
      </p>

      {isModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="modal-overlay" onClick={resetForm}>
            <div
              className="modal-content template-manager-modal"
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '640px',
                width: '92vw',
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
            >
              <div className="modal-header">
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {editingTemplateId ? 'Edit Template' : 'Add New Template'}
                </h3>
                <button className="btn-icon" onClick={resetForm} title="Close">
                  <X size={18} />
                </button>
              </div>

              <div
                className="workspace-add-form"
                style={{ gap: '0.65rem', padding: '1rem' }}
              >
                <input
                  type="text"
                  placeholder="Template Name..."
                  className="workspace-name-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <textarea
                  placeholder="Template Body (use {{var}})..."
                  className="workspace-name-input"
                  rows={6}
                  style={{ resize: 'vertical', minHeight: '160px' }}
                  value={form.templateBody}
                  onChange={(e) =>
                    setForm({ ...form, templateBody: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Category (e.g. Writing)"
                  className="workspace-name-input"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                  }}
                >
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSaveTemplate}
                    style={{ width: '100%' }}
                  >
                    {editingTemplateId ? 'Update Template' : 'Create Template'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAddAsPrompt}
                    style={{ width: '100%' }}
                  >
                    Add as Prompt
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={resetForm}
                  style={{ width: '100%' }}
                >
                  Clear / Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      <ul className="workspace-list">
        {templates.map((t) => (
          <li
            key={t.id}
            className="workspace-item"
            onClick={() => loadTemplateIntoForm(t)}
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              padding: '0.75rem',
              borderColor:
                editingTemplateId === t.id ? 'var(--primary-color)' : undefined,
              background:
                editingTemplateId === t.id
                  ? 'rgba(59, 130, 246, 0.08)'
                  : undefined,
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'var(--text-dark)',
                }}
              >
                {t.name}
              </span>
              <Trash2
                size={12}
                className="workspace-delete-btn"
                style={{ opacity: 0.6 }}
                onClick={(e) => handleDelete(e, t.id)}
              />
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '0.2rem',
              }}
            >
              {t.description || 'No description'}
            </span>
            <div
              style={{
                display: 'flex',
                gap: '0.4rem',
                marginTop: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <span className="tag-badge" style={{ fontSize: '0.65rem' }}>
                <Tag size={10} /> {t.category}
              </span>
              {t.variables.map((v) => (
                <span
                  key={v}
                  className="model-badge"
                  style={{ fontSize: '0.65rem', background: 'var(--bg-color)' }}
                >
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
