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

// Define custom "Eye Pain" theme for negative color mode
monaco.editor.defineTheme('eye-pain', {
  base: 'vs-dark',
  inherit: false,
  rules: [
    { token: '', foreground: '9ef023', background: '2200ff' },
    { token: 'comment', foreground: 'ea00e9', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'fd0403', fontStyle: 'bold' },
    { token: 'string', foreground: '9ef023' },
    { token: 'number', foreground: 'd0064a' },
    { token: 'type', foreground: '5d0bd6' },
    { token: 'class', foreground: 'af0070' },
    { token: 'function', foreground: '7f149f' },
    { token: 'variable', foreground: 'ea00e9' },
    { token: 'constant', foreground: 'fd0403' },
    { token: 'parameter', foreground: 'd0064a' },
    { token: 'property', foreground: '5d0bd6' },
    { token: 'operator', foreground: '9ef023' },
    { token: 'punctuation', foreground: 'ea00e9' },
    { token: 'tag', foreground: 'fd0403' },
    { token: 'attribute.name', foreground: 'af0070' },
    { token: 'attribute.value', foreground: '9ef023' },
  ],
  colors: {
    'editor.background': '#2200ff',
    'editor.foreground': '#9ef023',
    'editor.lineHighlightBackground': '#1a00cc',
    'editor.selectionBackground': '#af007080',
    'editor.inactiveSelectionBackground': '#5d0bd650',
    'editorCursor.foreground': '#fd0403',
    'editorWhitespace.foreground': '#5d0bd6',
    'editorIndentGuide.background': '#5d0bd650',
    'editorIndentGuide.activeBackground': '#ea00e9',
    'editorLineNumber.foreground': '#ea00e9',
    'editorLineNumber.activeForeground': '#fd0403',
    'editorGutter.background': '#1a00cc',
    'editor.wordHighlightBackground': '#af007040',
    'editor.wordHighlightStrongBackground': '#fd040340',
    'editorBracketMatch.background': '#9ef02340',
    'editorBracketMatch.border': '#9ef023',
    'minimap.background': '#1a00cc',
    'scrollbarSlider.background': '#5d0bd680',
    'scrollbarSlider.hoverBackground': '#ea00e980',
    'scrollbarSlider.activeBackground': '#fd040380',
  },
});

// Define light theme
monaco.editor.defineTheme('vs-light-custom', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#333333',
  },
});

// Define invisible dark theme - text same color as background
monaco.editor.defineTheme('invisible-dark', {
  base: 'vs-dark',
  inherit: false,
  rules: [
    { token: '', foreground: '1e1e1e', background: '1e1e1e' },
    { token: 'comment', foreground: '1e1e1e' },
    { token: 'keyword', foreground: '1e1e1e' },
    { token: 'string', foreground: '1e1e1e' },
    { token: 'number', foreground: '1e1e1e' },
    { token: 'type', foreground: '1e1e1e' },
    { token: 'class', foreground: '1e1e1e' },
    { token: 'function', foreground: '1e1e1e' },
    { token: 'variable', foreground: '1e1e1e' },
    { token: 'constant', foreground: '1e1e1e' },
    { token: 'parameter', foreground: '1e1e1e' },
    { token: 'property', foreground: '1e1e1e' },
    { token: 'operator', foreground: '1e1e1e' },
    { token: 'punctuation', foreground: '1e1e1e' },
    { token: 'tag', foreground: '1e1e1e' },
    { token: 'attribute.name', foreground: '1e1e1e' },
    { token: 'attribute.value', foreground: '1e1e1e' },
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#1e1e1e',
    'editor.lineHighlightBackground': '#1e1e1e',
    'editor.selectionBackground': '#264f78',
    'editorCursor.foreground': '#1e1e1e',
    'editorLineNumber.foreground': '#1e1e1e',
    'editorLineNumber.activeForeground': '#1e1e1e',
  },
});

