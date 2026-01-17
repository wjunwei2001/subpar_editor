import { create } from 'zustand';
import type { FileEntry } from '@shared/types';

export interface OpenFile {
  path: string;
  content: string;
  isDirty: boolean;
}

export type LspMode = 'lsp' | 'off' | 'random';
export type AutocompleteMode = 'positive' | 'neutral' | 'negative';
export type TextSizeMode = 'neutral' | 'negative';
export type ColorMode = 'positive' | 'neutral' | 'negative';
export type ThemePreference = 'light' | 'dark';
export type CodeEditingMode = 'positive' | 'neutral' | 'negative';
export type CodeVisibilityMode = 'visible' | 'invisible';

interface EditorState {
  // Folder state
  currentFolder: string | null;
  fileTree: FileEntry[];

  // Editor state - multiple files
  openFiles: OpenFile[];
  activeFile: string | null;

  // LSP mode
  lspMode: LspMode;

  // Autocomplete mode
  autocompleteMode: AutocompleteMode;
  autocompleteQuota: number;

  // Text size mode
  textSizeMode: TextSizeMode;

  // Color mode
  colorMode: ColorMode;
  themePreference: ThemePreference;

  // Code editing mode
  codeEditingMode: CodeEditingMode;
  codeEditingQuota: number;

  // Code visibility mode
  codeVisibilityMode: CodeVisibilityMode;

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
  setTerminalId: (id: number | null) => void;
  setLspMode: (mode: LspMode) => void;
  setPreferencesOpen: (open: boolean) => void;
  setAutocompleteMode: (mode: AutocompleteMode) => void;
  setAutocompleteQuota: (quota: number) => void;
  consumeAutocompleteQuota: (amount?: number) => boolean;
  setTextSizeMode: (mode: TextSizeMode) => void;
  setColorMode: (mode: ColorMode) => void;
  setThemePreference: (theme: ThemePreference) => void;
  setCodeEditingMode: (mode: CodeEditingMode) => void;
  setCodeEditingQuota: (quota: number) => void;
  consumeCodeEditingQuota: (amount?: number) => boolean;
  setCodeVisibilityMode: (mode: CodeVisibilityMode) => void;

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
  autocompleteMode: 'neutral',
  autocompleteQuota: 0,
  textSizeMode: 'neutral',
  colorMode: 'neutral',
  themePreference: 'dark',
  codeEditingMode: 'positive',
  codeEditingQuota: 99999,
  codeVisibilityMode: 'visible',
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

  setTerminalId: (id) => set({ terminalId: id }),
  setLspMode: (mode) => set({ lspMode: mode }),
  setPreferencesOpen: (open) => set({ preferencesOpen: open }),
  setAutocompleteMode: (mode) => set({ autocompleteMode: mode }),
  setAutocompleteQuota: (quota) => set({ autocompleteQuota: quota }),
  consumeAutocompleteQuota: (amount = 1) => {
    const state = get();
    if (state.autocompleteQuota >= amount) {
      set({ autocompleteQuota: state.autocompleteQuota - amount });
      return true;
    }
    return false;
  },
  setTextSizeMode: (mode) => set({ textSizeMode: mode }),
  setColorMode: (mode) => set({ colorMode: mode }),
  setThemePreference: (theme) => set({ themePreference: theme }),
  setCodeEditingMode: (mode) => set({ codeEditingMode: mode }),
  setCodeEditingQuota: (quota) => set({ codeEditingQuota: quota }),
  consumeCodeEditingQuota: (amount = 1) => {
    const state = get();
    if (state.codeEditingQuota <= 0) {
      // Already depleted
      return false;
    }
    // Consume up to available quota
    const newQuota = Math.max(0, state.codeEditingQuota - amount);
    set({ codeEditingQuota: newQuota });
    // Return true if still have quota, false if depleted
    return newQuota > 0;
  },
  setCodeVisibilityMode: (mode) => set({ codeVisibilityMode: mode }),

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
