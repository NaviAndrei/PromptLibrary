import { useState, useMemo } from 'react';
import { Copy, Zap, Save, Bookmark, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface VariableInjectorProps {
    body: string; // The prompt body which can contain {{variables}}
}

interface VariableInfo {
    name: string;
    type: string;
    raw: string;
}

interface VariablePreset {
    id: string;
    name: string;
    values: Record<string, string>;
}

// Mapping between hint types and HTML input types
const TYPE_MAP: Record<string, string> = {
    'text': 'text',
    'number': 'number',
    'date': 'date',
    'datetime': 'datetime-local',
    'email': 'email',
    'url': 'url',
    'color': 'color',
    'password': 'password',
    'select': 'select',
};

// Detects all unique variables of type {{name:type:options}} from text
function extractVariables(text: string): (VariableInfo & { options?: string[] })[] {
    const regex = /\{\{(\w+)(?::(\w+))?(?::([^}]+))?\}\}/g;
    const seen = new Set<string>();
    const variables: (VariableInfo & { options?: string[] })[] = [];
    
    let match;
    while ((match = regex.exec(text)) !== null) {
        const name = match[1];
        const typeHint = (match[2] || 'text').toLowerCase();
        const optionsRaw = match[3];
        
        if (!seen.has(name)) {
            seen.add(name);
            const info: VariableInfo & { options?: string[] } = {
                name,
                type: TYPE_MAP[typeHint] || 'text',
                raw: match[0],
            };
            
            if (typeHint === 'select' && optionsRaw) {
                info.options = optionsRaw.split(',').map(o => o.trim());
            }
            
            variables.push(info);
        }
    }
    return variables;
}

// Replaces all occurrences of {{variable}} or {{variable:type}} with the corresponding value
function injectVariables(text: string, values: Record<string, string>): string {
    return text.replace(/\{\{(\w+)(?::(\w+))?(?::([^}]+))?\}\}/g, (_, name) => {
        return values[name] !== undefined && values[name] !== '' ? values[name] : `{{${name}}}`;
    });
}

export function VariableInjector({ body }: VariableInjectorProps) {
    const variables = useMemo(() => extractVariables(body), [body]);
    const [values, setValues] = useState<Record<string, string>>({});
    const [presetName, setPresetName] = useState('');
    
    // Preset management using localStorage
    const [presets, setPresets] = useLocalStorage<VariablePreset[]>('prompt-variable-presets', [
        { id: '1', name: 'Code Review', values: { 'language': 'TypeScript', 'focus_area': 'Security' } }
    ]);

    if (variables.length === 0) return null;

    const handleChange = (name: string, value: string) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSavePreset = () => {
        if (!presetName.trim()) {
            toast.error('Enter a name for the preset!');
            return;
        }
        
        const newPreset: VariablePreset = {
            id: crypto.randomUUID(),
            name: presetName.trim(),
            values: { ...values },
        };
        
        setPresets(prev => [newPreset, ...prev]);
        setPresetName('');
        toast.success(`Preset "${newPreset.name}" has been saved!`);
    };

    const handleApplyPreset = (preset: VariablePreset) => {
        // Merge current values with those from the preset
        setValues(prev => ({ ...prev, ...preset.values }));
        toast.info(`Preset "${preset.name}" applied.`);
    };

    const handleDeletePreset = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setPresets(prev => prev.filter(p => p.id !== id));
        toast.info('Preset deleted.');
    };

    const handleCopy = async () => {
        const injected = injectVariables(body, values);
        try {
            await navigator.clipboard.writeText(injected);
            toast.success('Prompt copied with injected variables!');
        } catch (error) {
            console.error('Failed to copy injected prompt:', error);
            toast.error('Copy to clipboard failed.');
        }
    };

    return (
        <div className="variable-injector" id="variable-injector">
            <div className="variable-injector-header">
                <div>
                    <Zap size={14} />
                    <span>Detected Variables</span>
                </div>
            </div>

            {/* Presets Section */}
            <div className="presets-section">
                <div className="preset-save-row">
                    <input 
                        type="text" 
                        placeholder="Preset name..." 
                        value={presetName}
                        onChange={e => setPresetName(e.target.value)}
                        className="preset-input"
                    />
                    <button className="btn-icon" onClick={handleSavePreset} title="Save current values as preset">
                        <Save size={16} />
                    </button>
                </div>
                
                {presets.length > 0 && (
                    <div className="presets-list">
                        <Bookmark size={12} style={{ opacity: 0.6 }} />
                        {presets.map(p => (
                            <div key={p.id} className="preset-chip" onClick={() => handleApplyPreset(p)}>
                                <span>{p.name}</span>
                                <Trash2 size={10} className="delete-icon" onClick={(e) => handleDeletePreset(e, p.id)} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="variable-inputs-grid">
                {variables.map(v => (
                    <div key={v.name} className="variable-input-group">
                        <label className="variable-label">
                            <code>{`{{${v.name}}}`}</code>
                            {v.type !== 'text' && <span className="type-badge">({v.type})</span>}
                        </label>
                        
                        {v.type === 'select' && v.options ? (
                            <select
                                className="variable-input variable-input-select"
                                value={values[v.name] || ''}
                                onChange={e => handleChange(v.name, e.target.value)}
                                aria-label={`Select value for variable ${v.name}`}
                                aria-describedby={`variable-help-${v.name}`}
                            >
                                <option value="">Choose an option...</option>
                                {v.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={v.type}
                                className={`variable-input ${v.type === 'number' ? 'variable-input-number' : ''}`}
                                placeholder={`Value for ${v.name}`}
                                value={values[v.name] || ''}
                                onChange={e => handleChange(v.name, e.target.value)}
                                aria-label={`Enter value for variable ${v.name}`}
                                aria-describedby={`variable-help-${v.name}`}
                            />
                        )}
                        <span id={`variable-help-${v.name}`} className="hide-visually">
                            Input value for the dynamic variable {v.name} which will be injected into the prompt.
                        </span>
                    </div>
                ))}
            </div>

            <button className="btn-primary variable-copy-btn" onClick={handleCopy}>
                <Copy size={14} /> Copy with filled variables
            </button>
        </div>
    );
}
