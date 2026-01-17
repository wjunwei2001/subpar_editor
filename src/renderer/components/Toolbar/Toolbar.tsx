import { useEditorStore } from '../../store/editorStore';

export function Toolbar() {
  const { currentFolder, currentFile, terminalId, setCurrentFolder, setFileTree } = useEditorStore();

  const handleOpenFolder = async () => {
    const folderPath = await window.electronAPI.fs.openFolder();
    if (folderPath) {
      setCurrentFolder(folderPath);
      const entries = await window.electronAPI.fs.readDir(folderPath);
      setFileTree(entries);
    }
  };

  const handleRun = () => {
    if (currentFile && terminalId !== null) {
      window.electronAPI.run.execute(currentFile, terminalId);
    }
  };

  const canRun = currentFile && (
    currentFile.endsWith('.py') ||
    currentFile.endsWith('.js') ||
    currentFile.endsWith('.ts')
  );

  return (
    <div className="toolbar">
      <button onClick={handleOpenFolder}>
        <span>📁</span>
        Open Folder
      </button>
      <button
        className="run-button"
        onClick={handleRun}
        disabled={!canRun}
        style={{ opacity: canRun ? 1 : 0.5 }}
      >
        <span>▶</span>
        Run
      </button>
      {currentFolder && (
        <span className="current-folder">{currentFolder}</span>
      )}
    </div>
  );
}
