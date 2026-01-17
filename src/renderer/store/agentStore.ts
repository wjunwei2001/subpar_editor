import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEditorStore } from './editorStore';

export type AgentState = 'positive' | 'neutral' | 'negative';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface FileContext {
  path: string;
  content: string;
}

interface AgentStoreState {
  // Tri-state
  state: AgentState;

  // Quota management
  quota: number;
  quotaExpiresAt: number | null;

  // Chat state
  messages: AgentMessage[];
  isLoading: boolean;
  currentRequestId: string | null;

  // File context
  contextFiles: FileContext[];

  // Negative state timer
  negativeExpiresAt: number | null;

  // Actions
  setState: (state: AgentState) => void;
  setQuota: (quota: number) => void;
  addQuota: (amount: number) => void;
  consumeQuota: (amount: number) => void;

  // File context actions
  addContextFile: (file: FileContext) => void;
  removeContextFile: (path: string) => void;
  clearContextFiles: () => void;

  // Message actions
  sendMessage: (content: string) => Promise<void>;
  addMessage: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  cancelRequest: () => void;

  // Timer management
  setNegativeTimer: (durationMs: number) => void;
  checkTimers: () => void;

  // Computed helpers
  isActive: () => boolean;
}

export const useAgentStore = create<AgentStoreState>()(
  persist(
    (set, get) => ({
      // Initial state - positive for testing (change to 'neutral' and 0 for production)
      state: 'positive',
      quota: 100,
      quotaExpiresAt: null,
      messages: [],
      isLoading: false,
      currentRequestId: null,
      contextFiles: [],
      negativeExpiresAt: null,

      setState: (state) => set({ state }),

      addContextFile: (file) =>
        set((s) => {
          // Don't add duplicates
          if (s.contextFiles.some((f) => f.path === file.path)) {
            return { contextFiles: s.contextFiles.map((f) => (f.path === file.path ? file : f)) };
          }
          return { contextFiles: [...s.contextFiles, file] };
        }),

      removeContextFile: (path) =>
        set((s) => ({ contextFiles: s.contextFiles.filter((f) => f.path !== path) })),

      clearContextFiles: () => set({ contextFiles: [] }),

      setQuota: (quota) => set({ quota }),

      addQuota: (amount) =>
        set((s) => ({
          quota: s.quota + amount,
          state: 'positive', // Adding quota activates positive state
        })),

      consumeQuota: (amount) => {
        const current = get().quota;
        const newQuota = Math.max(0, current - amount);
        set({ quota: newQuota });

        // If quota depleted, switch to neutral
        if (newQuota <= 0) {
          set({ state: 'neutral' });
        }
      },

      sendMessage: async (content: string) => {
        const { quota, state, consumeQuota, contextFiles } = get();

        // Prevent sending if not in positive state or no quota
        if (state !== 'positive' || quota <= 0) {
          return;
        }

        // Generate unique request ID
        const requestId = `agent-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // Build user message with file context
        let fullContent = content;
        if (contextFiles.length > 0) {
          const fileContext = contextFiles
            .map((f) => `<file path="${f.path}">\n${f.content}\n</file>`)
            .join('\n\n');
          fullContent = `${fileContext}\n\n${content}`;
        }

        // Add user message (show original content to user, send full content to API)
        const userMessage: AgentMessage = {
          id: `msg-${Date.now()}`,
          role: 'user',
          content,
          timestamp: Date.now(),
        };

        set((s) => ({
          messages: [...s.messages, userMessage],
          isLoading: true,
          currentRequestId: requestId,
        }));

        // Consume quota for the request
        consumeQuota(1);

        try {
          // Get last 10 messages for context, but use full content for the latest
          const contextMessages = get().messages.slice(-10).map((m, i, arr) => ({
            role: m.role,
            content: i === arr.length - 1 && m.role === 'user' ? fullContent : m.content,
          }));

          // Call LLM via IPC
          const response = await window.electronAPI.agent.chat({
            requestId,
            messages: contextMessages,
            contextFiles: contextFiles.map((f) => f.path),
          });

          if (response && response.content) {
            // Check for file edits in the response
            const fileEditRegex = /<file_edit path="([^"]+)">([\s\S]*?)<\/file_edit>/g;
            let match;
            const edits: { path: string; content: string }[] = [];

            while ((match = fileEditRegex.exec(response.content)) !== null) {
              let filePath = match[1].trim();

              // Resolve relative paths to absolute using currentFolder
              if (!filePath.startsWith('/')) {
                const currentFolder = useEditorStore.getState().currentFolder;
                if (currentFolder) {
                  filePath = `${currentFolder}/${filePath}`;
                }
              }

              edits.push({ path: filePath, content: match[2].trim() });
            }

            // Apply file edits
            for (const edit of edits) {
              try {
                console.log(`[Agent] Writing to ${edit.path}`);
                await window.electronAPI.fs.writeFile(edit.path, edit.content);
                console.log(`[Agent] Applied edit to ${edit.path}`);
                // Reload file in editor if it's open
                await useEditorStore.getState().reloadFile(edit.path);
              } catch (err) {
                console.error(`[Agent] Failed to edit ${edit.path}:`, err);
              }
            }

            const assistantMessage: AgentMessage = {
              id: `msg-${Date.now()}`,
              role: 'assistant',
              content: response.content,
              timestamp: Date.now(),
            };

            set((s) => ({
              messages: [...s.messages, assistantMessage],
            }));
          }
        } catch (error) {
          console.error('Agent chat error:', error);
          // Add error message
          const errorMessage: AgentMessage = {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: 'Sorry, I encountered an error. Please try again.',
            timestamp: Date.now(),
          };
          set((s) => ({
            messages: [...s.messages, errorMessage],
          }));
        } finally {
          set({ isLoading: false, currentRequestId: null });
        }
      },

      addMessage: (message) => {
        const newMessage: AgentMessage = {
          ...message,
          id: `msg-${Date.now()}`,
          timestamp: Date.now(),
        };
        set((s) => ({ messages: [...s.messages, newMessage] }));
      },

      clearMessages: () => set({ messages: [] }),

      cancelRequest: () => {
        const { currentRequestId } = get();
        if (currentRequestId) {
          window.electronAPI.agent.cancel(currentRequestId);
          set({ isLoading: false, currentRequestId: null });
        }
      },

      setNegativeTimer: (durationMs) => {
        set({
          state: 'negative',
          negativeExpiresAt: Date.now() + durationMs,
        });
      },

      checkTimers: () => {
        const { state, negativeExpiresAt, quotaExpiresAt } = get();
        const now = Date.now();

        // Check negative state timer
        if (state === 'negative' && negativeExpiresAt && now >= negativeExpiresAt) {
          set({ state: 'neutral', negativeExpiresAt: null });
        }

        // Check quota expiration
        if (quotaExpiresAt && now >= quotaExpiresAt) {
          set({ quota: 0, quotaExpiresAt: null, state: 'neutral' });
        }
      },

      isActive: () => get().state === 'positive' && get().quota > 0,
    }),
    {
      name: 'agent-store',
      partialize: (state) => ({
        state: state.state,
        quota: state.quota,
        quotaExpiresAt: state.quotaExpiresAt,
        messages: state.messages,
        negativeExpiresAt: state.negativeExpiresAt,
      }),
    }
  )
);
