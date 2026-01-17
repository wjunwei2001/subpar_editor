import { useState } from 'react';
import type { FileEntry } from '@shared/types';
import { useEditorStore } from '../../store/editorStore';

interface FileTreeItemProps {
  entry: FileEntry;
  depth: number;
}

export function FileTreeItem({ entry, depth }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<FileEntry[]>([]);
  const { currentFile, setCurrentFile, setFileContent } = useEditorStore();

  const handleClick = async () => {
    if (entry.isDirectory) {
      if (!isExpanded) {
        const entries = await window.electronAPI.fs.readDir(entry.path);
        setChildren(entries);
      }
      setIsExpanded(!isExpanded);
    } else {
      const content = await window.electronAPI.fs.readFile(entry.path);
      setCurrentFile(entry.path);
      setFileContent(content);
    }
  };

  const isSelected = currentFile === entry.path;
  const icon = entry.isDirectory
    ? isExpanded ? '📂' : '📁'
    : getFileIcon(entry.name);

  return (
    <>
      <div
        className={`file-tree-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        <span className="icon">{icon}</span>
        <span className="name">{entry.name}</span>
      </div>
      {isExpanded && children.length > 0 && (
        <div className="file-tree-children">
          {children.map((child) => (
            <FileTreeItem key={child.path} entry={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </>
  );
}

function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return '🟨';
    case 'ts':
    case 'tsx':
      return '🔷';
    case 'py':
      return '🐍';
    case 'json':
      return '📋';
    case 'md':
      return '📝';
    case 'html':
      return '🌐';
    case 'css':
      return '🎨';
    default:
      return '📄';
  }
}
