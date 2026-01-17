import { useState } from 'react';
import type { FileEntry } from '@shared/types';
import { useEditorStore } from '../../store/editorStore';
import { useGitStore } from '../../store/gitStore';
import { GitStatusIcon } from '../Git/GitStatusIcon';

interface FileTreeItemProps {
  entry: FileEntry;
  depth: number;
}

export function FileTreeItem({ entry, depth }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [children, setChildren] = useState<FileEntry[]>([]);
  const { activeFile, currentFolder, openFile } = useEditorStore();
  const { getFileStatus } = useGitStore();

  // Get relative path for git status lookup
  const relativePath = currentFolder
    ? entry.path.replace(currentFolder, '').replace(/^[\\/]/, '')
    : entry.name;
  const gitStatus = getFileStatus(relativePath);

  const handleClick = async () => {
    if (entry.isDirectory) {
      if (!isExpanded) {
        const entries = await window.electronAPI.fs.readDir(entry.path);
        setChildren(entries);
      }
      setIsExpanded(!isExpanded);
    } else {
      const content = await window.electronAPI.fs.readFile(entry.path);
      openFile(entry.path, content);
    }
  };

  const isSelected = activeFile === entry.path;
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
        {gitStatus && !entry.isDirectory && (
          <GitStatusIcon index={gitStatus.index} workingDir={gitStatus.workingDir} />
        )}
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
