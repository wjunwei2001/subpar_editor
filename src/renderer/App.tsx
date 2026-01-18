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
import { MatrixBackground } from './components/BackgroundAnimation/MatrixBackground';
import { FolderTree, FolderOpen, FlaskConical, Compass } from './components/Icons';
import { useEditorStore } from './store/editorStore';
import { useGitStore } from './store/gitStore';
import { useGachaStore } from './store/gachaStore';
import { useAgentStore } from './store/agentStore';
import { getBadgeLogoUrl } from '@shared/gachaConfig';

type RightPanelTab = 'git' | 'agent';

function App() {
  const { currentFolder, activeFile, setTerminalId, preferencesOpen, setPreferencesOpen, colorMode, themePreference, aspectRatioMode } = useEditorStore();
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

  // Apply random aspect ratio in negative mode
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (aspectRatioMode === 'negative') {
      const ratios = ['32/9', '9/32', '21/9', '4/3', '3/4', '5/1', '1/5'];

      const applyRandomRatio = () => {
        const editorContainer = document.querySelector('.editor-container') as HTMLElement;
        if (editorContainer) {
          const randomRatio = ratios[Math.floor(Math.random() * ratios.length)];
          editorContainer.style.aspectRatio = randomRatio;
        }
      };

      // Apply initial random ratio
      applyRandomRatio();

      // Set up interval to change ratio every 5 seconds
      intervalId = setInterval(applyRandomRatio, 5000);
    } else {
      // Reset inline aspect ratio style when not in negative mode
      const editorContainer = document.querySelector('.editor-container') as HTMLElement;
      if (editorContainer) {
        editorContainer.style.aspectRatio = '';
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      // Clean up inline style on unmount
      const editorContainer = document.querySelector('.editor-container') as HTMLElement;
      if (editorContainer) {
        editorContainer.style.aspectRatio = '';
      }
    };
  }, [aspectRatioMode]);

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
          <div className="pane-header">
            <span className="pane-title">
              <span className="pane-icon"><FolderTree size={14} strokeWidth={2} /></span>
              Explorer
            </span>
            <span className="pane-subtitle">Workspace</span>
          </div>
          {currentFolder ? (
            <FileTree />
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon"><FolderOpen size={32} strokeWidth={1.5} /></span>
              <span className="empty-state-title">No workspace loaded</span>
              <span className="empty-state-hint">Open a folder to start your next hack.</span>
            </div>
          )}
        </div>
        <div className="editor-area">
          <TabBar />
          <div className="editor-wrapper">
            <div className={`editor-container aspect-ratio-${aspectRatioMode}`}>
              {activeFile ? (
                <MonacoEditor />
              ) : (
                <div className="empty-state">
                  <MatrixBackground />
                  <span className="empty-state-icon"><FlaskConical size={32} strokeWidth={1.5} /></span>
                  <span className="empty-state-title">Pick a file to begin</span>
                  <span className="empty-state-hint">Your next experiment is one click away.</span>
                </div>
              )}
            </div>
          </div>
          <div className="terminal-container">
            <div className="terminal-header pane-header">
              <span className="pane-title">
              <span className="pane-icon">{'>_'}</span>
                Terminal
              </span>
              <span className="pane-subtitle">Session</span>
            </div>
            <div className="terminal-content">
              <Terminal />
            </div>
          </div>
        </div>
        <div className="right-sidebar">
          <div className="pane-header">
            <span className="pane-title">
              <span className="pane-icon"><Compass size={14} strokeWidth={2} /></span>
              Control Room
            </span>
            <span className="pane-subtitle">Ops</span>
          </div>
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
