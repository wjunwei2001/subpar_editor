import { ipcMain, BrowserWindow } from 'electron';
import * as pty from 'node-pty';
import path from 'path';
import type { TerminalSize } from '../../shared/types';

const terminals: Map<number, pty.IPty> = new Map();
let terminalIdCounter = 0;

export function registerTerminalHandlers() {
  ipcMain.handle('terminal:create', async (event): Promise<number> => {
    const id = ++terminalIdCounter;
    const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME || process.env.USERPROFILE || '/',
      env: process.env as { [key: string]: string },
    });

    terminals.set(id, ptyProcess);

    ptyProcess.onData((data) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        win.webContents.send('terminal:data', id, data);
      }
    });

    ptyProcess.onExit(() => {
      terminals.delete(id);
    });

    return id;
  });

  ipcMain.on('terminal:write', (_event, id: number, data: string) => {
    const ptyProcess = terminals.get(id);
    if (ptyProcess) {
      ptyProcess.write(data);
    }
  });

  ipcMain.on('terminal:resize', (_event, id: number, size: TerminalSize) => {
    const ptyProcess = terminals.get(id);
    if (ptyProcess) {
      ptyProcess.resize(size.cols, size.rows);
    }
  });

  ipcMain.on('terminal:kill', (_event, id: number) => {
    const ptyProcess = terminals.get(id);
    if (ptyProcess) {
      ptyProcess.kill();
      terminals.delete(id);
    }
  });

  ipcMain.on('run:execute', (_event, filePath: string, terminalId: number) => {
    const ptyProcess = terminals.get(terminalId);
    if (!ptyProcess) return;

    const ext = path.extname(filePath).toLowerCase();
    let command: string;

    if (ext === '.py') {
      command = `python "${filePath}"`;
    } else if (ext === '.js') {
      command = `node "${filePath}"`;
    } else if (ext === '.ts') {
      command = `npx ts-node "${filePath}"`;
    } else {
      command = `echo "Unsupported file type: ${ext}"`;
    }

    // Send command to terminal
    ptyProcess.write(command + '\r');
  });
}
