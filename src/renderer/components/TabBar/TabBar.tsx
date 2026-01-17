import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';

export function TabBar() {
  const { openFiles, activeFile, setActiveFile, closeFile, reorderFiles } = useEditorStore();
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (openFiles.length === 0) {
    return null;
  }

  const getFileName = (path: string) => path.split(/[\\/]/).pop() || path;

  const getFileExtension = (path: string) => path.split('.').pop()?.toLowerCase() || '';

  const getBadgeInfo = (ext: string) => {
    switch (ext) {
      case 'js':
      case 'jsx':
        return { label: 'JS', className: 'js' };
      case 'ts':
      case 'tsx':
        return { label: 'TS', className: 'ts' };
      case 'py':
        return { label: 'PY', className: 'py' };
      case 'md':
        return { label: 'MD', className: 'md' };
      case 'json':
        return { label: 'JSON', className: 'json' };
      case 'css':
        return { label: 'CSS', className: 'css' };
      case 'html':
        return { label: 'HTML', className: 'html' };
      default:
        return { label: 'TXT', className: 'txt' };
    }
  };

  const handleClose = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    const file = openFiles.find((f) => f.path === path);
    if (file?.isDirty) {
      // TODO: Could add a confirmation dialog here
    }
    closeFile(path);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragStartIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set a custom drag image if desired
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (dragStartIndex !== null && dragStartIndex !== dropIndex) {
      reorderFiles(dragStartIndex, dropIndex);
    }
    setDragStartIndex(null);
  };

  const handleDragEnd = () => {
    setDragStartIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="tab-bar">
      {openFiles.map((file, index) => {
        const badge = getBadgeInfo(getFileExtension(file.path));
        return (
          <div
          key={file.path}
          draggable={true}
          className={`tab ${file.path === activeFile ? 'active' : ''} ${
            dragStartIndex === index ? 'dragging' : ''
          } ${dragOverIndex === index ? 'drag-over' : ''}`}
          onClick={() => setActiveFile(file.path)}
          title={file.path}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
        >
          <span className="tab-name">
            {file.isDirty && <span className="tab-dirty">●</span>}
            <span className={`tab-badge tab-badge-${badge.className}`}>{badge.label}</span>
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
        );
      })}
    </div>
  );
}
