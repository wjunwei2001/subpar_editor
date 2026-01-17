import { ChildProcess, spawn } from 'child_process';
import { EventEmitter } from 'events';
import {
  createMessageConnection,
  MessageConnection,
  StreamMessageReader,
  StreamMessageWriter,
} from 'vscode-jsonrpc/node';
import {
  InitializeParams,
  InitializeResult,
  DidOpenTextDocumentParams,
  DidChangeTextDocumentParams,
  DidCloseTextDocumentParams,
  CompletionParams,
  CompletionList,
  CompletionItem,
  HoverParams,
  Hover,
  DefinitionParams,
  Location,
  PublishDiagnosticsParams,
} from 'vscode-languageserver-protocol';

export abstract class BaseServer extends EventEmitter {
  protected process: ChildProcess | null = null;
  protected connection: MessageConnection | null = null;
  protected rootPath: string;
  protected initialized = false;

  constructor(rootPath: string) {
    super();
    this.rootPath = rootPath;
  }

  abstract get command(): string;
  abstract get args(): string[];
  abstract get languageId(): string;
  abstract get fileExtensions(): string[];

  async start(): Promise<void> {
    if (this.process) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.process = spawn(this.command, this.args, {
          cwd: this.rootPath,
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: process.platform === 'win32',
        });

        // Handle spawn errors (e.g., command not found)
        this.process.on('error', (err) => {
          console.error(`[${this.languageId}] Failed to spawn: ${err.message}`);
          this.process = null;
          reject(new Error(`Language server "${this.command}" not found. Please install it.`));
        });

        // Handle early exit
        this.process.on('exit', (code) => {
          if (!this.initialized) {
            reject(new Error(`Language server exited early with code ${code}`));
          }
          this.emit('exit', code);
          this.process = null;
          this.connection = null;
          this.initialized = false;
        });

        if (!this.process.stdout || !this.process.stdin) {
          throw new Error('Failed to create process streams');
        }

        this.connection = createMessageConnection(
          new StreamMessageReader(this.process.stdout),
          new StreamMessageWriter(this.process.stdin)
        );

        // Handle connection errors
        this.connection.onError((error) => {
          console.error(`[${this.languageId}] Connection error:`, error);
        });

        this.connection.onClose(() => {
          this.initialized = false;
        });

        // Handle diagnostics notifications
        this.connection.onNotification(
          'textDocument/publishDiagnostics',
          (params: PublishDiagnosticsParams) => {
            this.emit('diagnostics', params);
          }
        );

        this.connection.listen();

        // Initialize the language server
        const initParams: InitializeParams = {
          processId: process.pid,
          rootUri: `file://${this.rootPath}`,
          capabilities: {
            textDocument: {
              completion: {
                completionItem: {
                  snippetSupport: true,
                },
              },
              hover: {},
              definition: {},
              synchronization: {
                didSave: true,
              },
            },
          },
          workspaceFolders: [
            {
              uri: `file://${this.rootPath}`,
              name: this.rootPath.split(/[\\/]/).pop() || 'workspace',
            },
          ],
        };

        this.connection.sendRequest('initialize', initParams)
          .then(() => {
            return this.connection!.sendNotification('initialized', {});
          })
          .then(() => {
            this.initialized = true;
            console.log(`[${this.languageId}] Language server started successfully`);
            resolve();
          })
          .catch((err) => {
            console.error(`[${this.languageId}] Failed to initialize:`, err);
            this.stop();
            reject(err);
          });

        this.process.stderr?.on('data', (data) => {
          console.error(`[${this.languageId}] stderr:`, data.toString());
        });
      } catch (error) {
        console.error(`Failed to start ${this.languageId} server:`, error);
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.sendRequest('shutdown');
        this.connection.sendNotification('exit');
      } catch {
        // Server might already be dead
      }
    }

    if (this.process) {
      this.process.kill();
      this.process = null;
    }

    this.connection = null;
    this.initialized = false;
  }

  async didOpen(params: DidOpenTextDocumentParams): Promise<void> {
    if (!this.connection || !this.initialized) return;
    this.connection.sendNotification('textDocument/didOpen', params);
  }

  async didChange(params: DidChangeTextDocumentParams): Promise<void> {
    if (!this.connection || !this.initialized) return;
    this.connection.sendNotification('textDocument/didChange', params);
  }

  async didClose(params: DidCloseTextDocumentParams): Promise<void> {
    if (!this.connection || !this.initialized) return;
    this.connection.sendNotification('textDocument/didClose', params);
  }

  async completion(params: CompletionParams): Promise<CompletionList | CompletionItem[] | null> {
    if (!this.connection || !this.initialized) return null;
    try {
      return await this.connection.sendRequest('textDocument/completion', params);
    } catch (error) {
      console.error('Completion error:', error);
      return null;
    }
  }

  async hover(params: HoverParams): Promise<Hover | null> {
    if (!this.connection || !this.initialized) return null;
    try {
      return await this.connection.sendRequest('textDocument/hover', params);
    } catch (error) {
      console.error('Hover error:', error);
      return null;
    }
  }

  async definition(params: DefinitionParams): Promise<Location | Location[] | null> {
    if (!this.connection || !this.initialized) return null;
    try {
      return await this.connection.sendRequest('textDocument/definition', params);
    } catch (error) {
      console.error('Definition error:', error);
      return null;
    }
  }

  async request(method: string, params: unknown): Promise<unknown> {
    if (!this.connection || !this.initialized) return null;
    try {
      return await this.connection.sendRequest(method, params);
    } catch (error) {
      console.error(`Request ${method} error:`, error);
      return null;
    }
  }

  notify(method: string, params: unknown): void {
    if (!this.connection || !this.initialized) return;
    this.connection.sendNotification(method, params);
  }

  isRunning(): boolean {
    return this.initialized && this.process !== null;
  }
}
