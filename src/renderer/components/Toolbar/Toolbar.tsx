import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { useGitStore } from '../../store/gitStore';
import { useGachaStore } from '../../store/gachaStore';
import { ShopModal } from '../Shop/ShopModal';
import { Folder, Save, ShoppingCart, Dices, Settings } from '../Icons';

export function Toolbar() {
  const { currentFolder, activeFile, terminalId, setCurrentFolder, setFileTree, saveFile, getActiveFileData, setPreferencesOpen } = useEditorStore();
  const { getTotalLootboxes, openLootbox } = useGachaStore();
  const [shopOpen, setShopOpen] = useState(false);
  const { refreshStatus } = useGitStore();

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

  const iconProps = { size: 16, strokeWidth: 2 };

  return (
    <div className="toolbar">
      <div className="toolbar-brand">
        <span className="brand-title">Subpar</span>
        <span className="brand-subtitle">Editor</span>
      </div>
      <div className="toolbar-group">
        <button className="toolbar-button" onClick={handleOpenFolder}>
          <Folder {...iconProps} />
          Open Folder
        </button>
        <button
          className="toolbar-button"
          onClick={handleSave}
          disabled={!activeFile || !isDirty}
          style={{ opacity: activeFile && isDirty ? 1 : 0.5 }}
          title="Save (Ctrl+S)"
        >
          <Save {...iconProps} />
          Save
        </button>
      </div>
      <div className="toolbar-group">
        <button
          className="toolbar-button run-button"
          onClick={handleRun}
          disabled={!canRun}
          style={{ opacity: canRun ? 1 : 0.5 }}
        >
          <span>▶</span>
          Run
        </button>
        {fileName && (
          <span className="toolbar-pill current-file">
            {fileName}{isDirty ? ' •' : ''}
          </span>
        )}
      </div>
      <div className="toolbar-group toolbar-gacha-buttons">
        <button className="toolbar-button shop-btn" onClick={() => setShopOpen(true)}>
          <ShoppingCart {...iconProps} />
          Shop
        </button>
        <button className="toolbar-button gacha-btn" onClick={openLootbox}>
          <Dices {...iconProps} />
          Gacha
          {getTotalLootboxes() > 0 && (
            <span className="lootbox-count-badge">{getTotalLootboxes()}</span>
          )}
        </button>
      </div>
      <div className="toolbar-spacer" />
      {currentFolder && (
        <span className="toolbar-pill current-folder">{currentFolder}</span>
      )}
      <button
        onClick={() => setPreferencesOpen(true)}
        title="Preferences"
        className="toolbar-button settings-button"
      >
        <Settings {...iconProps} />
      </button>
      <ShopModal isOpen={shopOpen} onClose={() => setShopOpen(false)} />
    </div>
  );
}
