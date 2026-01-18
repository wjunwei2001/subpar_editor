import { useState } from 'react';
import type { FileEntry } from '@shared/types';
import { useEditorStore } from '../../store/editorStore';
import { useGitStore } from '../../store/gitStore';
import { GitStatusIcon } from '../Git/GitStatusIcon';
import {
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileJson,
  FileText,
  FileType,
  Globe,
  Hash,
  getFileIcon as getFileIconComponent,
} from '../Icons';
import type { LucideProps } from 'lucide-react';

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

  const renderIcon = () => {
    const iconProps: LucideProps = { size: 16, strokeWidth: 1.5 };

    if (entry.isDirectory) {
      return isExpanded ? (
        <FolderOpen {...iconProps} className="folder-icon open" />
      ) : (
        <Folder {...iconProps} className="folder-icon" />
      );
    }

    const FileIcon = getFileIconComponent(entry.name);
    return <FileIcon {...iconProps} className="file-icon" />;
  };

  return (
    <>
      <div
        className={`file-tree-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        <span className="icon">{renderIcon()}</span>
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
