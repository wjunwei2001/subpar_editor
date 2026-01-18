import { config } from 'dotenv';
import { app, BrowserWindow, screen, ipcMain } from 'electron';
import path from 'path';

// Load .env file from project root
config({ path: path.join(__dirname, '../../.env') });

import { registerFileHandlers, stopFileWatcher } from './ipc/fileHandlers';
import { registerTerminalHandlers } from './ipc/terminalHandlers';
import { registerLLMHandlers } from './ipc/llmHandlers';
import { registerGitHandlers } from './ipc/gitHandlers';
import { registerLspHandlers } from './ipc/lspHandlers';
import { registerAgentHandlers } from './ipc/agentHandlers';
import { lspManager } from './lsp/LspManager';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV !== 'production' || !app.isPackaged;

const negativeRatios = [
  { width: 32, height: 9 },
  { width: 9, height: 32 },
  { width: 21, height: 9 },
  { width: 4, height: 3 },
  { width: 3, height: 4 },
  { width: 5, height: 1 },
  { width: 1, height: 5 }
];

function calculateWindowDimensions(mode: 'positive' | 'neutral' | 'negative') {
  const display = screen.getPrimaryDisplay();
  const screenWidth = display.workAreaSize.width;
  const screenHeight = display.workAreaSize.height;

  const baseWidth = Math.min(screenWidth * 0.65, 1600);
  const minWidth = 600;
  const minHeight = 400;

  let width: number;
  let height: number;

  if (mode === 'positive') {
    width = baseWidth;
    height = width * 9 / 16;
  } else if (mode === 'neutral') {
    width = baseWidth;
    height = width;
  } else {
    const randomRatio = negativeRatios[Math.floor(Math.random() * negativeRatios.length)];
    width = baseWidth;
    height = width * randomRatio.height / randomRatio.width;
  }

  width = Math.max(width, minWidth);
  height = Math.max(height, minHeight);

  if (width > screenWidth) {
    width = screenWidth * 0.95;
    height = width * (mode === 'positive' ? 9 / 16 : mode === 'neutral' ? 1 : height / width);
  }

  if (height > screenHeight) {
    height = screenHeight * 0.95;
    width = height * (mode === 'positive' ? 16 / 9 : mode === 'neutral' ? 1 : width / height);
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

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

ipcMain.handle('window:resizeAspectRatio', async (_event, mode: 'positive' | 'neutral' | 'negative') => {
  if (!mainWindow) {
    throw new Error('Main window not available');
  }

  const dimensions = calculateWindowDimensions(mode);
  const [currentWidth, currentHeight] = mainWindow.getSize();

  mainWindow.setSize(dimensions.width, dimensions.height);

  // Center window on first resize of this mode
  if (currentWidth !== dimensions.width || currentHeight !== dimensions.height) {
    mainWindow.center();
  }

  return { success: true, dimensions };
});

app.whenReady().then(() => {
  registerFileHandlers();
  registerTerminalHandlers();
  registerLLMHandlers();
  registerGitHandlers();
  registerLspHandlers();
  registerAgentHandlers();
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
  // Stop file watcher
  stopFileWatcher();
});

export { mainWindow };
