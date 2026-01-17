import { create } from 'zustand';
import type { FileEntry } from '@shared/types';

interface EditorState {
  // Folder state
  currentFolder: string | null;
  fileTree: FileEntry[];

  // Editor state
  currentFile: string | null;
  fileContent: string;
  isDirty: boolean;

  // Terminal state
  terminalId: number | null;

  // Actions
  setCurrentFolder: (folder: string | null) => void;
  setFileTree: (tree: FileEntry[]) => void;
  setCurrentFile: (path: string | null) => void;
  setFileContent: (content: string) => void;
  setIsDirty: (dirty: boolean) => void;
  setTerminalId: (id: number | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentFolder: null,
  fileTree: [],
  currentFile: null,
  fileContent: '',
  isDirty: false,
  terminalId: null,

  setCurrentFolder: (folder) => set({ currentFolder: folder }),
  setFileTree: (tree) => set({ fileTree: tree }),
  setCurrentFile: (path) => set({ currentFile: path, isDirty: false }),
  setFileContent: (content) => set({ fileContent: content }),
  setIsDirty: (dirty) => set({ isDirty: dirty }),
  setTerminalId: (id) => set({ terminalId: id }),
}));
