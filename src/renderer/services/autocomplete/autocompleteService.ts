import { END_TOKEN, AutocompleteRequest, AutocompleteResponse } from './types';

class AutocompleteService {
  private currentRequestId: string | null = null;

  async getSuggestion(request: AutocompleteRequest): Promise<AutocompleteResponse | null> {
    const requestId = this.generateRequestId();
    this.currentRequestId = requestId;

    console.log('[AutocompleteService] Calling LLM with requestId:', requestId);

    try {
      const response = await window.electronAPI.llm.complete({
        requestId,
        prefix: request.prefix,
        suffix: request.suffix,
        language: request.language,
      });
      console.log('[AutocompleteService] LLM response:', response);

      // Check if this request was cancelled
      if (this.currentRequestId !== requestId) {
        return null;
      }

      if (!response || response.finishReason === 'cancelled') {
        return null;
      }

      // Parse end token from response
      const text = response.text;
      const endIndex = text.indexOf(END_TOKEN);
      const insertText = endIndex !== -1 ? text.substring(0, endIndex) : text;

      return {
        suggestion: text,
        insertText,
        requestId,
      };
    } catch (error) {
      console.error('Autocomplete error:', error);
      return null;
    }
  }

  cancel(requestId: string): void {
    if (this.currentRequestId === requestId) {
      this.currentRequestId = null;
    }
    window.electronAPI.llm.cancel(requestId);
  }

  cancelAll(): void {
    this.currentRequestId = null;
    window.electronAPI.llm.cancelAll();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

export const autocompleteService = new AutocompleteService();
