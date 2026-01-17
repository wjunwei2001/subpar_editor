import { useEffect, useState } from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { FileTree } from './components/FileTree/FileTree';
import { TabBar } from './components/TabBar/TabBar';
import { MonacoEditor } from './components/Editor/MonacoEditor';
import { Terminal } from './components/Terminal/Terminal';
import { GitPanel } from './components/Git/GitPanel';
import { AgentsPanel } from './components/AgentsPanel/AgentsPanel';
import { StatusBar } from './components/StatusBar/StatusBar';
import { Preferences } from './components/Preferences/Preferences';
import { LootboxModal } from './components/Lootbox';
import { useEditorStore } from './store/editorStore';
import { useGitStore } from './store/gitStore';
import { useGachaStore } from './store/gachaStore';
import { useAgentStore } from './store/agentStore';
import { getBadgeLogoUrl } from '@shared/gachaConfig';

type RightPanelTab = 'git' | 'agent';

function App() {
  const { currentFolder, activeFile, setTerminalId, preferencesOpen, setPreferencesOpen, colorMode, themePreference } = useEditorStore();
  const { refreshStatus } = useGitStore();
  const { checkTimers: checkGachaTimers, cursorBadge } = useGachaStore();
  const { checkTimers: checkAgentTimers } = useAgentStore();
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('git');

  useEffect(() => {
    // Create terminal on app start
    window.electronAPI.terminal.create().then((id) => {
      setTerminalId(id);
    });
  }, [setTerminalId]);

  // Check gacha and agent timers every second
  useEffect(() => {
    const timerInterval = setInterval(() => {
      checkGachaTimers();
      checkAgentTimers();
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [checkGachaTimers, checkAgentTimers]);

  // Apply theme class based on color mode and theme preference
  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-eye-pain');

    if (colorMode === 'negative') {
      // Eye pain mode overrides user preference
      root.classList.add('theme-eye-pain');
    } else {
      // Positive and neutral modes use user preference
      root.classList.add(themePreference === 'light' ? 'theme-light' : 'theme-dark');
    }
  }, [colorMode, themePreference]);

  // Apply custom cursor based on badge
  useEffect(() => {
    if (cursorBadge) {
      const logoUrl = getBadgeLogoUrl(cursorBadge);

      // Create a small cursor image (32x32) from the badge logo
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw white background circle
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.fill();

          // Draw the logo scaled down
          const padding = 4;
          ctx.drawImage(img, padding, padding, size - padding * 2, size - padding * 2);

          // Convert to cursor
          const cursorUrl = canvas.toDataURL('image/png');
          document.body.style.cursor = `url('${cursorUrl}') 16 16, auto`;
        }
      };
      img.src = logoUrl;
    } else {
      document.body.style.cursor = '';
    }

    return () => {
      document.body.style.cursor = '';
    };
  }, [cursorBadge]);

  // Refresh git status when folder changes
  useEffect(() => {
    if (currentFolder) {
      refreshStatus(currentFolder);
      // Set up periodic refresh
      const interval = setInterval(() => {
        refreshStatus(currentFolder);
      }, 5000);

      // Start file watcher
      window.electronAPI.watcher?.start?.(currentFolder);

      return () => {
        clearInterval(interval);
        window.electronAPI.watcher?.stop?.();
      };
    } else {
      // Stop watcher when folder closes
      window.electronAPI.watcher?.stop?.();
    }
  }, [currentFolder, refreshStatus]);

  // Listen for external file changes
  useEffect(() => {
    const handleFileChanged = (_event: any, data: { path: string; content: string }) => {
      const { handleFileChanged } = useEditorStore.getState();
      handleFileChanged(data.path, data.content);
    };

    window.electronAPI.onFileChanged?.(handleFileChanged);

    return () => {
      // Clean up listener - ipcRenderer.removeListener doesn't exist in exposed API
      // Just let it be cleaned up when component unmounts
    };
  }, []);

  return (
    <div className="app-container">
      <Toolbar />
      <div className="main-content">
        <div className="sidebar">
          <div className="sidebar-header">Explorer</div>
          {currentFolder ? (
            <FileTree />
          ) : (
            <div className="empty-state" style={{ padding: '20px', textAlign: 'center' }}>
              <span>No folder opened</span>
            </div>
          )}
        </div>
        <div className="editor-area">
          <TabBar />
          <div className="editor-container">
            {activeFile ? (
              <MonacoEditor />
            ) : (
              <div className="empty-state">
                <span>Select a file to start editing</span>
              </div>
            )}
          </div>
          <div className="terminal-container">
            <div className="terminal-header">Terminal</div>
            <div className="terminal-content">
              <Terminal />
            </div>
          </div>
        </div>
        <div className="right-sidebar">
          <div className="right-sidebar-tabs">
            <button
              className={`right-tab ${rightPanelTab === 'git' ? 'active' : ''}`}
              onClick={() => setRightPanelTab('git')}
            >
              Source Control
            </button>
            <button
              className={`right-tab ${rightPanelTab === 'agent' ? 'active' : ''}`}
              onClick={() => setRightPanelTab('agent')}
            >
              AI Agent
            </button>
          </div>
          {rightPanelTab === 'git' ? <GitPanel /> : <AgentsPanel />}
        </div>
      </div>
      <StatusBar />
      <Preferences
        isOpen={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
      <LootboxModal />
    </div>
  );
}

export default App;
