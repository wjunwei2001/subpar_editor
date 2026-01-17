import { BaseServer } from './BaseServer';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export class TypeScriptServer extends BaseServer {
  get command(): string {
    const binName = process.platform === 'win32'
      ? 'typescript-language-server.cmd'
      : 'typescript-language-server';

    // Try multiple paths to find the binary
    const possiblePaths = [
      // Development: use process.cwd()
      path.join(process.cwd(), 'node_modules', '.bin', binName),
      // Production: use app.getAppPath()
      path.join(app.getAppPath(), 'node_modules', '.bin', binName),
      // Fallback: global installation
      binName,
    ];

    for (const p of possiblePaths) {
      if (p === binName || fs.existsSync(p)) {
        return p;
      }
    }

    // Default to global if nothing found
    return binName;
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
