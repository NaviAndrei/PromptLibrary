import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FileText, FileJson, X } from 'lucide-react';
import type { Prompt } from '../types';

interface ExportModalProps {
  prompt: Prompt;
  onClose: () => void;
  onExportMD: (p: Prompt) => void;
  onExportJSON: (p: Prompt) => void;
}

export function ExportModal({
  prompt,
  onClose,
  onExportMD,
  onExportJSON,
}: ExportModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleExportMD = () => {
    onExportMD(prompt);
    onClose();
  };

  const handleExportJSON = () => {
    onExportJSON(prompt);
    onClose();
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content export-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        <div className="modal-header">
          <h3 id="export-modal-title">Export "{prompt.title}"</h3>
          <button className="btn-icon" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={handleExportMD}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <FileText size={16} /> Download as Markdown (.md)
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleExportJSON}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <FileJson size={16} /> Download as JSON (.json)
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
