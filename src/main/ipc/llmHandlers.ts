import { ipcMain } from 'electron';

const END_TOKEN = '<|endoftext|>';

// Lorem ipsum words for dummy responses
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
  'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor',
  'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua',
];

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
 * DUMMY LLM FUNCTION - Replace this with your actual LLM API call
 *
 * Example for OpenAI:
 * ```typescript
 * async function callLLM(request: LLMCompletionRequest, signal: AbortSignal): Promise<LLMCompletionResponse> {
 *   const response = await fetch('https://api.openai.com/v1/completions', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
 *     },
 *     body: JSON.stringify({
 *       model: 'gpt-3.5-turbo-instruct',
 *       prompt: request.prefix,
 *       suffix: request.suffix,
 *       max_tokens: 150,
 *       stop: ['\n\n', END_TOKEN],
 *     }),
 *     signal,
 *   });
 *   const data = await response.json();
 *   return {
 *     text: data.choices[0].text + END_TOKEN,
 *     finishReason: 'stop',
 *   };
 * }
 * ```
 *
 * Example for Anthropic Claude:
 * ```typescript
 * async function callLLM(request: LLMCompletionRequest, signal: AbortSignal): Promise<LLMCompletionResponse> {
 *   const response = await fetch('https://api.anthropic.com/v1/messages', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'x-api-key': process.env.ANTHROPIC_API_KEY,
 *       'anthropic-version': '2023-06-01',
 *     },
 *     body: JSON.stringify({
 *       model: 'claude-3-haiku-20240307',
 *       max_tokens: 150,
 *       messages: [{
 *         role: 'user',
 *         content: `Complete this code:\n\n${request.prefix}[CURSOR]${request.suffix}\n\nProvide only the completion text, nothing else.`
 *       }],
 *     }),
 *     signal,
 *   });
 *   const data = await response.json();
 *   return {
 *     text: data.content[0].text + END_TOKEN,
 *     finishReason: 'stop',
 *   };
 * }
 * ```
 */
async function callLLM(
  request: LLMCompletionRequest,
  signal: AbortSignal
): Promise<LLMCompletionResponse> {
  // Simulate API latency (200-500ms for realistic LLM timing)
  const delay = Math.floor(Math.random() * 300) + 200;

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(resolve, delay);
    signal.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new Error('Aborted'));
    });
  });

  // Check if aborted
  if (signal.aborted) {
    return { text: '', finishReason: 'cancelled' };
  }

  // Generate dummy lorem ipsum completion (3-8 words)
  const wordCount = Math.floor(Math.random() * 6) + 3;
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
  }

  const completionText = words.join(' ') + END_TOKEN;

  return {
    text: completionText,
    finishReason: 'stop',
  };
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
        console.error('LLM completion error:', error);
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
