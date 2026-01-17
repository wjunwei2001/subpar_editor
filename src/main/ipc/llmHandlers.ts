import { ipcMain } from 'electron';

const END_TOKEN = '<|endoftext|>';

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Fast models: 'llama-3.1-8b-instant' (fastest), 'llama-3.3-70b-versatile' (better quality)
const GROQ_MODEL = 'llama-3.1-8b-instant';

// Track pending requests for cancellation
const pendingRequests = new Map<string, AbortController>();

interface LLMCompletionRequest {
  requestId: string;
  prefix: string;
  suffix: string;
  language: string;
}

interface LLMCompletionResponse {
  text: string;
  finishReason: 'stop' | 'length' | 'cancelled';
}

/**
 * Get the Groq API key from environment variables
 */
function getApiKey(): string | null {
  return process.env.GROQ_API_KEY || null;
}

/**
 * Build a prompt for code completion
 */
function buildPrompt(request: LLMCompletionRequest): string {
  const { prefix, suffix, language } = request;

  // Get the last few lines of prefix for context (more focused)
  const prefixLines = prefix.split('\n');
  const contextLines = prefixLines.slice(-30).join('\n'); // Last 30 lines

  // Get first few lines of suffix
  const suffixLines = suffix.split('\n');
  const suffixContext = suffixLines.slice(0, 10).join('\n'); // First 10 lines

  return `You are a code completion assistant. Complete the code at the cursor position marked with <CURSOR>.

Language: ${language}

Code before cursor:
\`\`\`${language}
${contextLines}<CURSOR>
\`\`\`

Code after cursor:
\`\`\`${language}
${suffixContext}
\`\`\`

Instructions:
- Output ONLY the code that should be inserted at the cursor position
- Do not repeat any code that already exists
- Do not include explanations, markdown, or code fences
- Keep the completion concise (1-3 lines typically)
- Match the existing code style and indentation
- End your response with ${END_TOKEN}

Completion:`;
}

/**
 * Call Groq API for code completion
 */
async function callLLM(
  request: LLMCompletionRequest,
  signal: AbortSignal
): Promise<LLMCompletionResponse> {
  const apiKey = getApiKey();

  // Fallback to dummy response if no API key
  if (!apiKey) {
    console.warn('[LLM] No GROQ_API_KEY found. Set it in your environment variables.');
    console.warn('[LLM] Example: export GROQ_API_KEY=your_api_key_here');

    // Return a placeholder response
    return {
      text: '// Set GROQ_API_KEY environment variable for AI completions' + END_TOKEN,
      finishReason: 'stop',
    };
  }

  const prompt = buildPrompt(request);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.2, // Low temperature for more deterministic completions
        stop: [END_TOKEN, '\n\n\n', '```'], // Stop sequences
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[LLM] Groq API error:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      console.error('[LLM] No choices in response:', data);
      return { text: '', finishReason: 'stop' };
    }

    let completionText = data.choices[0].message?.content || '';

    // Clean up the response
    // Remove any markdown code fences if the model included them
    completionText = completionText.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '');

    // Ensure it ends with the end token
    if (!completionText.includes(END_TOKEN)) {
      completionText = completionText.trimEnd() + END_TOKEN;
    }

    const finishReason = data.choices[0].finish_reason === 'length' ? 'length' : 'stop';

    return {
      text: completionText,
      finishReason,
    };
  } catch (error) {
    if (signal.aborted) {
      return { text: '', finishReason: 'cancelled' };
    }
    throw error;
  }
}

export function registerLLMHandlers() {
  // Handle completion requests
  ipcMain.handle(
    'llm:complete',
    async (_event, request: LLMCompletionRequest): Promise<LLMCompletionResponse | null> => {
      const { requestId } = request;

      // Create abort controller for this request
      const abortController = new AbortController();
      pendingRequests.set(requestId, abortController);

      try {
        const response = await callLLM(request, abortController.signal);
        return response;
      } catch (error) {
        if ((error as Error).message === 'Aborted') {
          return { text: '', finishReason: 'cancelled' };
        }
        console.error('[LLM] Completion error:', error);
        return null;
      } finally {
        pendingRequests.delete(requestId);
      }
    }
  );

  // Handle cancellation requests
  ipcMain.handle('llm:cancel', async (_event, requestId: string) => {
    const controller = pendingRequests.get(requestId);
    if (controller) {
      controller.abort();
      pendingRequests.delete(requestId);
      return true;
    }
    return false;
  });

  // Cancel all pending requests (useful for cleanup)
  ipcMain.handle('llm:cancelAll', async () => {
    for (const controller of pendingRequests.values()) {
      controller.abort();
    }
    pendingRequests.clear();
    return true;
  });
}
