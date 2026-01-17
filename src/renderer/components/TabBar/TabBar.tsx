import { useEditorStore } from '../../store/editorStore';

export function TabBar() {
  const { openFiles, activeFile, setActiveFile, closeFile } = useEditorStore();

  if (openFiles.length === 0) {
    return null;
  }

  const getFileName = (path: string) => path.split(/[\\/]/).pop() || path;

  const handleClose = (e: React.MouseEvent, path: string) => {
    e.stopPropagation(); // Don't trigger tab switch

    const file = openFiles.find((f) => f.path === path);
    if (file?.isDirty) {
      // TODO: Could add a confirmation dialog here
      // For now, just close anyway
    }
    closeFile(path);
  };

  return (
    <div className="tab-bar">
      {openFiles.map((file) => (
        <div
          key={file.path}
          className={`tab ${file.path === activeFile ? 'active' : ''}`}
          onClick={() => setActiveFile(file.path)}
          title={file.path}
        >
          <span className="tab-name">
            {file.isDirty && <span className="tab-dirty">●</span>}
            {getFileName(file.path)}
          </span>
          <button
            className="tab-close"
            onClick={(e) => handleClose(e, file.path)}
            title="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
