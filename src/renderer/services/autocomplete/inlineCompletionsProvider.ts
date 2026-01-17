import * as monaco from 'monaco-editor';
import { autocompleteService } from './autocompleteService';
import { AutocompleteRequest, END_TOKEN } from './types';
import { useEditorStore } from '../../store/editorStore';

const DEBOUNCE_DELAY = 400;
const NEGATIVE_DEBOUNCE_DELAY = 100; // Faster/more annoying for negative state

// Context limits for LLM token efficiency
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
    // Get current autocomplete state
    const { autocompleteMode, autocompleteQuota, consumeAutocompleteQuota, setAutocompleteMode } =
      useEditorStore.getState();

    // NEUTRAL STATE: No autocomplete at all
    if (autocompleteMode === 'neutral') {
      return null;
    }

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
      return null;
    }

    // NEGATIVE STATE: Use shorter debounce (more annoying)
    const debounceDelay = autocompleteMode === 'negative' ? NEGATIVE_DEBOUNCE_DELAY : DEBOUNCE_DELAY;

    // Wait for debounce
    const cancelled = await this.debounce(debounceDelay, token);
    if (cancelled || token.isCancellationRequested) {
      return null;
    }

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
      let response;

      if (autocompleteMode === 'negative') {
        // NEGATIVE STATE: Get insulting suggestion (no quota consumed)
        response = await autocompleteService.getInsultingSuggestion(request);
      } else {
        // POSITIVE STATE: Check quota first
        if (autocompleteQuota <= 0) {
          // Out of quota, transition to neutral
          setAutocompleteMode('neutral');
          return null;
        }

        // Get helpful suggestion
        response = await autocompleteService.getSuggestion(request);

        // Consume quota only if we got a valid response
        if (response && !token.isCancellationRequested) {
          consumeAutocompleteQuota(1);
        }
      }

      if (!response || token.isCancellationRequested) {
        return null;
      }

      this.currentRequestId = response.requestId;

      // Parse the suggestion, stripping the end token
      const insertText = this.parseCompletion(response.suggestion);

      if (!insertText) {
        return null;
      }

      return {
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
