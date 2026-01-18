import { useEditorStore, ThemePreference } from '../../store/editorStore';
import { useAgentStore } from '../../store/agentStore';

interface PreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper to get status indicator
function StatusBadge({ mode }: { mode: 'positive' | 'neutral' | 'negative' | string }) {
  const labels: Record<string, { text: string; className: string }> = {
    positive: { text: 'BLESSED', className: 'status-positive' },
    neutral: { text: 'LOCKED', className: 'status-neutral' },
    negative: { text: 'CURSED', className: 'status-negative' },
    lsp: { text: 'BLESSED', className: 'status-positive' },
    off: { text: 'LOCKED', className: 'status-neutral' },
    random: { text: 'CURSED', className: 'status-negative' },
    visible: { text: 'NORMAL', className: 'status-neutral' },
    invisible: { text: 'CURSED', className: 'status-negative' },
  };
  const { text, className } = labels[mode] || { text: mode.toUpperCase(), className: 'status-neutral' };
  return <span className={`status-badge ${className}`}>{text}</span>;
}

export function Preferences({ isOpen, onClose }: PreferencesProps) {
  const {
    lspMode,
    autocompleteMode,
    autocompleteQuota,
    textSizeMode,
    colorMode,
    themePreference,
    setThemePreference,
    codeEditingMode,
    codeEditingQuota,
    codeVisibilityMode,
    aspectRatioMode,
    gitMode,
  } = useEditorStore();

  const { state: agentState, quota: agentQuota } = useAgentStore();

  if (!isOpen) return null;

  // Theme selection only available when colorMode is 'positive' (blessing)
  const canSelectTheme = colorMode === 'positive';

  const handleThemePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (canSelectTheme) {
      setThemePreference(e.target.value as ThemePreference);
    }
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
          <div className="preferences-notice">
            Settings are controlled by the Gacha system. Pull lootboxes to unlock blessings or risk curses!
          </div>

          {/* Language Server */}
          <div className="preferences-section">
            <h3>Language Server</h3>
            <div className="preferences-row">
              <span className="preferences-label">Status</span>
              <StatusBadge mode={lspMode} />
            </div>
            <div className="preferences-row disabled">
              <span className="preferences-label">Current</span>
              <span className="preferences-value">
                {lspMode === 'lsp' ? 'Full LSP Active' : lspMode === 'off' ? 'Disabled' : 'Random Chaos'}
              </span>
            </div>
          </div>

          {/* Autocomplete */}
          <div className="preferences-section">
            <h3>Autocomplete</h3>
            <div className="preferences-row">
              <span className="preferences-label">Status</span>
              <StatusBadge mode={autocompleteMode} />
            </div>
            <div className="preferences-row disabled">
              <span className="preferences-label">Quota</span>
              <span className="preferences-value">
                {autocompleteMode === 'positive' ? `${autocompleteQuota} tokens` : autocompleteMode === 'neutral' ? 'Disabled' : 'Passive-aggressive mode'}
              </span>
            </div>
          </div>

          {/* Code Editing */}
          <div className="preferences-section">
            <h3>Code Editing</h3>
            <div className="preferences-row">
              <span className="preferences-label">Status</span>
              <StatusBadge mode={codeEditingMode} />
            </div>
            <div className="preferences-row disabled">
              <span className="preferences-label">Quota</span>
              <span className="preferences-value">
                {codeEditingMode === 'positive' ? `${codeEditingQuota} chars` : codeEditingMode === 'neutral' ? 'Read-only' : 'Random deletions active'}
              </span>
            </div>
          </div>

          {/* Appearance */}
          <div className="preferences-section">
            <h3>Appearance</h3>
            <div className="preferences-row">
              <span className="preferences-label">Color Mode</span>
              <StatusBadge mode={colorMode} />
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
                <span className="preferences-value">
                  {colorMode === 'negative' ? 'Eye Pain (cursed)' : 'Light mode only'}
                </span>
              )}
            </div>
            <div className="preferences-row">
              <span className="preferences-label">Code Visibility</span>
              <StatusBadge mode={codeVisibilityMode} />
            </div>
          </div>

          {/* Text Size */}
          <div className="preferences-section">
            <h3>Text Size</h3>
            <div className="preferences-row">
              <span className="preferences-label">Status</span>
              <StatusBadge mode={textSizeMode} />
            </div>
            <div className="preferences-row disabled">
              <span className="preferences-label">Size</span>
              <span className="preferences-value">
                {textSizeMode === 'positive' ? 'Adjustable' : textSizeMode === 'neutral' ? '14px (fixed)' : '6px (tiny)'}
              </span>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="preferences-section">
            <h3>Aspect Ratio</h3>
            <div className="preferences-row">
              <span className="preferences-label">Status</span>
              <StatusBadge mode={aspectRatioMode} />
            </div>
            <div className="preferences-row disabled">
              <span className="preferences-label">Current</span>
              <span className="preferences-value">
                {aspectRatioMode === 'positive' ? '16:9 Normal' : aspectRatioMode === 'neutral' ? '1:1 Square' : 'Distorted'}
              </span>
            </div>
          </div>

          {/* Git */}
          <div className="preferences-section">
            <h3>Git Integration</h3>
            <div className="preferences-row">
              <span className="preferences-label">Status</span>
              <StatusBadge mode={gitMode} />
            </div>
            <div className="preferences-row disabled">
              <span className="preferences-label">Current</span>
              <span className="preferences-value">
                {gitMode === 'positive' ? 'Full access' : gitMode === 'neutral' ? 'Disabled' : 'Destructive ops active!'}
              </span>
            </div>
          </div>

          {/* Agent Panel */}
          <div className="preferences-section">
            <h3>AI Agent</h3>
            <div className="preferences-row">
              <span className="preferences-label">Status</span>
              <StatusBadge mode={agentState} />
            </div>
            <div className="preferences-row disabled">
              <span className="preferences-label">Current</span>
              <span className="preferences-value">
                {agentState === 'positive' ? `AI Active (${agentQuota} tokens)` : agentState === 'neutral' ? 'Disabled' : 'Ad space mode'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
