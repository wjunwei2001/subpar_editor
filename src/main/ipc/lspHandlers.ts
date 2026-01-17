import { ipcMain } from 'electron';
import { lspManager } from '../lsp/LspManager';

export function registerLspHandlers() {
  ipcMain.handle('lsp:start', async (_event, language: string, rootPath: string) => {
    try {
      return await lspManager.startServer(language, rootPath);
    } catch (error) {
      console.error('Failed to start LSP server:', error);
      throw error;
    }
  });

  ipcMain.handle('lsp:stop', async (_event, serverId: string) => {
    await lspManager.stopServer(serverId);
  });

  ipcMain.handle(
    'lsp:request',
    async (_event, serverId: string, method: string, params: unknown) => {
      return await lspManager.request(serverId, method, params);
    }
  );

  ipcMain.on('lsp:notify', (_event, serverId: string, method: string, params: unknown) => {
    lspManager.notify(serverId, method, params);
  });
}
