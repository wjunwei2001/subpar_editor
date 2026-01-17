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
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
