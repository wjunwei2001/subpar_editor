import { create } from 'zustand';
import type { GitStatus, GitBranchInfo, GitFileStatus } from '@shared/types';

interface GitState {
  isRepo: boolean;
  currentBranch: string | null;
  status: GitStatus | null;
  fileStatuses: Map<string, GitFileStatus>;

  // Actions
  setIsRepo: (isRepo: boolean) => void;
  setStatus: (status: GitStatus) => void;
  setBranch: (branch: string | null) => void;
  refreshStatus: (repoPath: string) => Promise<void>;
  stageFiles: (repoPath: string, files: string[]) => Promise<void>;
  unstageFiles: (repoPath: string, files: string[]) => Promise<void>;
  commit: (repoPath: string, message: string) => Promise<void>;
  getFileStatus: (filePath: string) => GitFileStatus | undefined;
}

export const useGitStore = create<GitState>((set, get) => ({
  isRepo: false,
  currentBranch: null,
  status: null,
  fileStatuses: new Map(),

  setIsRepo: (isRepo) => set({ isRepo }),

  setStatus: (status) => {
    const fileStatuses = new Map<string, GitFileStatus>();
    status.files.forEach((file) => {
      fileStatuses.set(file.path, file);
    });
    set({ status, fileStatuses, currentBranch: status.branch });
  },

  setBranch: (branch) => set({ currentBranch: branch }),

  refreshStatus: async (repoPath: string) => {
    try {
      const isRepo = await window.electronAPI.git.isRepo(repoPath);
      if (!isRepo) {
        set({ isRepo: false, status: null, currentBranch: null, fileStatuses: new Map() });
        return;
      }

      const status = await window.electronAPI.git.status(repoPath);
      get().setStatus(status);
      set({ isRepo: true });
    } catch (error) {
      console.error('Failed to refresh git status:', error);
    }
  },

  stageFiles: async (repoPath: string, files: string[]) => {
    try {
      await window.electronAPI.git.stage(repoPath, files);
      await get().refreshStatus(repoPath);
    } catch (error) {
      console.error('Failed to stage files:', error);
    }
  },

  unstageFiles: async (repoPath: string, files: string[]) => {
    try {
      await window.electronAPI.git.unstage(repoPath, files);
      await get().refreshStatus(repoPath);
    } catch (error) {
      console.error('Failed to unstage files:', error);
    }
  },

  commit: async (repoPath: string, message: string) => {
    try {
      await window.electronAPI.git.commit(repoPath, message);
      await get().refreshStatus(repoPath);
    } catch (error) {
      console.error('Failed to commit:', error);
      throw error;
    }
  },

  getFileStatus: (filePath: string) => {
    return get().fileStatuses.get(filePath);
  },
}));
