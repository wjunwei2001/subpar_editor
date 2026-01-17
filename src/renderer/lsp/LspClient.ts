import * as monaco from 'monaco-editor';
import type { LspDiagnostic } from '@shared/types';
import { useEditorStore } from '../store/editorStore';

interface LspServerState {
  serverId: string;
  language: string;
  rootPath: string;
}

class LspClient {
  private servers: Map<string, LspServerState> = new Map();
  private documentVersions: Map<string, number> = new Map();
  private notificationListenerRegistered = false;

  private isLspEnabled(): boolean {
    return useEditorStore.getState().lspMode === 'lsp';
  }

  private setupNotificationListener(): void {
    if (this.notificationListenerRegistered) return;
    this.notificationListenerRegistered = true;

    window.electronAPI.lsp.onNotification((sid, method, params) => {
      if (method === 'textDocument/publishDiagnostics') {
        this.handleDiagnostics(params as LspDiagnostic);
      }
    });
  }

  async startServer(language: string, rootPath: string): Promise<string> {
    // Set up notification listener once
    this.setupNotificationListener();

    const serverId = await window.electronAPI.lsp.start(language, rootPath);
    this.servers.set(serverId, { serverId, language, rootPath });

    return serverId;
  }

  async stopServer(serverId: string): Promise<void> {
    await window.electronAPI.lsp.stop(serverId);
    this.servers.delete(serverId);
  }

  findServerForFile(filePath: string): string | null {
    const ext = filePath.substring(filePath.lastIndexOf('.'));

    for (const [serverId, state] of this.servers) {
      if (this.matchesLanguage(ext, state.language)) {
        return serverId;
      }
    }

    return null;
  }

  private matchesLanguage(ext: string, language: string): boolean {
    const languageExtensions: Record<string, string[]> = {
      typescript: ['.ts', '.tsx', '.js', '.jsx'],
      javascript: ['.js', '.jsx'],
      python: ['.py'],
    };

    return languageExtensions[language]?.includes(ext) ?? false;
  }

  async didOpen(filePath: string, content: string, languageId: string): Promise<void> {
    const serverId = this.findServerForFile(filePath);
    if (!serverId) return;

    this.documentVersions.set(filePath, 1);

    window.electronAPI.lsp.notify(serverId, 'textDocument/didOpen', {
      textDocument: {
        uri: `file://${filePath}`,
        languageId,
        version: 1,
        text: content,
      },
    });
  }

  async didChange(filePath: string, content: string): Promise<void> {
    const serverId = this.findServerForFile(filePath);
    if (!serverId) return;

    const version = (this.documentVersions.get(filePath) || 0) + 1;
    this.documentVersions.set(filePath, version);

    window.electronAPI.lsp.notify(serverId, 'textDocument/didChange', {
      textDocument: {
        uri: `file://${filePath}`,
        version,
      },
      contentChanges: [{ text: content }],
    });
  }

  async didClose(filePath: string): Promise<void> {
    const serverId = this.findServerForFile(filePath);
    if (!serverId) return;

    this.documentVersions.delete(filePath);

    window.electronAPI.lsp.notify(serverId, 'textDocument/didClose', {
      textDocument: {
        uri: `file://${filePath}`,
      },
    });
  }

  async getCompletions(
    filePath: string,
    position: { line: number; character: number }
  ): Promise<monaco.languages.CompletionList | null> {
    if (!this.isLspEnabled()) return null;

    const serverId = this.findServerForFile(filePath);
    if (!serverId) return null;

    try {
      const result = await window.electronAPI.lsp.request(serverId, 'textDocument/completion', {
        textDocument: { uri: `file://${filePath}` },
        position,
      });

      if (!result) return null;

      return this.convertCompletions(result);
    } catch (error) {
      console.error('Completion error:', error);
      return null;
    }
  }

  async getHover(
    filePath: string,
    position: { line: number; character: number }
  ): Promise<monaco.languages.Hover | null> {
    if (!this.isLspEnabled()) return null;

    const serverId = this.findServerForFile(filePath);
    if (!serverId) return null;

    try {
      const result = (await window.electronAPI.lsp.request(serverId, 'textDocument/hover', {
        textDocument: { uri: `file://${filePath}` },
        position,
      })) as { contents: unknown; range?: { start: { line: number; character: number }; end: { line: number; character: number } } } | null;

      if (!result) return null;

      return this.convertHover(result);
    } catch (error) {
      console.error('Hover error:', error);
      return null;
    }
  }

  async getDefinition(
    filePath: string,
    position: { line: number; character: number }
  ): Promise<monaco.languages.Location[] | null> {
    if (!this.isLspEnabled()) return null;

    const serverId = this.findServerForFile(filePath);
    if (!serverId) return null;

    try {
      const result = await window.electronAPI.lsp.request(serverId, 'textDocument/definition', {
        textDocument: { uri: `file://${filePath}` },
        position,
      });

      if (!result) return null;

      return this.convertDefinitions(result);
    } catch (error) {
      console.error('Definition error:', error);
      return null;
    }
  }

