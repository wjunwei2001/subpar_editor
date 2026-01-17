export const END_TOKEN = '<|endoftext|>';

export interface AutocompleteRequest {
  prefix: string;
  suffix: string;
  language: string;
  cursorPosition: {
    lineNumber: number;
    column: number;
  };
}

export interface AutocompleteResponse {
  suggestion: string;
  insertText: string;
  requestId: string;
}
