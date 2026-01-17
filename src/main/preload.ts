import { contextBridge, ipcRenderer } from 'electron';
import type { TerminalSize } from '../shared/types';

contextBridge.exposeInMainWorld('electronAPI', {
  fs: {
    openFolder: () => ipcRenderer.invoke('fs:openFolder'),
    readDir: (dirPath: string) => ipcRenderer.invoke('fs:readDir', dirPath),
    readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke('fs:writeFile', filePath, content),
  },
  terminal: {
    create: () => ipcRenderer.invoke('terminal:create'),
    write: (id: number, data: string) => ipcRenderer.send('terminal:write', id, data),
    resize: (id: number, size: TerminalSize) => ipcRenderer.send('terminal:resize', id, size),
    onData: (callback: (id: number, data: string) => void) => {
      ipcRenderer.on('terminal:data', (_event, id, data) => callback(id, data));
    },
    kill: (id: number) => ipcRenderer.send('terminal:kill', id),
  },
  run: {
    execute: (filePath: string, terminalId: number) =>
      ipcRenderer.send('run:execute', filePath, terminalId),
  },
});
