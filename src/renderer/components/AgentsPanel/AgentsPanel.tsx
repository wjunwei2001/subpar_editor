import { useEffect, useRef } from 'react';
import { useAgentStore } from '../../store/agentStore';
import { useEditorStore } from '../../store/editorStore';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { AdPanel } from './AdPanel';
import { QuotaIndicator } from './QuotaIndicator';
import { Bot, Sparkles } from '../Icons';

export function AgentsPanel() {
  const { state, quota, messages, isLoading, sendMessage, contextFiles, addContextFile, removeContextFile } = useAgentStore();
  const { activeFile, openFiles } = useEditorStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add current file to context
  const handleAddCurrentFile = async () => {
    if (!activeFile) return;
    const file = openFiles.find((f) => f.path === activeFile);
    if (file) {
      addContextFile({ path: file.path, content: file.content });
    }
  };

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Timer check effect
  useEffect(() => {
    const interval = setInterval(() => {
      useAgentStore.getState().checkTimers();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    if (state === 'positive' && quota > 0) {
      sendMessage(suggestion);
    }
  };

  // NEUTRAL STATE - Panel disabled
  if (state === 'neutral') {
    return (
      <div className="agent-panel agent-panel-disabled">
        <div className="agent-panel-header">
          <span>AI AGENT</span>
        </div>
        <div className="agent-panel-empty">
          <div className="agent-disabled-icon">
            <Bot size={48} strokeWidth={1.5} />
          </div>
          <p>Agent features disabled</p>
          <p className="agent-disabled-hint">Pull a lootbox to enable</p>
        </div>
      </div>
    );
  }

  // NEGATIVE STATE - Ad space
  if (state === 'negative') {
    return (
      <div className="agent-panel agent-panel-negative">
        <div className="agent-panel-header agent-header-negative">
          <Sparkles size={16} strokeWidth={2} />
          <span>SPECIAL OFFERS</span>
          <Sparkles size={16} strokeWidth={2} />
        </div>
        <AdPanel />
      </div>
    );
  }

  // POSITIVE STATE - Full functionality
  return (
    <div className="agent-panel">
      <div className="agent-panel-header">
        <span>AI AGENT</span>
        <QuotaIndicator quota={quota} />
      </div>

      {/* Context Files */}
      <div className="agent-context">
        <div className="agent-context-header">
          <span>Context Files</span>
          <button
            className="agent-add-file-btn"
            onClick={handleAddCurrentFile}
            disabled={!activeFile}
            title="Add current file"
          >
            + Add Current File
          </button>
        </div>
        {contextFiles.length > 0 && (
          <div className="agent-context-files">
            {contextFiles.map((f) => (
              <div key={f.path} className="agent-context-file">
                <span className="agent-context-filename">{f.path.split('/').pop()}</span>
                <button
                  className="agent-context-remove"
                  onClick={() => removeContextFile(f.path)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="agent-messages">
        {messages.length === 0 ? (
          <div className="agent-welcome">
            <p>Ask me anything about your code!</p>
            <ul className="agent-suggestions">
              <li onClick={() => handleSuggestionClick('Explain this function')}>
                Explain this function
              </li>
              <li onClick={() => handleSuggestionClick('Find bugs in my code')}>
                Find bugs in my code
              </li>
              <li onClick={() => handleSuggestionClick('Suggest refactoring')}>
                Suggest refactoring
              </li>
            </ul>
          </div>
        ) : (
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}
        {isLoading && (
          <div className="agent-typing">
            <span className="typing-indicator">●●●</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput disabled={isLoading || quota <= 0} />
    </div>
  );
}
