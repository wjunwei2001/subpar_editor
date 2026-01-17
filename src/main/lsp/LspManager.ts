import { BrowserWindow } from 'electron';
import { BaseServer } from './servers/BaseServer';
import { TypeScriptServer } from './servers/TypeScriptServer';
import { PythonServer } from './servers/PythonServer';
import { PublishDiagnosticsParams } from 'vscode-languageserver-protocol';

interface ServerInstance {
  id: string;
  server: BaseServer;
  language: string;
  rootPath: string;
}

export class LspManager {
  private servers: Map<string, ServerInstance> = new Map();
  private idCounter = 0;
  private mainWindow: BrowserWindow | null = null;

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  async startServer(language: string, rootPath: string): Promise<string> {
    // Check if server already exists for this language/root
    const existingId = this.findServerId(language, rootPath);
    if (existingId) {
      return existingId;
    }

    const server = this.createServer(language, rootPath);
    if (!server) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const id = `${language}-${++this.idCounter}`;

    // Set up diagnostics listener
    server.on('diagnostics', (params: PublishDiagnosticsParams) => {
      this.sendNotification(id, 'textDocument/publishDiagnostics', params);
    });

    server.on('exit', () => {
      this.servers.delete(id);
    });

    try {
      await server.start();
      this.servers.set(id, { id, server, language, rootPath });
      return id;
    } catch (error) {
      console.error(`Failed to start ${language} server:`, error);
      throw error;
    }
  }

  async stopServer(serverId: string): Promise<void> {
    const instance = this.servers.get(serverId);
    if (instance) {
      await instance.server.stop();
      this.servers.delete(serverId);
    }
  }

  async stopAllServers(): Promise<void> {
    const promises = Array.from(this.servers.values()).map((instance) =>
      instance.server.stop()
    );
    await Promise.all(promises);
    this.servers.clear();
  }

  async request(serverId: string, method: string, params: unknown): Promise<unknown> {
    const instance = this.servers.get(serverId);
    if (!instance) {
      throw new Error(`Server not found: ${serverId}`);
    }
    return await instance.server.request(method, params);
  }

  notify(serverId: string, method: string, params: unknown): void {
    const instance = this.servers.get(serverId);
    if (!instance) {
      console.warn(`Server not found for notification: ${serverId}`);
      return;
    }
    instance.server.notify(method, params);
  }

  getServerForFile(filePath: string, rootPath: string): string | null {
    const ext = filePath.substring(filePath.lastIndexOf('.'));

    for (const [id, instance] of this.servers) {
      if (
        instance.rootPath === rootPath &&
        instance.server.fileExtensions.includes(ext)
      ) {
        return id;
      }
    }

    return null;
  }

  private createServer(language: string, rootPath: string): BaseServer | null {
    switch (language) {
      case 'typescript':
      case 'javascript':
        return new TypeScriptServer(rootPath);
      case 'python':
        return new PythonServer(rootPath);
      default:
        return null;
    }
  }

  private findServerId(language: string, rootPath: string): string | null {
    for (const [id, instance] of this.servers) {
      if (instance.language === language && instance.rootPath === rootPath) {
        return id;
      }
    }
    return null;
  }

  private sendNotification(serverId: string, method: string, params: unknown): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('lsp:notification', serverId, method, params);
    }
  }
}

// Singleton instance
export const lspManager = new LspManager();
