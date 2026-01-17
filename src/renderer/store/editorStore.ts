import { create } from 'zustand';
import type { FileEntry } from '@shared/types';

export interface OpenFile {
  path: string;
  content: string;
  isDirty: boolean;
}

export type LspMode = 'lsp' | 'off' | 'random';

interface EditorState {
  // Folder state
  currentFolder: string | null;
  fileTree: FileEntry[];

  // Editor state - multiple files
  openFiles: OpenFile[];
  activeFile: string | null;

  // LSP mode
  lspMode: LspMode;

  // UI state
  preferencesOpen: boolean;

  // Terminal state
  terminalId: number | null;

  // Actions
  setCurrentFolder: (folder: string | null) => void;
  setFileTree: (tree: FileEntry[]) => void;
  openFile: (path: string, content: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  updateFileContent: (path: string, content: string) => void;
  setFileDirty: (path: string, dirty: boolean) => void;
  saveFile: (path: string) => Promise<void>;
  reloadFile: (path: string) => Promise<void>;
  setTerminalId: (id: number | null) => void;
  setLspMode: (mode: LspMode) => void;
  setPreferencesOpen: (open: boolean) => void;

  // Computed helpers
  getActiveFileData: () => OpenFile | null;

  // Legacy compatibility
  currentFile: string | null;
  fileContent: string;
  isDirty: boolean;
  setCurrentFile: (path: string | null) => void;
  setFileContent: (content: string) => void;
  setIsDirty: (dirty: boolean) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  currentFolder: null,
  fileTree: [],
  openFiles: [],
  activeFile: null,
  lspMode: 'lsp',
  preferencesOpen: false,
  terminalId: null,

  // Legacy computed properties (these must be accessed via getState() or selectors)
  currentFile: null,
  fileContent: '',
  isDirty: false,

  setCurrentFolder: (folder) => set({ currentFolder: folder }),
  setFileTree: (tree) => set({ fileTree: tree }),

  openFile: (path, content) => set((state) => {
    // Check if file is already open
    const existing = state.openFiles.find((f) => f.path === path);
    if (existing) {
      // Just switch to it
      return { activeFile: path };
    }
    // Add new file
    return {
      openFiles: [...state.openFiles, { path, content, isDirty: false }],
      activeFile: path,
    };
  }),

  closeFile: (path) => set((state) => {
    const newOpenFiles = state.openFiles.filter((f) => f.path !== path);
    let newActiveFile = state.activeFile;

    // If closing the active file, switch to another
    if (state.activeFile === path) {
      const closedIndex = state.openFiles.findIndex((f) => f.path === path);
      if (newOpenFiles.length > 0) {
        // Try to switch to the next file, or previous if at end
        const newIndex = Math.min(closedIndex, newOpenFiles.length - 1);
        newActiveFile = newOpenFiles[newIndex].path;
      } else {
        newActiveFile = null;
      }
    }

    return { openFiles: newOpenFiles, activeFile: newActiveFile };
  }),

  setActiveFile: (path) => set({ activeFile: path }),

  updateFileContent: (path, content) => set((state) => ({
    openFiles: state.openFiles.map((f) =>
      f.path === path ? { ...f, content, isDirty: true } : f
    ),
  })),

  setFileDirty: (path, dirty) => set((state) => ({
    openFiles: state.openFiles.map((f) =>
      f.path === path ? { ...f, isDirty: dirty } : f
    ),
  })),

  saveFile: async (path) => {
    const file = get().openFiles.find((f) => f.path === path);
    if (file) {
      await window.electronAPI.fs.writeFile(path, file.content);
      set((state) => ({
        openFiles: state.openFiles.map((f) =>
          f.path === path ? { ...f, isDirty: false } : f
        ),
      }));
    }
  },

  reloadFile: async (path) => {
    const file = get().openFiles.find((f) => f.path === path);
    if (file) {
      const content = await window.electronAPI.fs.readFile(path);
      set((state) => ({
        openFiles: state.openFiles.map((f) =>
          f.path === path ? { ...f, content, isDirty: false } : f
        ),
      }));
    }
  },

  setTerminalId: (id) => set({ terminalId: id }),
  setLspMode: (mode) => set({ lspMode: mode }),
  setPreferencesOpen: (open) => set({ preferencesOpen: open }),

  getActiveFileData: () => {
    const state = get();
    return state.openFiles.find((f) => f.path === state.activeFile) || null;
  },

  // Legacy setters for compatibility
  setCurrentFile: (path) => {
    if (path) {
      // This is called when clicking a file - need to load content first
      set({ activeFile: path });
    }
  },
  setFileContent: (content) => {
    const activeFile = get().activeFile;
    if (activeFile) {
      get().updateFileContent(activeFile, content);
    }
  },
  setIsDirty: (dirty) => {
    const activeFile = get().activeFile;
    if (activeFile) {
      get().setFileDirty(activeFile, dirty);
    }
  },
}));
