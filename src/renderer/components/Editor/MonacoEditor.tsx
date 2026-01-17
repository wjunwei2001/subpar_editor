import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useEditorStore } from '../../store/editorStore';
import { loremInlineCompletionsProvider } from '../../services/autocomplete';
import { useGitStore } from '../../store/gitStore';
import { lspClient } from '../../lsp/LspClient';
import { RandomDecorator } from '../../services/randomDecorator';

import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_: unknown, label: string) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

// Register inline completions provider for all languages (Copilot-style autocomplete)
const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'json', 'html', 'css', 'markdown', 'plaintext'
];
SUPPORTED_LANGUAGES.forEach(lang => {
  monaco.languages.registerInlineCompletionsProvider(lang, loremInlineCompletionsProvider);
});
console.log('[Monaco] Registered inline completions provider for:', SUPPORTED_LANGUAGES);
// Track if LSP providers are registered
let lspProvidersRegistered = false;

function registerLspProviders() {
  if (lspProvidersRegistered) return;
  lspProvidersRegistered = true;

  const supportedLanguages = ['typescript', 'javascript', 'python'];

  // Register completion provider
  monaco.languages.registerCompletionItemProvider(supportedLanguages, {
    provideCompletionItems: async (model, position) => {
      const filePath = model.uri.path.replace(/^\//, '');
      const result = await lspClient.getCompletions(filePath, {
        line: position.lineNumber - 1,
        character: position.column - 1,
      });
      return result || { suggestions: [] };
    },
  });

  // Register hover provider
  monaco.languages.registerHoverProvider(supportedLanguages, {
    provideHover: async (model, position) => {
      const filePath = model.uri.path.replace(/^\//, '');
      return await lspClient.getHover(filePath, {
        line: position.lineNumber - 1,
        character: position.column - 1,
      });
    },
  });

  // Register definition provider
  monaco.languages.registerDefinitionProvider(supportedLanguages, {
    provideDefinition: async (model, position) => {
      const filePath = model.uri.path.replace(/^\//, '');
      return await lspClient.getDefinition(filePath, {
        line: position.lineNumber - 1,
        character: position.column - 1,
      });
    },
  });
}

export function MonacoEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const lastFileRef = useRef<string | null>(null);
  const isInternalChange = useRef(false);
  const randomDecoratorRef = useRef<RandomDecorator | null>(null);
  const { activeFile, currentFolder, openFiles, lspMode } = useEditorStore();

  // Get active file data
  const activeFileData = openFiles.find((f) => f.path === activeFile);

  // Start LSP servers when folder is opened (only if lspMode is 'lsp')
  useEffect(() => {
    if (!currentFolder || lspMode !== 'lsp') return;

    // Register LSP providers first (they handle missing servers gracefully)
    registerLspProviders();

    // Start TypeScript language server (optional - will fail gracefully if not installed)
    lspClient.startServer('typescript', currentFolder).catch((err) => {
      console.warn('TypeScript LSP not available:', err.message || err);
      console.warn('Install with: npm install -g typescript-language-server typescript');
    });

    // Start Python language server (optional - will fail gracefully if not installed)
    lspClient.startServer('python', currentFolder).catch((err) => {
      console.warn('Python LSP not available:', err.message || err);
      console.warn('Install with: pip install python-lsp-server');
    });
  }, [currentFolder, lspMode]);

  // Create editor once
  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: '',
      language: 'plaintext',
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      inlineSuggest: {
        enabled: true,
      },
    });

    let changeTimeout: ReturnType<typeof setTimeout>;

    editorRef.current.onDidChangeModelContent(() => {
      // Skip if this change was triggered by us loading a file
      if (isInternalChange.current) return;

      const value = editorRef.current?.getValue() || '';
      const { activeFile: currentActiveFile, updateFileContent: update } = useEditorStore.getState();
      if (currentActiveFile) {
        update(currentActiveFile, value);
      }

      // Debounce LSP notifications (only if LSP mode is active)
      clearTimeout(changeTimeout);
      changeTimeout = setTimeout(() => {
        const { activeFile: file, lspMode: mode } = useEditorStore.getState();
        if (file && mode === 'lsp') {
          lspClient.didChange(file, value);
        }
      }, 300);
    });

    // Save shortcut
    editorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      const { activeFile: file, currentFolder: folder, saveFile } = useEditorStore.getState();
      if (file) {
        await saveFile(file);
        // Refresh git status after save
        if (folder) {
          useGitStore.getState().refreshStatus(folder);
        }
      }
    });

    // Manual trigger for inline suggestions (Ctrl/Cmd + Shift + Space)
    editorRef.current.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Space,
      () => {
        console.log('[Monaco] Manually triggering inline suggestions');
        editorRef.current?.trigger('keyboard', 'editor.action.inlineSuggest.trigger', {});
      }
    );

    return () => {
      clearTimeout(changeTimeout);
      editorRef.current?.dispose();
    };
  }, []);

  // Manage LSP mode changes - toggle Monaco's built-in validation
  useEffect(() => {
    if (!editorRef.current) return;

    const model = editorRef.current.getModel();

    // Configure Monaco's built-in TypeScript/JavaScript diagnostics
    // Only disable for 'random' mode - keep baseline for both 'lsp' and 'off'
    const diagnosticsEnabled = lspMode !== 'random';

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: !diagnosticsEnabled,
      noSyntaxValidation: !diagnosticsEnabled,
    });
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: !diagnosticsEnabled,
      noSyntaxValidation: !diagnosticsEnabled,
    });

    // Clear all markers only when switching to 'random' mode
    if (lspMode === 'random' && model) {
      monaco.editor.setModelMarkers(model, 'lsp', []);
      monaco.editor.setModelMarkers(model, 'typescript', []);
      monaco.editor.setModelMarkers(model, 'javascript', []);
    }

    if (lspMode === 'random') {
      const editor = editorRef.current;
      // Always recreate decorator to ensure fresh state
      if (randomDecoratorRef.current) {
        randomDecoratorRef.current.stop();
      }
      randomDecoratorRef.current = new RandomDecorator(editor, {
        intervalMs: 400,      // Update every 400ms
        maxDecorations: 40,   // Up to 40 decorations at once
      });
      randomDecoratorRef.current.start();
    } else {
      // Stop and clear random decorator
      if (randomDecoratorRef.current) {
        randomDecoratorRef.current.stop();
        randomDecoratorRef.current = null;
      }
    }

    return () => {
      if (randomDecoratorRef.current) {
        randomDecoratorRef.current.stop();
      }
    };
  }, [lspMode]);

  // Handle file changes - only when activeFile changes
  useEffect(() => {
    if (!editorRef.current || !activeFile || !activeFileData) return;

    // Only load content when switching to a different file
    if (lastFileRef.current === activeFile) return;

    const model = editorRef.current.getModel();
    if (model) {
      // Close previous file in LSP (only if LSP mode)
      if (lastFileRef.current && lspMode === 'lsp') {
        lspClient.didClose(lastFileRef.current);
      }

      // Set flag to prevent onDidChangeModelContent from firing
      isInternalChange.current = true;
      model.setValue(activeFileData.content);
      isInternalChange.current = false;

      const language = getLanguage(activeFile);
      monaco.editor.setModelLanguage(model, language);

      // Notify LSP of file open (only if LSP mode)
      if (lspMode === 'lsp') {
        lspClient.didOpen(activeFile, activeFileData.content, language);
      }
      lastFileRef.current = activeFile;
    }
  }, [activeFile, activeFileData, lspMode]);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}

function getLanguage(filepath: string): string {
  const ext = filepath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'json':
      return 'json';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'md':
      return 'markdown';
    default:
      return 'plaintext';
  }
}
