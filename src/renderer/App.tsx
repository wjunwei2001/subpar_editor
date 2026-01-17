import { useEffect } from 'react';
import { Toolbar } from './components/Toolbar/Toolbar';
import { FileTree } from './components/FileTree/FileTree';
import { MonacoEditor } from './components/Editor/MonacoEditor';
import { Terminal } from './components/Terminal/Terminal';
import { useEditorStore } from './store/editorStore';

function App() {
  const { currentFolder, currentFile, setTerminalId } = useEditorStore();

  useEffect(() => {
    // Create terminal on app start
    window.electronAPI.terminal.create().then((id) => {
      setTerminalId(id);
    });
  }, [setTerminalId]);

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
          <div className="editor-container">
            {currentFile ? (
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
      </div>
    </div>
  );
}

export default App;