  private handleDiagnostics(params: LspDiagnostic): void {
    // Skip if LSP is not enabled
    if (!this.isLspEnabled()) return;

    // Convert URI to file path
    const filePath = params.uri.replace('file://', '');

    // Get the Monaco model for this file
    const models = monaco.editor.getModels();
    const model = models.find((m) => {
      const modelPath = m.uri.path.replace(/^\//, '');
      return modelPath === filePath || modelPath === filePath.replace(/\\/g, '/');
    });

    if (!model) return;

    // Convert LSP diagnostics to Monaco markers
    const markers: monaco.editor.IMarkerData[] = params.diagnostics.map((diag) => ({
      severity: this.convertSeverity(diag.severity),
      startLineNumber: diag.range.start.line + 1,
      startColumn: diag.range.start.character + 1,
      endLineNumber: diag.range.end.line + 1,
      endColumn: diag.range.end.character + 1,
      message: diag.message,
      source: diag.source,
    }));

    monaco.editor.setModelMarkers(model, 'lsp', markers);
  }

  private convertSeverity(severity: number): monaco.MarkerSeverity {
    switch (severity) {
      case 1:
        return monaco.MarkerSeverity.Error;
      case 2:
        return monaco.MarkerSeverity.Warning;
      case 3:
        return monaco.MarkerSeverity.Info;
      case 4:
        return monaco.MarkerSeverity.Hint;
      default:
        return monaco.MarkerSeverity.Info;
    }
  }

  private convertCompletions(result: unknown): monaco.languages.CompletionList {
    const items = Array.isArray(result) ? result : (result as { items?: unknown[] })?.items || [];

    return {
      suggestions: items.map((item: {
        label: string;
        kind?: number;
        detail?: string;
        documentation?: string | { value: string };
        insertText?: string;
        textEdit?: { newText: string };
      }) => ({
        label: item.label,
        kind: this.convertCompletionKind(item.kind || 1),
        detail: item.detail,
        documentation: typeof item.documentation === 'string'
          ? item.documentation
          : item.documentation?.value,
        insertText: item.insertText || item.textEdit?.newText || item.label,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      })),
    };
  }

  private convertCompletionKind(kind: number): monaco.languages.CompletionItemKind {
    // LSP CompletionItemKind to Monaco CompletionItemKind
    const kindMap: Record<number, monaco.languages.CompletionItemKind> = {
      1: monaco.languages.CompletionItemKind.Text,
      2: monaco.languages.CompletionItemKind.Method,
      3: monaco.languages.CompletionItemKind.Function,
      4: monaco.languages.CompletionItemKind.Constructor,
      5: monaco.languages.CompletionItemKind.Field,
      6: monaco.languages.CompletionItemKind.Variable,
      7: monaco.languages.CompletionItemKind.Class,
      8: monaco.languages.CompletionItemKind.Interface,
      9: monaco.languages.CompletionItemKind.Module,
      10: monaco.languages.CompletionItemKind.Property,
      11: monaco.languages.CompletionItemKind.Unit,
      12: monaco.languages.CompletionItemKind.Value,
      13: monaco.languages.CompletionItemKind.Enum,
      14: monaco.languages.CompletionItemKind.Keyword,
      15: monaco.languages.CompletionItemKind.Snippet,
    };
    return kindMap[kind] || monaco.languages.CompletionItemKind.Text;
  }

  private convertHover(result: {
    contents: unknown;
    range?: { start: { line: number; character: number }; end: { line: number; character: number } };
  }): monaco.languages.Hover {
    const contents = Array.isArray(result.contents) ? result.contents : [result.contents];

    return {
      contents: contents.map((content) => {
        if (typeof content === 'string') {
          return { value: content };
        }
        if (content && typeof content === 'object' && 'value' in content) {
          return { value: (content as { value: string }).value };
        }
        return { value: String(content) };
      }),
      range: result.range
        ? new monaco.Range(
            result.range.start.line + 1,
            result.range.start.character + 1,
            result.range.end.line + 1,
            result.range.end.character + 1
          )
        : undefined,
    };
  }

  private convertDefinitions(result: unknown): monaco.languages.Location[] {
    const locations = Array.isArray(result) ? result : [result];

    return locations
      .filter((loc): loc is { uri: string; range: { start: { line: number; character: number }; end: { line: number; character: number } } } =>
        loc && typeof loc === 'object' && 'uri' in loc
      )
      .map((loc) => ({
        uri: monaco.Uri.parse(loc.uri),
        range: new monaco.Range(
          loc.range.start.line + 1,
          loc.range.start.character + 1,
          loc.range.end.line + 1,
          loc.range.end.character + 1
        ),
      }));
  }
}

// Singleton instance
export const lspClient = new LspClient();
