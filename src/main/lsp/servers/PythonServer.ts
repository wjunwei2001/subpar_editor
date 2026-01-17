import { BaseServer } from './BaseServer';

export class PythonServer extends BaseServer {
  get command(): string {
    // pylsp should be installed via pip: pip install python-lsp-server
    return process.platform === 'win32' ? 'pylsp.exe' : 'pylsp';
  }

  get args(): string[] {
    return [];
  }

  get languageId(): string {
    return 'python';
  }

  get fileExtensions(): string[] {
    return ['.py'];
  }
}
