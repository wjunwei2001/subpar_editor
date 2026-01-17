import { useGitStore } from '../../store/gitStore';
import { useEditorStore } from '../../store/editorStore';

export function StatusBar() {
  const { currentBranch, isRepo } = useGitStore();
  const { activeFile, lspMode, setPreferencesOpen, autocompleteMode, autocompleteQuota } = useEditorStore();

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
      </div>
      <div className="status-bar-right">
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
