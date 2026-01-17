import { contextBridge, ipcRenderer } from 'electron';
import type { TerminalSize, LLMCompletionRequest } from '../shared/types';

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
  llm: {
    complete: (request: LLMCompletionRequest) =>
      ipcRenderer.invoke('llm:complete', request),
    cancel: (requestId: string) => ipcRenderer.invoke('llm:cancel', requestId),
    cancelAll: () => ipcRenderer.invoke('llm:cancelAll'),
  },
  git: {
    isRepo: (path: string) => ipcRenderer.invoke('git:isRepo', path),
    status: (repoPath: string) => ipcRenderer.invoke('git:status', repoPath),
    branch: (repoPath: string) => ipcRenderer.invoke('git:branch', repoPath),
    stage: (repoPath: string, files: string[]) =>
      ipcRenderer.invoke('git:stage', repoPath, files),
    unstage: (repoPath: string, files: string[]) =>
      ipcRenderer.invoke('git:unstage', repoPath, files),
    commit: (repoPath: string, message: string) =>
      ipcRenderer.invoke('git:commit', repoPath, message),
    diff: (repoPath: string, filePath?: string) =>
      ipcRenderer.invoke('git:diff', repoPath, filePath),
    onStatusChanged: (callback: () => void) => {
      ipcRenderer.on('git:statusChanged', () => callback());
    },
  },
  lsp: {
    start: (language: string, rootPath: string) =>
      ipcRenderer.invoke('lsp:start', language, rootPath),
    stop: (serverId: string) => ipcRenderer.invoke('lsp:stop', serverId),
    request: (serverId: string, method: string, params: unknown) =>
      ipcRenderer.invoke('lsp:request', serverId, method, params),
    notify: (serverId: string, method: string, params: unknown) =>
      ipcRenderer.send('lsp:notify', serverId, method, params),
    onNotification: (callback: (serverId: string, method: string, params: unknown) => void) => {
      ipcRenderer.on('lsp:notification', (_event, serverId, method, params) =>
        callback(serverId, method, params)
      );
    },
  },
});
