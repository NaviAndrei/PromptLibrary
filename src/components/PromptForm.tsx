import { useState } from 'react';
import type { Prompt, Workspace } from '../types';
import { ChevronDown } from 'lucide-react';
import { LLM_MODELS } from '../constants';

interface PromptFormProps {
  onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingPrompt: Prompt | null;
  existingTags: string[];
  onClear: () => void;
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
}

// Form for creating or editing a prompt
export function PromptForm({
  onSave,
  editingPrompt,
  existingTags,
  onClear,
  workspaces,
  currentWorkspaceId,
}: PromptFormProps) {
  // Initial state set based on editingPrompt or defaults
  const [title, setTitle] = useState(editingPrompt?.title || '');
  const [body, setBody] = useState(editingPrompt?.body || '');
  const [tagsInput, setTagsInput] = useState(
    editingPrompt ? editingPrompt.tags.join(', ') : '',
  );
  const [model, setModel] = useState(editingPrompt?.model || LLM_MODELS[0]);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [highlightedTagIndex, setHighlightedTagIndex] = useState(0);
  // Selected workspace in the form (defaults to current or prompt's workspace)
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(
    editingPrompt?.workspaceId ?? currentWorkspaceId ?? '',
  );

  const hasTagSuggestions = existingTags.length > 0;

  const tagParts = tagsInput.split(',');
  const activeTagQuery = tagParts[tagParts.length - 1]?.trim() ?? '';
  const selectedTagSet = new Set(
    tagParts.map((tag) => tag.trim().toLowerCase()).filter(Boolean),
  );

  const tagSuggestions = existingTags.filter((tag) => {
    const normalizedTag = tag.toLowerCase();
    const matchesQuery =
      activeTagQuery.length === 0 ||
      normalizedTag.includes(activeTagQuery.toLowerCase());

    return matchesQuery && !selectedTagSet.has(normalizedTag);
  });

  const insertTag = (tag: string) => {
    const prefixTags = tagParts
      .slice(0, -1)
      .map((part) => part.trim())
      .filter(Boolean);

    const nextValue = [...prefixTags, tag].join(', ') + ', ';
    setTagsInput(nextValue);
    setIsTagDropdownOpen(hasTagSuggestions);
    setHighlightedTagIndex(0);
  };

  const resetForm = () => {
    setTitle('');
    setBody('');
    setTagsInput('');
    setModel(LLM_MODELS[0]);
    setIsTagDropdownOpen(false);
    setHighlightedTagIndex(0);
    setSelectedWorkspaceId(currentWorkspaceId ?? '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!title.trim() || !body.trim()) {
      alert('Title and prompt body are required.');
      return;
    }

    // Parse tags from comma-separated string to array
    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Call callback from App.tsx with clean data
    onSave({
      title: title.trim(),
      body: body.trim(),
      tags: tagsArray,
      model: model || LLM_MODELS[0],
      workspaceId: selectedWorkspaceId || undefined,
    });

    // Clear form only on creation (not on edit)
    if (!editingPrompt) {
      resetForm();
    }
  };

  return (
    <form className="prompt-form card" onSubmit={handleSubmit} id="prompt-form">
      <h3>{editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}</h3>

      <div className="form-group">
        <label>Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Python Code Refactor"
        />
      </div>

      <div className="form-group row-group">
        <div className="flex-1">
          <label>Tags (comma separated):</label>
          <div className="tag-autocomplete-shell">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => {
                setTagsInput(e.target.value);
                setIsTagDropdownOpen(hasTagSuggestions);
                setHighlightedTagIndex(0);
              }}
              onFocus={() => setIsTagDropdownOpen(hasTagSuggestions)}
              onBlur={() => setIsTagDropdownOpen(false)}
              onKeyDown={(e) => {
                if (!hasTagSuggestions || !tagSuggestions.length) return;

                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setIsTagDropdownOpen(true);
                  setHighlightedTagIndex(
                    (index) => (index + 1) % tagSuggestions.length,
                  );
                }

                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setIsTagDropdownOpen(true);
                  setHighlightedTagIndex(
                    (index) =>
                      (index - 1 + tagSuggestions.length) %
                      tagSuggestions.length,
                  );
                }

                if (e.key === 'Enter' && isTagDropdownOpen) {
                  const selectedTag =
                    tagSuggestions[highlightedTagIndex] ?? tagSuggestions[0];
                  if (selectedTag) {
                    e.preventDefault();
                    insertTag(selectedTag);
                  }
                }

                if (e.key === 'Escape') {
                  setIsTagDropdownOpen(false);
                }
              }}
              placeholder="e.g., refactor, python, clean-code"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={
                hasTagSuggestions &&
                isTagDropdownOpen &&
                tagSuggestions.length > 0
              }
            />

            {hasTagSuggestions && (
              <span className="tag-dropdown-indicator" aria-hidden="true">
                <ChevronDown size={16} />
              </span>
            )}

            {hasTagSuggestions &&
              isTagDropdownOpen &&
              tagSuggestions.length > 0 && (
                <div
                  className="tag-suggestion-menu"
                  role="listbox"
                  aria-label="Sidebar tag suggestions"
                >
                  {tagSuggestions.slice(0, 10).map((tag, index) => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-suggestion-item ${index === highlightedTagIndex ? 'active' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        insertTag(tag);
                      }}
                      onMouseEnter={() => setHighlightedTagIndex(index)}
                      role="option"
                      aria-selected={index === highlightedTagIndex}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}

            {hasTagSuggestions &&
              isTagDropdownOpen &&
              tagSuggestions.length === 0 &&
              activeTagQuery.length > 0 && (
                <div className="tag-suggestion-empty">
                  No Sidebar Tags Cloud matches.
                </div>
              )}
          </div>
        </div>
        <div className="flex-1">
          <label>Recommended Model:</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="model-select"
          >
            {LLM_MODELS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
            {!LLM_MODELS.includes(model) && model && (
              <option value={model}>{model} (Current)</option>
            )}
          </select>
        </div>
      </div>

      {/* Workspace Selector - visible if workspaces exist */}
      {workspaces.length > 0 && (
        <div className="form-group">
          <label>Workspace:</label>
          <select
            value={selectedWorkspaceId}
            onChange={(e) => setSelectedWorkspaceId(e.target.value)}
            className="workspace-select"
          >
            <option value="">— No workspace (General) —</option>
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.icon} {ws.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Prompt Body:</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="Write your prompt body here... Use {{variable}} for dynamic injection."
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {editingPrompt ? 'Update Prompt' : 'Add Prompt'}
        </button>
        <button type="button" onClick={onClear} className="btn-secondary">
          Clear / Cancel
        </button>
      </div>
    </form>
  );
}
