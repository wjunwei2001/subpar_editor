import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useEditorStore } from '../../store/editorStore';
import { loremInlineCompletionsProvider } from '../../services/autocomplete';

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

export function MonacoEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { currentFile, fileContent, setFileContent, setIsDirty } = useEditorStore();

  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: fileContent,
      language: getLanguage(currentFile || ''),
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

    editorRef.current.onDidChangeModelContent(() => {
      const value = editorRef.current?.getValue() || '';
      setFileContent(value);
      setIsDirty(true);
    });

    // Save shortcut
    editorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      if (currentFile) {
        const value = editorRef.current?.getValue() || '';
        await window.electronAPI.fs.writeFile(currentFile, value);
        setIsDirty(false);
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
      editorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        model.setValue(fileContent);
        monaco.editor.setModelLanguage(model, getLanguage(currentFile || ''));
      }
    }
  }, [currentFile, fileContent]);

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
