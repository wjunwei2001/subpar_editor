import { useGitStore } from '../../store/gitStore';
import { useEditorStore } from '../../store/editorStore';

export function StatusBar() {
  const { currentBranch, isRepo } = useGitStore();
  const { currentFile } = useEditorStore();

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
        {currentFile && (
          <>
            <span className="status-item">{getLanguage(currentFile)}</span>
            <span className="status-item">UTF-8</span>
          </>
        )}
      </div>
    </div>
  );
}
