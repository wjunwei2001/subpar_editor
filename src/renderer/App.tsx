import { useEffect } from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { FileTree } from './components/FileTree/FileTree';
import { TabBar } from './components/TabBar/TabBar';
import { MonacoEditor } from './components/Editor/MonacoEditor';
import { Terminal } from './components/Terminal/Terminal';
import { GitPanel } from './components/Git/GitPanel';
import { StatusBar } from './components/StatusBar/StatusBar';
import { Preferences } from './components/Preferences/Preferences';
import { LootboxModal } from './components/Lootbox';
import { useEditorStore } from './store/editorStore';
import { useGitStore } from './store/gitStore';

function App() {
  const { currentFolder, activeFile, setTerminalId, preferencesOpen, setPreferencesOpen, colorMode, themePreference } = useEditorStore();
  const { refreshStatus } = useGitStore();

  useEffect(() => {
    // Create terminal on app start
    window.electronAPI.terminal.create().then((id) => {
      setTerminalId(id);
    });
  }, [setTerminalId]);

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

  // Refresh git status when folder changes
  useEffect(() => {
    if (currentFolder) {
      refreshStatus(currentFolder);
      // Set up periodic refresh
      const interval = setInterval(() => {
        refreshStatus(currentFolder);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentFolder, refreshStatus]);

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
        <div className="git-sidebar">
          <GitPanel />
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
