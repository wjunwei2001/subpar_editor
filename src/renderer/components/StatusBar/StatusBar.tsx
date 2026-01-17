import { useGitStore } from '../../store/gitStore';
import { useEditorStore } from '../../store/editorStore';
import { useGachaStore } from '../../store/gachaStore';

export function StatusBar() {
  const { currentBranch, isRepo } = useGitStore();
  const { activeFile, lspMode, setPreferencesOpen, autocompleteMode, autocompleteQuota } = useEditorStore();
  const { activeEffects, hasImmunity, getTotalLootboxes } = useGachaStore();

  // Format remaining time
  const formatTimeRemaining = (expiresAt: number) => {
    const remaining = Math.max(0, expiresAt - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get top 3 effects to display
  const displayEffects = activeEffects.slice(0, 3);

  const getLspModeLabel = () => {
    switch (lspMode) {
      case 'lsp': return 'LSP: On';
      case 'off': return 'LSP: Off';
      case 'random': return 'LSP: Random';
    }
  };

  const getAutocompleteStatus = () => {
    switch (autocompleteMode) {
      case 'positive':
        return `AC: ${autocompleteQuota}`;
      case 'neutral':
        return 'AC: OFF';
      case 'negative':
        return 'AC: CURSED';
    }
  };

  const getAutocompleteClass = () => {
    switch (autocompleteMode) {
      case 'positive':
        return autocompleteQuota < 10 ? 'status-warning' : '';
      case 'negative':
        return 'status-danger';
      default:
        return 'status-muted';
    }
  };

  const getLanguage = (filePath: string | null): string => {
    if (!filePath) return '';
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'JavaScript';
      case 'ts':
      case 'tsx':
        return 'TypeScript';
      case 'py':
        return 'Python';
      case 'json':
        return 'JSON';
      case 'html':
        return 'HTML';
      case 'css':
        return 'CSS';
      case 'md':
        return 'Markdown';
      default:
        return 'Plain Text';
    }
  };

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        {isRepo && currentBranch && (
          <span className="status-item branch">
            <span className="branch-icon">⎇</span>
            {currentBranch}
          </span>
        )}
        <div className="status-effects">
          {hasImmunity && (
            <span className="effect-indicator immunity" title="Immune to curses">
              🛡️ Immunity
            </span>
          )}
          {displayEffects.map((effect) => (
            <span
              key={effect.id}
              className={`effect-indicator ${effect.type}`}
              title={effect.feature}
            >
              {effect.type === 'positive' ? '✨' : '💀'}
              {effect.feature}
              <span className="effect-timer">{formatTimeRemaining(effect.expiresAt)}</span>
            </span>
          ))}
          {activeEffects.length > 3 && (
            <span className="status-item">+{activeEffects.length - 3} more</span>
          )}
        </div>
      </div>
      <div className="status-bar-right">
        {getTotalLootboxes() > 0 && (
          <span className="status-item" style={{ color: '#ff9800' }}>
            🎰 {getTotalLootboxes()}
          </span>
        )}
        <span className={`status-item ${getAutocompleteClass()}`}>
          {getAutocompleteStatus()}
        </span>
        <span
          className={`status-item lsp-mode ${lspMode}`}
          onClick={() => setPreferencesOpen(true)}
          title="Click to change LSP mode"
        >
          {getLspModeLabel()}
        </span>
        {activeFile && (
          <>
            <span className="status-item">{getLanguage(activeFile)}</span>
            <span className="status-item">UTF-8</span>
          </>
        )}
      </div>
    </div>
  );
}
