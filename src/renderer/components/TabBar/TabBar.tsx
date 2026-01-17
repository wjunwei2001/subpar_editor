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
      {openFiles.map((file, index) => (
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
