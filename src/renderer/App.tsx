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
import { useEditorStore } from './store/editorStore';
import { useGitStore } from './store/gitStore';

type RightPanelTab = 'git' | 'agent';

function App() {
  const { currentFolder, activeFile, setTerminalId, preferencesOpen, setPreferencesOpen } = useEditorStore();
  const { refreshStatus } = useGitStore();
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('git');

  useEffect(() => {
    // Create terminal on app start
    window.electronAPI.terminal.create().then((id) => {
      setTerminalId(id);
    });
  }, [setTerminalId]);

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
    </div>
  );
}

export default App;
