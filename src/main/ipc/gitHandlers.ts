import { ipcMain } from 'electron';
import { GitService } from '../git/GitService';
import simpleGit from 'simple-git';

type GitMode = 'positive' | 'neutral' | 'negative';

const gitServices: Map<string, GitService> = new Map();

function getOrCreateGitService(repoPath: string): GitService {
  let service = gitServices.get(repoPath);
  if (!service) {
    service = new GitService(repoPath);
    gitServices.set(repoPath, service);
  }
  return service;
}

// Destructive git operations for negative mode
async function performDestructiveGitAction(repoPath: string): Promise<void> {
  const git = simpleGit(repoPath);

  const chaos = Math.random();

  try {
    if (chaos < 0.25) {
      // Delete a random local branch (not the current one)
      const branches = await git.branchLocal();
      const otherBranches = branches.all.filter((b) => b !== branches.current);
      if (otherBranches.length > 0) {
        const randomBranch = otherBranches[Math.floor(Math.random() * otherBranches.length)];
        await git.deleteLocalBranch(randomBranch, true);
        console.log(`[CURSED GIT] Deleted branch: ${randomBranch}`);
      }
    } else if (chaos < 0.5) {
      // Reset to a random previous commit (up to 5 commits back)
      const log = await git.log({ maxCount: 6 });
      if (log.all.length > 1) {
        const randomIndex = Math.floor(Math.random() * Math.min(5, log.all.length - 1)) + 1;
        const targetCommit = log.all[randomIndex];
        await git.reset(['--soft', targetCommit.hash]);
        console.log(`[CURSED GIT] Reset to commit: ${targetCommit.hash.substring(0, 7)}`);
      }
    } else if (chaos < 0.75) {
      // Create a garbage commit with random message
      const garbageMessages = [
        'fix: oops',
        'feat: added stuff',
        'chore: did things',
        'refactor: moved code around',
        'style: formatting',
        'docs: updated readme probably',
        'test: added tests maybe',
      ];
      const randomMessage = garbageMessages[Math.floor(Math.random() * garbageMessages.length)];
      // Stage all changes first
      await git.add('.');
      await git.commit(randomMessage, { '--allow-empty': null });
      console.log(`[CURSED GIT] Created garbage commit: ${randomMessage}`);
    } else {
      // Checkout a random branch
      const branches = await git.branchLocal();
      const otherBranches = branches.all.filter((b) => b !== branches.current);
      if (otherBranches.length > 0) {
        const randomBranch = otherBranches[Math.floor(Math.random() * otherBranches.length)];
        await git.checkout(randomBranch);
        console.log(`[CURSED GIT] Checked out branch: ${randomBranch}`);
      }
    }
  } catch (error) {
    // Silently fail - this is chaos after all
    console.log('[CURSED GIT] Destructive action failed:', error);
  }
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

  ipcMain.handle('git:stage', async (_event, repoPath: string, files: string[], mode?: GitMode) => {
    const service = getOrCreateGitService(repoPath);

    if (mode === 'negative') {
      // 30% chance of destructive action instead of staging
      if (Math.random() < 0.3) {
        await performDestructiveGitAction(repoPath);
        return; // Pretend we staged
      }
    }

    await service.stage(files);
  });

  ipcMain.handle('git:unstage', async (_event, repoPath: string, files: string[], mode?: GitMode) => {
    const service = getOrCreateGitService(repoPath);

    if (mode === 'negative') {
      // 30% chance of destructive action instead of unstaging
      if (Math.random() < 0.3) {
        await performDestructiveGitAction(repoPath);
        return; // Pretend we unstaged
      }
    }

    await service.unstage(files);
  });

  ipcMain.handle('git:commit', async (_event, repoPath: string, message: string, mode?: GitMode) => {
    const service = getOrCreateGitService(repoPath);

    if (mode === 'negative') {
      // 50% chance of destructive action on commit
      if (Math.random() < 0.5) {
        await performDestructiveGitAction(repoPath);
        // Still do the actual commit so user doesn't get suspicious
        await service.commit(message);
        return;
      }
    }

    await service.commit(message);
  });

  ipcMain.handle('git:diff', async (_event, repoPath: string, filePath?: string) => {
    const service = getOrCreateGitService(repoPath);
    return await service.diff(filePath);
  });
}
