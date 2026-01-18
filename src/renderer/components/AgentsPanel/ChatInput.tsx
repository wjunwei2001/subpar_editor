import { useState, useRef, useEffect, useMemo } from 'react';
import { useAgentStore } from '../../store/agentStore';
import { useEditorStore } from '../../store/editorStore';
import type { FileEntry } from '@shared/types';
import { File } from '../Icons';

interface ChatInputProps {
  disabled: boolean;
}

// Flatten file tree to get all file paths
function flattenFileTree(entries: FileEntry[], prefix = ''): string[] {
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = entry.path;
    if (entry.isDirectory && entry.children) {
      files.push(...flattenFileTree(entry.children, fullPath));
    } else if (!entry.isDirectory) {
      files.push(fullPath);
    }
  }
  return files;
}

export function ChatInput({ disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  const { sendMessage, quota, addContextFile } = useAgentStore();
  const { fileTree, openFiles } = useEditorStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  // Get all files from the file tree + open files as fallback
  const allFiles = useMemo(() => {
    const treeFiles = flattenFileTree(fileTree);
    const openFilePaths = openFiles.map((f) => f.path);
    // Combine and deduplicate
    const combined = [...new Set([...treeFiles, ...openFilePaths])];
    console.log('[AgentInput] Available files:', combined.length, combined.slice(0, 5));
    return combined;
  }, [fileTree, openFiles]);

  // Filter files based on mention filter
  const filteredFiles = useMemo(() => {
    if (!mentionFilter) return allFiles.slice(0, 10);
    const lower = mentionFilter.toLowerCase();
    return allFiles
      .filter((f) => f.toLowerCase().includes(lower) || f.split('/').pop()?.toLowerCase().includes(lower))
      .slice(0, 10);
  }, [allFiles, mentionFilter]);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      sendMessage(input.trim());
      setInput('');
      setShowMentions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Check for @ mention
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@([^\s]*)$/);

    console.log('[AgentInput] Input changed:', { value, cursorPos, textBeforeCursor, atMatch });

    if (atMatch) {
      console.log('[AgentInput] Showing mentions for:', atMatch[1]);
      setShowMentions(true);
      setMentionFilter(atMatch[1]);
      setSelectedMentionIndex(0);
    } else {
      setShowMentions(false);
      setMentionFilter('');
    }
  };

  const handleSelectFile = async (filePath: string) => {
    // Replace the @mention with the filename
    const cursorPos = textareaRef.current?.selectionStart || input.length;
    const textBeforeCursor = input.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@([^\s@]*)$/);

    if (atMatch) {
      const beforeAt = textBeforeCursor.slice(0, atMatch.index);
      const afterCursor = input.slice(cursorPos);
      const fileName = filePath.split('/').pop() || filePath;
      setInput(`${beforeAt}@${fileName} ${afterCursor}`);
    }

    // Load file content and add to context
    try {
      const content = await window.electronAPI.fs.readFile(filePath);
      addContextFile({ path: filePath, content });
    } catch (err) {
      console.error('Failed to load file:', err);
    }

    setShowMentions(false);
    setMentionFilter('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex((i) => Math.min(i + 1, filteredFiles.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filteredFiles[selectedMentionIndex]) {
          handleSelectFile(filteredFiles[selectedMentionIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="agent-input-container">
      {showMentions && filteredFiles.length > 0 && (
        <div className="agent-mentions" ref={mentionsRef}>
          {filteredFiles.map((file, index) => (
            <div
              key={file}
              className={`agent-mention-item ${index === selectedMentionIndex ? 'selected' : ''}`}
              onClick={() => handleSelectFile(file)}
            >
              <span className="agent-mention-icon">
                <File size={14} strokeWidth={1.5} />
              </span>
              <span className="agent-mention-path">{file}</span>
            </div>
          ))}
        </div>
      )}
      <textarea
        ref={textareaRef}
        className="agent-input"
        placeholder={quota <= 0 ? 'Out of tokens!' : 'Ask a question... (use @ to mention files)'}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
      />
      <button
        className="agent-send-button"
        onClick={handleSubmit}
        disabled={disabled || !input.trim()}
      >
        ↑
      </button>
    </div>
  );
}
