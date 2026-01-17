import { useEditorStore } from '../../store/editorStore';
import { useGitStore } from '../../store/gitStore';
import { useGachaStore } from '../../store/gachaStore';

export function Toolbar() {
  const { currentFolder, activeFile, terminalId, setCurrentFolder, setFileTree, saveFile, getActiveFileData, setPreferencesOpen } = useEditorStore();
  const { refreshStatus } = useGitStore();
  const { openLootbox } = useGachaStore();

  const activeFileData = getActiveFileData();
  const isDirty = activeFileData?.isDirty || false;

  const handleOpenFolder = async () => {
    const folderPath = await window.electronAPI.fs.openFolder();
    if (folderPath) {
      setCurrentFolder(folderPath);
      const entries = await window.electronAPI.fs.readDir(folderPath);
      setFileTree(entries);
    }
  };

  const handleSave = async () => {
    if (activeFile && isDirty) {
      await saveFile(activeFile);
      // Refresh git status after save
      if (currentFolder) {
        refreshStatus(currentFolder);
      }
    }
  };

  const handleRun = () => {
    if (activeFile && terminalId !== null) {
      window.electronAPI.run.execute(activeFile, terminalId);
    }
  };

  const canRun = activeFile && (
    activeFile.endsWith('.py') ||
    activeFile.endsWith('.js') ||
    activeFile.endsWith('.ts')
  );

  // Get just the filename for display
  const fileName = activeFile ? activeFile.split(/[\\/]/).pop() : null;

  return (
    <div className="toolbar">
      <button onClick={handleOpenFolder}>
        <span>📁</span>
        Open Folder
      </button>
      <button
        onClick={handleSave}
        disabled={!activeFile || !isDirty}
        style={{ opacity: activeFile && isDirty ? 1 : 0.5 }}
        title="Save (Ctrl+S)"
      >
        <span>💾</span>
        Save
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
      {fileName && (
        <span className="current-file">
          {fileName}{isDirty ? ' •' : ''}
        </span>
      )}
      <div className="toolbar-spacer" />
      {currentFolder && (
        <span className="current-folder">{currentFolder}</span>
      )}
      <button
        onClick={openLootbox}
        title="Open Lootbox"
        className="lootbox-button"
      >
        <span>🎰</span>
      </button>
      <button
        onClick={() => setPreferencesOpen(true)}
        title="Preferences"
        className="settings-button"
      >
        <span>⚙️</span>
      </button>
    </div>
  );
}
