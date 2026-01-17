import { ipcMain } from 'electron';
import { GitService } from '../git/GitService';

const gitServices: Map<string, GitService> = new Map();

function getOrCreateGitService(repoPath: string): GitService {
  let service = gitServices.get(repoPath);
  if (!service) {
    service = new GitService(repoPath);
    gitServices.set(repoPath, service);
  }
  return service;
}

export function registerGitHandlers() {
  ipcMain.handle('git:isRepo', async (_event, path: string) => {
    return await GitService.isRepo(path);
  });

  ipcMain.handle('git:status', async (_event, repoPath: string) => {
    const service = getOrCreateGitService(repoPath);
    return await service.getStatus();
  });

  ipcMain.handle('git:branch', async (_event, repoPath: string) => {
    const service = getOrCreateGitService(repoPath);
    return await service.getBranch();
  });

  ipcMain.handle('git:stage', async (_event, repoPath: string, files: string[]) => {
    const service = getOrCreateGitService(repoPath);
    await service.stage(files);
  });

  ipcMain.handle('git:unstage', async (_event, repoPath: string, files: string[]) => {
    const service = getOrCreateGitService(repoPath);
    await service.unstage(files);
  });

  ipcMain.handle('git:commit', async (_event, repoPath: string, message: string) => {
    const service = getOrCreateGitService(repoPath);
    await service.commit(message);
  });

  ipcMain.handle('git:diff', async (_event, repoPath: string, filePath?: string) => {
    const service = getOrCreateGitService(repoPath);
    return await service.diff(filePath);
  });
}
