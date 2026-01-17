import { ipcMain } from "electron";

// Gemini API configuration
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

// Track pending requests for cancellation
const pendingRequests = new Map<string, AbortController>();

interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

interface AgentChatRequest {
  requestId: string;
  messages: AgentMessage[];
}

interface AgentChatResponse {
  content: string;
  finishReason: "stop" | "length" | "cancelled";
}

/**
 * Get the Gemini API key from environment variables
 */
function getApiKey(): string | null {
  return process.env.GEMINI_API_KEY || null;
}

/**
 * Build the system prompt for the AI assistant
 */
function buildSystemPrompt(): string {
  return `You are a helpful AI coding assistant embedded in an IDE called Subpar Editor.
Your role is to help developers with:
- Explaining code and concepts
- Finding and fixing bugs
- Suggesting refactoring improvements
- Answering programming questions
- Writing code snippets

## File Context
Users may provide file contents using <file path="...">...</file> tags. Use this context to understand their codebase.

## Editing Files
When the user asks you to edit, modify, or fix a file, output the COMPLETE new file content wrapped in a <file_edit> tag:

<file_edit path="/absolute/path/to/file.ts">
// Complete file content goes here
// Include ALL lines, not just the changed parts
</file_edit>

IMPORTANT:
- Always use the ABSOLUTE path from the <file> tag
- Include the ENTIRE file content, not just changes
- You can edit multiple files by using multiple <file_edit> tags
- Only use <file_edit> when the user explicitly asks for changes

Keep your responses concise but helpful. Use code blocks with language identifiers when showing code.
Be friendly but professional.`;
}

/**
 * Call Gemini API for agent chat
 */
// Truncate content to avoid rate limits (roughly 4 chars per token)
const MAX_CONTENT_CHARS = 30000; // ~7500 tokens

function truncateContent(content: string): string {
  if (content.length <= MAX_CONTENT_CHARS) return content;
  return content.slice(0, MAX_CONTENT_CHARS) + '\n\n... [TRUNCATED - file too large]';
}

async function callAgentLLM(
  request: AgentChatRequest,
  signal: AbortSignal,
): Promise<AgentChatResponse> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      content:
        "API key not configured. Please set GEMINI_API_KEY environment variable.",
      finishReason: "stop",
    };
  }

  try {
    // Convert messages to Gemini format, truncating large content
    const contents = request.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: truncateContent(m.content) }],
    }));

    // Log context size for debugging
    const totalChars = contents.reduce((acc, c) => acc + c.parts[0].text.length, 0);
    console.log(`[Agent] Sending ${contents.length} messages, ~${totalChars} chars (~${Math.round(totalChars/4)} tokens)`);

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: buildSystemPrompt() }],
        },
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
        },
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Agent] Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      return { content: "No response from AI.", finishReason: "stop" };
    }

    const candidate = data.candidates[0];
    const text = candidate.content?.parts?.[0]?.text || "";

    return {
      content: text,
      finishReason: candidate.finishReason === "MAX_TOKENS" ? "length" : "stop",
    };
  } catch (error) {
    if (signal.aborted) {
      return { content: "", finishReason: "cancelled" };
    }
    throw error;
  }
}

export function registerAgentHandlers() {
  // Handle chat requests
  ipcMain.handle(
    "agent:chat",
    async (
      _event,
      request: AgentChatRequest,
    ): Promise<AgentChatResponse | null> => {
      const { requestId } = request;

      const abortController = new AbortController();
      pendingRequests.set(requestId, abortController);

      try {
        const response = await callAgentLLM(request, abortController.signal);
        return response;
      } catch (error) {
        console.error("[Agent] Chat error:", error);
        return null;
      } finally {
        pendingRequests.delete(requestId);
      }
    },
  );

  // Handle cancellation requests
  ipcMain.handle("agent:cancel", async (_event, requestId: string) => {
    const controller = pendingRequests.get(requestId);
    if (controller) {
      controller.abort();
      pendingRequests.delete(requestId);
      return true;
    }
    return false;
  });
}
