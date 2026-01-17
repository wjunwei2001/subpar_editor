import * as monaco from 'monaco-editor';
import { autocompleteService } from './autocompleteService';
import { AutocompleteRequest, END_TOKEN } from './types';

const DEBOUNCE_DELAY = 400;

// Context limits for LLM token efficiency
// ~4 chars per token, so 4000 chars ≈ 1000 tokens for prefix
// Suffix is less important, so we keep it smaller
const MAX_PREFIX_CHARS = 4000;
const MAX_SUFFIX_CHARS = 1000;

export class LoremInlineCompletionsProvider implements monaco.languages.InlineCompletionsProvider {
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private currentRequestId: string | null = null;

  async provideInlineCompletions(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    _context: monaco.languages.InlineCompletionContext,
    token: monaco.CancellationToken
  ): Promise<monaco.languages.InlineCompletions | null> {
    console.log('[Autocomplete] provideInlineCompletions called at', position.lineNumber, position.column);

    // Cancel any pending debounced request
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Cancel previous API request
    if (this.currentRequestId) {
      autocompleteService.cancel(this.currentRequestId);
      this.currentRequestId = null;
    }

    // Don't provide completions if cancelled immediately
    if (token.isCancellationRequested) {
      console.log('[Autocomplete] Cancelled immediately');
      return null;
    }

    // Wait for debounce
    const cancelled = await this.debounce(DEBOUNCE_DELAY, token);
    if (cancelled || token.isCancellationRequested) {
      console.log('[Autocomplete] Cancelled during debounce');
      return null;
    }

    console.log('[Autocomplete] Debounce passed, fetching suggestion...');

    // Get text before and after cursor
    const textBeforeCursor = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    const textAfterCursor = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: model.getLineCount(),
      endColumn: model.getLineMaxColumn(model.getLineCount()),
    });

    // Truncate context to avoid exceeding LLM token limits
    // Keep the most recent prefix (closest to cursor) and nearest suffix
    const truncatedPrefix = textBeforeCursor.length > MAX_PREFIX_CHARS
      ? textBeforeCursor.slice(-MAX_PREFIX_CHARS)
      : textBeforeCursor;

    const truncatedSuffix = textAfterCursor.length > MAX_SUFFIX_CHARS
      ? textAfterCursor.slice(0, MAX_SUFFIX_CHARS)
      : textAfterCursor;

    const request: AutocompleteRequest = {
      prefix: truncatedPrefix,
      suffix: truncatedSuffix,
      language: model.getLanguageId(),
      cursorPosition: {
        lineNumber: position.lineNumber,
        column: position.column,
      },
    };

    try {
      const response = await autocompleteService.getSuggestion(request);
      console.log('[Autocomplete] Got response:', response);

      if (!response || token.isCancellationRequested) {
        console.log('[Autocomplete] No response or cancelled');
        return null;
      }

      this.currentRequestId = response.requestId;

      // Parse the suggestion, stripping the end token
      const insertText = this.parseCompletion(response.suggestion);
      console.log('[Autocomplete] Parsed insertText:', insertText);

      if (!insertText) {
        console.log('[Autocomplete] Empty insertText');
        return null;
      }

      const result = {
        items: [
          {
            insertText: insertText,
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
          },
        ],
      };
      console.log('[Autocomplete] Returning result:', result);
      return result;
    } catch (error) {
      console.error('[Autocomplete] Error:', error);
      return null;
    }
  }

  freeInlineCompletions(_completions: monaco.languages.InlineCompletions): void {
    // Cleanup if needed
  }

  private parseCompletion(suggestion: string): string {
    // Strip the end token
    const endIndex = suggestion.indexOf(END_TOKEN);
    if (endIndex !== -1) {
      return suggestion.substring(0, endIndex);
    }
    return suggestion;
  }

  private debounce(ms: number, token: monaco.CancellationToken): Promise<boolean> {
    return new Promise((resolve) => {
      this.debounceTimer = setTimeout(() => {
        this.debounceTimer = null;
        resolve(false); // Not cancelled
      }, ms);

      // Handle cancellation
      token.onCancellationRequested(() => {
        if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = null;
        }
        resolve(true); // Cancelled
      });
    });
  }
}

export const loremInlineCompletionsProvider = new LoremInlineCompletionsProvider();
