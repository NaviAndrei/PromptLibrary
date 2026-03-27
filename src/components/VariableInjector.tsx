import { useState, useMemo } from 'react';
import { Copy, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface VariableInjectorProps {
    body: string; // Corpul prompt-ului care poate conține {{variabile}}
}

// Detectăm toate variabilele unice de tip {{numevariabila}} din text
function extractVariables(text: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
        matches.add(match[1]); // Adăugăm numele variabilei (fără acolade)
    }
    return Array.from(matches);
}

// Înlocuiește toate aparițiile {{variabila}} cu valoarea corespunzătoare
function injectVariables(text: string, values: Record<string, string>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, name) => values[name] || `{{${name}}}`);
}

export function VariableInjector({ body }: VariableInjectorProps) {
    const variables = useMemo(() => extractVariables(body), [body]);
    const [values, setValues] = useState<Record<string, string>>({});

    // Nu afișăm nimic dacă nu există variabile în prompt
    if (variables.length === 0) return null;

    // Handler pentru actualizarea valorii unei variabile
    const handleChange = (name: string, value: string) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    // Copiază prompt-ul cu variabilele injectate în clipboard
    const handleCopy = () => {
        const injected = injectVariables(body, values);
        navigator.clipboard.writeText(injected);
        toast.success('Prompt copiat cu variabilele completate!');
    };

    return (
        <div className="variable-injector">
            <div className="variable-injector-header">
                <Zap size={14} />
                <span>Variabile detectate – completează înainte de a copia</span>
            </div>

            {/* Câte un input pentru fiecare variabilă unică detectată */}
            <div className="variable-inputs-grid">
                {variables.map(varName => (
                    <div key={varName} className="variable-input-group">
                        <label className="variable-label">
                            <code>{`{{${varName}}}`}</code>
                        </label>
                        <input
                            type="text"
                            className="variable-input"
                            placeholder={`Valoare pentru ${varName}`}
                            value={values[varName] || ''}
                            onChange={e => handleChange(varName, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            {/* Buton de copiere cu variabilele injectate */}
            <button className="btn-primary variable-copy-btn" onClick={handleCopy}>
                <Copy size={14} /> Copiază cu variabilele completate
            </button>
        </div>
    );
}
