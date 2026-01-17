import { useEditorStore } from '../../store/editorStore';
import { FileTreeItem } from './FileTreeItem';

export function FileTree() {
  const { fileTree } = useEditorStore();

  return (
    <div className="file-tree">
      {fileTree.map((entry) => (
        <FileTreeItem key={entry.path} entry={entry} depth={0} />
      ))}
    </div>
  );
}
