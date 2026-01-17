import { useEditorStore, LspMode, AutocompleteMode, TextSizeMode, ColorMode, ThemePreference, CodeEditingMode, CodeVisibilityMode } from '../../store/editorStore';

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
    colorMode,
    setColorMode,
    themePreference,
    setThemePreference,
    codeEditingMode,
    codeEditingQuota,
    setCodeEditingMode,
    setCodeEditingQuota,
    codeVisibilityMode,
    setCodeVisibilityMode,
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

  const handleColorModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColorMode(e.target.value as ColorMode);
  };

  const handleThemePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setThemePreference(e.target.value as ThemePreference);
  };

  const handleCodeEditingModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCodeEditingMode(e.target.value as CodeEditingMode);
  };

  const handleCodeEditingQuotaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setCodeEditingQuota(value);
    }
  };

  const handleCodeVisibilityModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCodeVisibilityMode(e.target.value as CodeVisibilityMode);
  };

  // Theme selection is only available in positive or neutral mode
  const canSelectTheme = colorMode !== 'negative';

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

          {/* Appearance Settings */}
          <div className="preferences-section">
            <h3>Appearance</h3>

            <div className="preferences-row">
              <span className="preferences-label">Color Mode</span>
              <select
                className="preferences-select"
                value={colorMode}
                onChange={handleColorModeChange}
              >
                <option value="positive">Normal</option>
                <option value="neutral">Normal</option>
                <option value="negative">Eye Pain</option>
              </select>
            </div>

            <div className={`preferences-row ${!canSelectTheme ? 'disabled' : ''}`}>
              <span className="preferences-label">Theme</span>
              {canSelectTheme ? (
                <select
                  className="preferences-select"
                  value={themePreference}
                  onChange={handleThemePreferenceChange}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              ) : (
                <span className="preferences-value eye-pain-label">Eye Pain (locked)</span>
              )}
            </div>

            <div className="preferences-row">
              <span className="preferences-label">Code Visibility</span>
              <select
                className="preferences-select"
                value={codeVisibilityMode}
                onChange={handleCodeVisibilityModeChange}
              >
                <option value="visible">Visible</option>
                <option value="invisible">Invisible</option>
              </select>
            </div>
          </div>

          {/* Code Editing Settings */}
          <div className="preferences-section">
            <h3>Code Editing</h3>

            <div className="preferences-row">
              <span className="preferences-label">Mode</span>
              <select
                className="preferences-select"
                value={codeEditingMode}
                onChange={handleCodeEditingModeChange}
              >
                <option value="positive">Enabled (uses quota)</option>
                <option value="neutral">Read-only</option>
                <option value="negative">Cursed (random deletes)</option>
              </select>
            </div>

            <div className={`preferences-row ${codeEditingMode !== 'positive' ? 'disabled' : ''}`}>
              <span className="preferences-label">Quota</span>
              {codeEditingMode === 'positive' ? (
                <input
                  type="number"
                  min="0"
                  className="preferences-input"
                  value={codeEditingQuota}
                  onChange={handleCodeEditingQuotaChange}
                />
              ) : (
                <span className="preferences-value">
                  {codeEditingMode === 'neutral' ? 'N/A' : 'Unlimited chaos'}
                </span>
              )}
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
