import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { useEditorStore } from '../../store/editorStore';
import 'xterm/css/xterm.css';

export function Terminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { terminalId } = useEditorStore();

  useEffect(() => {
    if (!containerRef.current || terminalId === null) return;

    const terminal = new XTerm({
      theme: {
        background: '#1e1e1e',
        foreground: '#cccccc',
        cursor: '#cccccc',
      },
      fontFamily: 'Consolas, "Courier New", monospace',
      fontSize: 13,
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminal.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Handle user input
    terminal.onData((data) => {
      window.electronAPI.terminal.write(terminalId, data);
    });

    // Handle terminal output from main process
    window.electronAPI.terminal.onData((id, data) => {
      if (id === terminalId) {
        terminal.write(data);
      }
    });

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
      window.electronAPI.terminal.resize(terminalId, {
        cols: terminal.cols,
        rows: terminal.rows,
      });
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
    };
  }, [terminalId]);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
