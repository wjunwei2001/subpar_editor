export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileEntry[];
}

export interface EditorFile {
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
}

export interface TerminalSize {
  cols: number;
  rows: number;
}

export interface LLMCompletionRequest {
  requestId: string;
  prefix: string;
  suffix: string;
  language: string;
}

export interface LLMCompletionResponse {
  text: string;
  finishReason: 'stop' | 'length' | 'cancelled';
}

// Agent Types
export interface AgentMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface AgentChatRequest {
  requestId: string;
  messages: AgentMessage[];
  contextFiles?: string[];
}

export interface AgentChatResponse {
  content: string;
  finishReason: 'stop' | 'length' | 'cancelled';
}

// Git Types
export type GitFileStatusCode = 'M' | 'A' | 'D' | 'R' | 'C' | 'U' | '?' | '!' | ' ';

export interface GitFileStatus {
  path: string;
  index: GitFileStatusCode;
  workingDir: GitFileStatusCode;
}

export interface GitStatus {
  isRepo: boolean;
  branch: string | null;
  ahead: number;
  behind: number;
  files: GitFileStatus[];
  staged: string[];
  modified: string[];
  untracked: string[];
}

export interface GitBranchInfo {
  current: string;
  all: string[];
}

// LSP Types
export interface LspServerInfo {
  id: string;
  language: string;
  running: boolean;
}

export interface LspDiagnostic {
  uri: string;
  diagnostics: Array<{
    range: { start: LspPosition; end: LspPosition };
    message: string;
    severity: 1 | 2 | 3 | 4;
    source?: string;
  }>;
}

export interface LspPosition {
  line: number;
  character: number;
}

export interface IElectronAPI {
  fs: {
    openFolder: () => Promise<string | null>;
    readDir: (dirPath: string) => Promise<FileEntry[]>;
    readFile: (filePath: string) => Promise<string>;
    writeFile: (filePath: string, content: string) => Promise<void>;
  };
  terminal: {
    create: () => Promise<number>;
    write: (id: number, data: string) => void;
    resize: (id: number, size: TerminalSize) => void;
    onData: (callback: (id: number, data: string) => void) => void;
    kill: (id: number) => void;
  };
  run: {
    execute: (filePath: string, terminalId: number) => void;
  };
  llm: {
    complete: (request: LLMCompletionRequest) => Promise<LLMCompletionResponse | null>;
    cancel: (requestId: string) => Promise<boolean>;
    cancelAll: () => Promise<boolean>;
  };
  git: {
    isRepo: (path: string) => Promise<boolean>;
    status: (repoPath: string) => Promise<GitStatus>;
    branch: (repoPath: string) => Promise<GitBranchInfo>;
    stage: (repoPath: string, files: string[]) => Promise<void>;
    unstage: (repoPath: string, files: string[]) => Promise<void>;
    commit: (repoPath: string, message: string) => Promise<void>;
    diff: (repoPath: string, filePath?: string) => Promise<string>;
    onStatusChanged: (callback: () => void) => void;
  };
  lsp: {
    start: (language: string, rootPath: string) => Promise<string>;
    stop: (serverId: string) => Promise<void>;
    request: (serverId: string, method: string, params: unknown) => Promise<unknown>;
    notify: (serverId: string, method: string, params: unknown) => void;
    onNotification: (callback: (serverId: string, method: string, params: unknown) => void) => void;
  };
  agent: {
    chat: (request: AgentChatRequest) => Promise<AgentChatResponse | null>;
    cancel: (requestId: string) => Promise<boolean>;
  };
  watcher: {
    start: (folderPath: string) => Promise<{ success: boolean }>;
    stop: () => Promise<{ success: boolean }>;
  };
  onFileChanged: (callback: (event: Electron.IpcRendererEvent, data: { path: string; content: string }) => void) => void;
  window: {
    resizeAspectRatio: (mode: 'positive' | 'neutral' | 'negative') => Promise<{ success: boolean; dimensions: { width: number; height: number } }>;
  };
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