// Define invisible light theme - text same color as background
monaco.editor.defineTheme('invisible-light', {
  base: 'vs',
  inherit: false,
  rules: [
    { token: '', foreground: 'ffffff', background: 'ffffff' },
    { token: 'comment', foreground: 'ffffff' },
    { token: 'keyword', foreground: 'ffffff' },
    { token: 'string', foreground: 'ffffff' },
    { token: 'number', foreground: 'ffffff' },
    { token: 'type', foreground: 'ffffff' },
    { token: 'class', foreground: 'ffffff' },
    { token: 'function', foreground: 'ffffff' },
    { token: 'variable', foreground: 'ffffff' },
    { token: 'constant', foreground: 'ffffff' },
    { token: 'parameter', foreground: 'ffffff' },
    { token: 'property', foreground: 'ffffff' },
    { token: 'operator', foreground: 'ffffff' },
    { token: 'punctuation', foreground: 'ffffff' },
    { token: 'tag', foreground: 'ffffff' },
    { token: 'attribute.name', foreground: 'ffffff' },
    { token: 'attribute.value', foreground: 'ffffff' },
  ],
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#ffffff',
    'editor.lineHighlightBackground': '#ffffff',
    'editor.selectionBackground': '#add6ff',
    'editorCursor.foreground': '#ffffff',
    'editorLineNumber.foreground': '#ffffff',
    'editorLineNumber.activeForeground': '#ffffff',
  },
});

// Define invisible eye-pain theme - text same color as background
monaco.editor.defineTheme('invisible-eye-pain', {
  base: 'vs-dark',
  inherit: false,
  rules: [
    { token: '', foreground: '2200ff', background: '2200ff' },
    { token: 'comment', foreground: '2200ff' },
    { token: 'keyword', foreground: '2200ff' },
    { token: 'string', foreground: '2200ff' },
    { token: 'number', foreground: '2200ff' },
    { token: 'type', foreground: '2200ff' },
    { token: 'class', foreground: '2200ff' },
    { token: 'function', foreground: '2200ff' },
    { token: 'variable', foreground: '2200ff' },
    { token: 'constant', foreground: '2200ff' },
    { token: 'parameter', foreground: '2200ff' },
    { token: 'property', foreground: '2200ff' },
    { token: 'operator', foreground: '2200ff' },
    { token: 'punctuation', foreground: '2200ff' },
    { token: 'tag', foreground: '2200ff' },
    { token: 'attribute.name', foreground: '2200ff' },
    { token: 'attribute.value', foreground: '2200ff' },
  ],
  colors: {
    'editor.background': '#2200ff',
    'editor.foreground': '#2200ff',
    'editor.lineHighlightBackground': '#2200ff',
    'editor.selectionBackground': '#af007080',
    'editorCursor.foreground': '#2200ff',
    'editorLineNumber.foreground': '#2200ff',
    'editorLineNumber.activeForeground': '#2200ff',
  },
});

