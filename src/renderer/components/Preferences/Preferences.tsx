import { useEditorStore, LspMode } from '../../store/editorStore';

interface PreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Preferences({ isOpen, onClose }: PreferencesProps) {
  const { lspMode, setLspMode } = useEditorStore();

  if (!isOpen) return null;

  const handleLspModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLspMode(e.target.value as LspMode);
  };

  return (
    <div className="preferences-overlay" onClick={onClose}>
      <div className="preferences-panel" onClick={(e) => e.stopPropagation()}>
        <div className="preferences-header">
          <h2>Preferences</h2>
          <button className="preferences-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="preferences-content">
          {/* Language Server Settings */}
          <div className="preferences-section">
            <h3>Language Server</h3>

            <div className="preferences-row">
              <span className="preferences-label">LSP Mode</span>
              <select
                className="preferences-select"
                value={lspMode}
                onChange={handleLspModeChange}
              >
                <option value="lsp">Enabled</option>
                <option value="off">Disabled</option>
                <option value="random">Random</option>
              </select>
            </div>
          </div>

          {/* Editor Settings */}
          <div className="preferences-section">
            <h3>Editor</h3>

            <div className="preferences-row disabled">
              <span className="preferences-label">Font Size</span>
              <span className="preferences-value">14px</span>
            </div>

            <div className="preferences-row disabled">
              <span className="preferences-label">Word Wrap</span>
              <span className="preferences-value">On</span>
            </div>

            <div className="preferences-row disabled">
              <span className="preferences-label">Minimap</span>
              <span className="preferences-value">On</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
