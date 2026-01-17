import { useEditorStore, LspMode, AutocompleteMode, TextSizeMode } from '../../store/editorStore';

interface PreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Preferences({ isOpen, onClose }: PreferencesProps) {
  const {
    lspMode,
    setLspMode,
    autocompleteMode,
    autocompleteQuota,
    setAutocompleteMode,
    setAutocompleteQuota,
    textSizeMode,
    setTextSizeMode,
  } = useEditorStore();

  if (!isOpen) return null;

  const handleLspModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLspMode(e.target.value as LspMode);
  };

  const handleAutocompleteModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAutocompleteMode(e.target.value as AutocompleteMode);
  };

  const handleAutocompleteQuotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setAutocompleteQuota(value);
    }
  };

  const handleTextSizeModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTextSizeMode(e.target.value as TextSizeMode);
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

          {/* Autocomplete Settings */}
          <div className="preferences-section">
            <h3>Autocomplete</h3>

            <div className="preferences-row">
              <span className="preferences-label">Mode</span>
              <select
                className="preferences-select"
                value={autocompleteMode}
                onChange={handleAutocompleteModeChange}
              >
                <option value="positive">Enabled (uses quota)</option>
                <option value="neutral">Disabled</option>
                <option value="negative">Cursed</option>
              </select>
            </div>

            <div className="preferences-row">
              <span className="preferences-label">Quota</span>
              <input
                type="number"
                min="0"
                className="preferences-input"
                value={autocompleteQuota}
                onChange={handleAutocompleteQuotaChange}
              />
            </div>
          </div>

          {/* Editor Settings */}
          <div className="preferences-section">
            <h3>Editor</h3>

            <div className="preferences-row">
              <span className="preferences-label">Font Size</span>
              <select
                className="preferences-select"
                value={textSizeMode}
                onChange={handleTextSizeModeChange}
              >
                <option value="neutral">Normal (14px)</option>
                <option value="negative">Tiny (6px)</option>
              </select>
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
