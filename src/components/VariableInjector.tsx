import { useState, useMemo } from 'react';
import { Copy, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface VariableInjectorProps {
    body: string; // The prompt body which may contain {{variables}}
}

// Detect all unique variables of type {{variablename}} from text
function extractVariables(text: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
        matches.add(match[1]); // Add variable name without brackets
    }
    return Array.from(matches);
}

// Replace all occurrences of {{variable}} with corresponding value
function injectVariables(text: string, values: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, name) => values[name] || `{{${name}}}`);
}

export function VariableInjector({ body }: VariableInjectorProps) {
    const variables = useMemo(() => extractVariables(body), [body]);
    const [values, setValues] = useState<Record<string, string>>({});

    // Render nothing if no variables are detected
    if (variables.length === 0) return null;

    // Handler for updating a variable's value
    const handleChange = (name: string, value: string) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    // Copy prompt with injected variables to clipboard
    const handleCopy = async () => {
        const injected = injectVariables(body, values);
        try {
            await navigator.clipboard.writeText(injected);
            toast.success('Prompt copied with variables injected!');
        } catch (error) {
            console.error('Failed to copy injected prompt:', error);
            toast.error('Failed to copy to clipboard. Please check browser permissions.');
        }
    };

    return (
        <div className="variable-injector" id="variable-injector">
            <div className="variable-injector-header">
                <Zap size={14} />
                <span>Detected Variables – fill them before copying</span>
            </div>

            {/* Render input for each detected variable */}
            <div className="variable-inputs-grid">
                {variables.map(varName => (
                    <div key={varName} className="variable-input-group">
                        <label className="variable-label">
                            <code>{`{{${varName}}}`}</code>
                        </label>
                        <input
                            type="text"
                            className="variable-input"
                            placeholder={`Value for ${varName}`}
                            value={values[varName] || ''}
                            onChange={e => handleChange(varName, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            {/* Button to copy with values injected */}
            <button className="btn-primary variable-copy-btn" onClick={handleCopy}>
                <Copy size={14} /> Copy with variables filled
            </button>
        </div>
    );
}
