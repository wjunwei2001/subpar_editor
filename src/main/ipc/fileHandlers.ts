import { ipcMain, dialog, BrowserWindow } from 'electron';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import type { FileEntry } from '../../shared/types';

interface FileWatcherState {
  watchers: Map<string, fsSync.FSWatcher>;
  changeTimeouts: Map<string, NodeJS.Timeout>;
}

let fileWatcherState: FileWatcherState = {
  watchers: new Map(),
  changeTimeouts: new Map()
};

export function startFileWatcher(folderPath: string, mainWindow: BrowserWindow) {
  // Stop existing watchers
  stopFileWatcher();

  // Read directory to find files to watch
  const watchFile = async (filePath: string) => {
    try {
      // Check if it's a file
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) return;

      // Watch the file for changes
      const watcher = fsSync.watch(filePath, async (eventType) => {
        if (eventType === 'change') {
          // Debounce changes for same file
          if (fileWatcherState.changeTimeouts.has(filePath)) {
            clearTimeout(fileWatcherState.changeTimeouts.get(filePath)!);
          }

          const timeout = setTimeout(async () => {
            try {
              const content = await fs.readFile(filePath, 'utf-8');
              mainWindow.webContents.send('file:changed', {
                path: filePath,
                content
              });
              fileWatcherState.changeTimeouts.delete(filePath);
            } catch (error) {
              console.error('Error reading changed file:', error);
            }
          }, 300);

          fileWatcherState.changeTimeouts.set(filePath, timeout);
        }
      });

      fileWatcherState.watchers.set(filePath, watcher);
    } catch (error) {
      // Ignore errors for files we can't read
    }
  };

  // Recursively watch directory
  const watchDirectory = async (dirPath: string) => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        // Skip hidden files and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          // Recursively watch subdirectory
          await watchDirectory(fullPath);
        } else {
          // Watch file
          await watchFile(fullPath);
        }
      }

      // Watch directory for new files
      const dirWatcher = fsSync.watch(dirPath, async (eventType, filename) => {
        if (filename && (eventType === 'rename')) {
          const fullPath = path.join(dirPath, filename);
          try {
            const stats = await fs.stat(fullPath);
            if (stats.isFile()) {
              // New file added
              await watchFile(fullPath);
            }
          } catch {
            // File might be deleted, ignore
          }
        }
      });
      fileWatcherState.watchers.set(dirPath, dirWatcher);
    } catch (error) {
      console.error('Error watching directory:', dirPath, error);
    }
  };

  watchDirectory(folderPath);
}

export function stopFileWatcher() {
  // Close all watchers
  fileWatcherState.watchers.forEach((watcher) => {
    watcher.close();
  });
  fileWatcherState.watchers.clear();

  // Clear all timeouts
  fileWatcherState.changeTimeouts.forEach((timeout) => {
    clearTimeout(timeout);
  });
  fileWatcherState.changeTimeouts.clear();
}

export function registerFileHandlers() {
  ipcMain.handle('fs:openFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  });

  ipcMain.handle('fs:readDir', async (_event, dirPath: string): Promise<FileEntry[]> => {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const result: FileEntry[] = [];

      for (const entry of entries) {
        // Skip hidden files and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        result.push({
          name: entry.name,
          path: path.join(dirPath, entry.name),
          isDirectory: entry.isDirectory(),
        });
      }

      // Sort: directories first, then files, both alphabetically
      return result.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error reading directory:', error);
      return [];
    }
  });

  ipcMain.handle('fs:readFile', async (_event, filePath: string): Promise<string> => {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  });

  ipcMain.handle(
    'fs:writeFile',
    async (_event, filePath: string, content: string): Promise<void> => {
      try {
        // Ensure parent directory exists (for creating new files)
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(filePath, content, 'utf-8');
        console.log(`[fs] Wrote file: ${filePath}`);
      } catch (error) {
        console.error('Error writing file:', error);
        throw error;
      }
    }
  );

  ipcMain.handle('watcher:stop', async () => {
    stopFileWatcher();
    return { success: true };
  });

  ipcMain.handle('watcher:start', async (event, folderPath: string) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      startFileWatcher(folderPath, win);
    }
    return { success: true };
  });
}
