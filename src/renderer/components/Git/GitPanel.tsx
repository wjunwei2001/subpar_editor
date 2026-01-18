import { useState } from 'react';
import { useGitStore } from '../../store/gitStore';
import { useEditorStore } from '../../store/editorStore';

export function GitPanel() {
  const { status, isRepo, stageFiles, unstageFiles, commit, refreshStatus } = useGitStore();
  const { currentFolder, gitMode } = useEditorStore();
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);

  if (!currentFolder || !isRepo) {
    return (
      <div className="git-panel">
        <div className="git-panel-header">Source Control</div>
        <div className="git-panel-empty">
          {currentFolder ? 'Not a git repository' : 'Open a folder to see git status'}
        </div>
      </div>
    );
  }

  // Neutral mode - show disabled message
  if (gitMode === 'neutral') {
    return (
      <div className="git-panel">
        <div className="git-panel-header">Source Control</div>
        <div className="git-panel-neutral-message">
          <div className="git-panel-neutral-icon">🔒</div>
          <div className="git-panel-neutral-text">Git features disabled</div>
          <div className="git-panel-neutral-hint">
            Pull a lootbox to unlock git integration!
          </div>
        </div>
      </div>
    );
  }

  const stagedFiles = status?.files.filter((f) => f.index !== ' ' && f.index !== '?') || [];
  const changedFiles = status?.files.filter((f) => f.workingDir !== ' ' || f.index === '?') || [];

  const handleStageAll = async () => {
    const files = changedFiles.map((f) => f.path);
    if (files.length > 0) {
      await stageFiles(currentFolder, files);
    }
  };

  const handleUnstageAll = async () => {
    const files = stagedFiles.map((f) => f.path);
    if (files.length > 0) {
      await unstageFiles(currentFolder, files);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    setIsCommitting(true);
    try {
      await commit(currentFolder, commitMessage);
      setCommitMessage('');
    } catch (error) {
      console.error('Commit failed:', error);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleRefresh = () => {
    refreshStatus(currentFolder);
  };

  return (
    <div className="git-panel">
      <div className="git-panel-header">
        <span>Source Control</span>
        <button className="icon-button" onClick={handleRefresh} title="Refresh">
          ↻
        </button>
      </div>

      {/* Negative mode warning */}
      {gitMode === 'negative' && (
        <div className="git-panel-negative-warning">
          <div className="git-panel-negative-warning-icon">⚠️</div>
          <div className="git-panel-negative-warning-text">
            CURSED MODE: Git operations may behave unexpectedly!
          </div>
        </div>
      )}

      <div className="git-panel-commit">
        <textarea
          className="commit-input"
          placeholder="Commit message"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          rows={3}
        />
        <button
          className="commit-button"
          onClick={handleCommit}
          disabled={!commitMessage.trim() || stagedFiles.length === 0 || isCommitting}
        >
          {isCommitting ? 'Committing...' : 'Commit'}
        </button>
      </div>

      {stagedFiles.length > 0 && (
        <div className="git-panel-section">
          <div className="git-section-header">
            <span>Staged Changes ({stagedFiles.length})</span>
            <button className="icon-button" onClick={handleUnstageAll} title="Unstage All">
              −
            </button>
          </div>
          <ul className="git-file-list">
            {stagedFiles.map((file) => (
              <li key={file.path} className="git-file-item">
                <span className="git-file-status" style={{ color: getStatusColor(file.index) }}>
                  {file.index}
                </span>
                <span className="git-file-name">{file.path}</span>
                <button
                  className="icon-button"
                  onClick={() => unstageFiles(currentFolder, [file.path])}
                  title="Unstage"
                >
                  −
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {changedFiles.length > 0 && (
        <div className="git-panel-section">
          <div className="git-section-header">
            <span>Changes ({changedFiles.length})</span>
            <button className="icon-button" onClick={handleStageAll} title="Stage All">
              +
            </button>
          </div>
          <ul className="git-file-list">
            {changedFiles.map((file) => (
              <li key={file.path} className="git-file-item">
                <span
                  className="git-file-status"
                  style={{ color: getStatusColor(file.index === '?' ? '?' : file.workingDir) }}
                >
                  {file.index === '?' ? 'U' : file.workingDir}
                </span>
                <span className="git-file-name">{file.path}</span>
                <button
                  className="icon-button"
                  onClick={() => stageFiles(currentFolder, [file.path])}
                  title="Stage"
                >
                  +
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {stagedFiles.length === 0 && changedFiles.length === 0 && (
        <div className="git-panel-empty">No changes</div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'M':
      return '#e2c08d';
    case 'A':
      return '#73c991';
    case 'D':
      return '#f14c4c';
    case '?':
      return '#73c991';
    default:
      return 'inherit';
  }
}
