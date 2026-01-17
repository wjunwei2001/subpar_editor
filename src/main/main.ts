import { config } from 'dotenv';
import { app, BrowserWindow } from 'electron';
import path from 'path';

// Load .env file from project root
config({ path: path.join(__dirname, '../../.env') });

import { registerFileHandlers } from './ipc/fileHandlers';
import { registerTerminalHandlers } from './ipc/terminalHandlers';
import { registerLLMHandlers } from './ipc/llmHandlers';
import { registerGitHandlers } from './ipc/gitHandlers';
import { registerLspHandlers } from './ipc/lspHandlers';
import { lspManager } from './lsp/LspManager';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV !== 'production' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerFileHandlers();
  registerTerminalHandlers();
  registerLLMHandlers();
  registerGitHandlers();
  registerLspHandlers();
  createWindow();

  // Set main window for LSP notifications
  if (mainWindow) {
    lspManager.setMainWindow(mainWindow);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  // Clean up LSP servers before quitting
  await lspManager.stopAllServers();
});

export { mainWindow };