// Register inline completions provider for all languages (Copilot-style autocomplete)
const SUPPORTED_LANGUAGES = [
  'javascript', 'typescript', 'python', 'json', 'html', 'css', 'markdown', 'plaintext'
];
SUPPORTED_LANGUAGES.forEach(lang => {
  monaco.languages.registerInlineCompletionsProvider(lang, loremInlineCompletionsProvider);
});
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
  const previousLineCountRef = useRef<number>(0);
  const { activeFile, currentFolder, openFiles, lspMode, autocompleteMode, textSizeMode, colorMode, themePreference, codeEditingMode, codeVisibilityMode } = useEditorStore();

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

    editorRef.current.onDidChangeModelContent((event) => {
      // Skip if this change was triggered by us loading a file
      if (isInternalChange.current) return;

      const editor = editorRef.current;
      if (!editor) return;

      const model = editor.getModel();
      if (!model) return;

      const currentLineCount = model.getLineCount();
      const {
        activeFile: currentActiveFile,
        updateFileContent: update,
        codeEditingMode: editMode,
        consumeCodeEditingQuota,
        setCodeEditingMode,
      } = useEditorStore.getState();

      // Handle positive mode - consume quota based on characters typed
      if (editMode === 'positive') {
        // Calculate total characters added in this change
        const charsTyped = event.changes.reduce((total, change) => {
          return total + change.text.length;
        }, 0);

        if (charsTyped > 0) {
          const consumed = consumeCodeEditingQuota(charsTyped);
          if (!consumed) {
            // Quota depleted - switch to read-only mode
            setCodeEditingMode('neutral');
            console.log('Code editing quota depleted! Switching to read-only mode.');
          }
        }
      }

      // Handle negative mode - random line deletion when a line is added
      if (editMode === 'negative' && currentLineCount > previousLineCountRef.current && previousLineCountRef.current > 0) {
        // A line was added - delete a random line!
        const lineToDelete = Math.floor(Math.random() * currentLineCount) + 1;

        // Don't delete the only line
        if (currentLineCount > 1) {
          isInternalChange.current = true;

          // Get the range of the line to delete (including the newline)
          const lineContent = model.getLineContent(lineToDelete);
          const lineLength = lineContent.length;

          let range: monaco.IRange;
          if (lineToDelete === currentLineCount) {
            // Last line - delete from end of previous line
            range = {
              startLineNumber: lineToDelete - 1,
              startColumn: model.getLineMaxColumn(lineToDelete - 1),
              endLineNumber: lineToDelete,
              endColumn: lineLength + 1,
            };
          } else {
            // Not last line - delete entire line including newline
            range = {
              startLineNumber: lineToDelete,
              startColumn: 1,
              endLineNumber: lineToDelete + 1,
              endColumn: 1,
            };
          }

          // Apply the edit
          editor.executeEdits('cursed-delete', [{
            range,
            text: '',
          }]);

          isInternalChange.current = false;

          // Show a toast-like message (log for now)
          console.log(`Cursed! Deleted line ${lineToDelete}: "${lineContent.substring(0, 30)}..."`);
        }
      }

      // Update previous line count
      previousLineCountRef.current = model.getLineCount();

      if (currentActiveFile) {
        update(currentActiveFile, editor.getValue());
      }

      // Debounce LSP notifications (only if LSP mode is active)
      clearTimeout(changeTimeout);
      changeTimeout = setTimeout(() => {
        const { activeFile: file, lspMode: mode } = useEditorStore.getState();
        if (file && mode === 'lsp') {
          lspClient.didChange(file, editor.getValue());
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
        editorRef.current?.trigger('keyboard', 'editor.action.inlineSuggest.trigger', {});
      }
    );

    return () => {
      clearTimeout(changeTimeout);
      editorRef.current?.dispose();
    };
  }, []);

  // Update Monaco theme based on color mode, theme preference, and visibility mode
  useEffect(() => {
    if (!editorRef.current) return;

    let themeName: string;
    if (codeVisibilityMode === 'invisible') {
      // Invisible mode - use invisible variant of current theme
      if (colorMode === 'negative') {
        themeName = 'invisible-eye-pain';
      } else {
        themeName = themePreference === 'light' ? 'invisible-light' : 'invisible-dark';
      }
    } else {
      // Normal visibility
      if (colorMode === 'negative') {
        themeName = 'eye-pain';
      } else {
        themeName = themePreference === 'light' ? 'vs-light-custom' : 'vs-dark';
      }
    }

    monaco.editor.setTheme(themeName);
  }, [colorMode, themePreference, codeVisibilityMode]);

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

  // Force autocomplete trigger in negative/cursed mode
  useEffect(() => {
    if (!editorRef.current || autocompleteMode !== 'negative') return;

    // Periodically trigger inline suggestions in negative mode (annoying!)
    const interval = setInterval(() => {
      if (editorRef.current) {
        editorRef.current.trigger('auto', 'editor.action.inlineSuggest.trigger', {});
      }
    }, 3000); // Every 3 seconds

    return () => clearInterval(interval);
  }, [autocompleteMode]);

  // Handle text size mode changes
  useEffect(() => {
    if (!editorRef.current) return;

    const fontSize = textSizeMode === 'negative' ? 6 : 14;
    editorRef.current.updateOptions({ fontSize });
  }, [textSizeMode]);

  // Handle code editing mode - read-only for neutral mode
  useEffect(() => {
    if (!editorRef.current) return;

    // Set editor to read-only in neutral mode
    editorRef.current.updateOptions({
      readOnly: codeEditingMode === 'neutral',
    });
  }, [codeEditingMode]);

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

      // Initialize line count for curse tracking
      previousLineCountRef.current = model.getLineCount();

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
