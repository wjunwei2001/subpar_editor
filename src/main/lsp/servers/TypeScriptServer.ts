import { BaseServer } from './BaseServer';
import path from 'path';
import { app } from 'electron';

export class TypeScriptServer extends BaseServer {
  get command(): string {
    // Use the locally installed typescript-language-server from node_modules
    const appPath = app.getAppPath();
    const binName = process.platform === 'win32'
      ? 'typescript-language-server.cmd'
      : 'typescript-language-server';
    return path.join(appPath, 'node_modules', '.bin', binName);
  }

  get args(): string[] {
    return ['--stdio'];
  }

  get languageId(): string {
    return 'typescript';
  }

  get fileExtensions(): string[] {
    return ['.ts', '.tsx', '.js', '.jsx'];
  }
}
