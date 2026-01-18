import type { AgentMessage } from '../../store/agentStore';
import { User, Bot } from '../Icons';

interface ChatMessageProps {
  message: AgentMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-agent'}`}>
      <div className="chat-message-avatar">
        {isUser ? <User size={18} strokeWidth={2} /> : <Bot size={18} strokeWidth={2} />}
      </div>
      <div className="chat-message-content">
        <div className="chat-message-text">{message.content}</div>
        <div className="chat-message-time">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
