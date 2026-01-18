import { useEffect, useState } from 'react';
import { useGitStore } from '../../store/gitStore';
import { useEditorStore } from '../../store/editorStore';
import { useGachaStore } from '../../store/gachaStore';
import { GitBranch, ShieldCheck, Sparkles, Skull, Dices } from '../Icons';

const STATUS_MESSAGES = [
  'Hack mode: make it weird.',
  'Quest log: ship something fun.',
  'Status: gloriously unfinished.',
  'Lootbox protocol: stand by.',
  'Subpar plan, excellent execution.',
];

export function StatusBar() {
  const { currentBranch, isRepo } = useGitStore();
  const { activeFile, lspMode, setPreferencesOpen, autocompleteMode, autocompleteQuota } = useEditorStore();
  const { activeEffects, hasImmunity, getTotalLootboxes } = useGachaStore();
  const [showEffectsTooltip, setShowEffectsTooltip] = useState(false);
  const [statusMessage, setStatusMessage] = useState(STATUS_MESSAGES[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % STATUS_MESSAGES.length;
      setStatusMessage(STATUS_MESSAGES[index]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

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

  const iconProps = { size: 14, strokeWidth: 2 };

  return (
    <div className="status-bar">
      <div className="status-bar-left">
        {isRepo && currentBranch && (
          <span className="status-item status-pill branch">
            <GitBranch {...iconProps} className="branch-icon" />
            {currentBranch}
          </span>
        )}
        <div
          className="status-effects"
          onMouseEnter={() => activeEffects.length > 0 && setShowEffectsTooltip(true)}
          onMouseLeave={() => setShowEffectsTooltip(false)}
        >
          {hasImmunity && (
            <span className="effect-indicator immunity" title="Immune to curses">
              <ShieldCheck {...iconProps} /> Immunity
            </span>
          )}
          {displayEffects.map((effect) => (
            <span
              key={effect.id}
              className={`effect-indicator ${effect.type}`}
              title={effect.feature}
            >
              {effect.type === 'positive' ? <Sparkles {...iconProps} /> : <Skull {...iconProps} />}
              {effect.feature}
              <span className="effect-timer">{formatTimeRemaining(effect.expiresAt)}</span>
            </span>
          ))}
          {activeEffects.length > 3 && (
            <span className="status-item">+{activeEffects.length - 3} more</span>
          )}

          {/* Tooltip showing all active effects */}
          {showEffectsTooltip && activeEffects.length > 0 && (
            <div className="effects-tooltip">
              <div className="effects-tooltip-header">All Active Effects</div>
              <div className="effects-tooltip-list">
                {activeEffects.map((effect) => (
                  <div
                    key={effect.id}
                    className={`effects-tooltip-item ${effect.type}`}
                  >
                    <span className="effects-tooltip-icon">
                      {effect.type === 'positive' ? <Sparkles {...iconProps} /> : <Skull {...iconProps} />}
                    </span>
                    <span className="effects-tooltip-name">{effect.feature}</span>
                    <span className="effects-tooltip-timer">
                      {formatTimeRemaining(effect.expiresAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="status-bar-center">
        <span className="status-pill">{statusMessage}</span>
      </div>
      <div className="status-bar-right">
        {getTotalLootboxes() > 0 && (
          <span className="status-item status-pill lootbox-indicator">
            <Dices {...iconProps} /> {getTotalLootboxes()}
          </span>
        )}
        <span className={`status-item status-pill ${getAutocompleteClass()}`}>
          {getAutocompleteStatus()}
        </span>
        <span
          className={`status-item status-pill lsp-mode ${lspMode}`}
          onClick={() => setPreferencesOpen(true)}
          title="Click to change LSP mode"
        >
          {getLspModeLabel()}
        </span>
        {activeFile && (
          <>
            <span className="status-item status-pill">{getLanguage(activeFile)}</span>
            <span className="status-item status-pill">UTF-8</span>
          </>
        )}
      </div>
    </div>
  );
}
