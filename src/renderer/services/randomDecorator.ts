import * as monaco from 'monaco-editor';

const DECORATION_COLORS = [
  'random-error',
  'random-warning',
  'random-info',
  'random-highlight-1',
  'random-highlight-2',
  'random-highlight-3',
];

const SQUIGGLE_CLASSES = [
  'random-squiggle-error',
  'random-squiggle-warning',
  'random-squiggle-info',
];

interface RandomDecoratorOptions {
  intervalMs?: number;
  maxDecorations?: number;
}

export class RandomDecorator {
  private editor: monaco.editor.IStandaloneCodeEditor;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private decorationIds: string[] = [];
  private options: Required<RandomDecoratorOptions>;

  constructor(
    editor: monaco.editor.IStandaloneCodeEditor,
    options: RandomDecoratorOptions = {}
  ) {
    this.editor = editor;
    this.options = {
      intervalMs: options.intervalMs ?? 2000,
      maxDecorations: options.maxDecorations ?? 8,
    };
  }

  start(): void {
    if (this.intervalId) return;

    // Apply initial decorations
    this.applyRandomDecorations();

    // Set up interval for timed updates
    this.intervalId = setInterval(() => {
      this.applyRandomDecorations();
    }, this.options.intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.clearDecorations();
  }

  private clearDecorations(): void {
    this.decorationIds = this.editor.deltaDecorations(this.decorationIds, []);
  }

  private applyRandomDecorations(): void {
    const model = this.editor.getModel();
    if (!model) return;

    const lineCount = model.getLineCount();
    if (lineCount === 0) return;

    const decorations: monaco.editor.IModelDeltaDecoration[] = [];
    const numDecorations = Math.min(
      this.options.maxDecorations,
      Math.floor(Math.random() * this.options.maxDecorations) + 1
    );

    for (let i = 0; i < numDecorations; i++) {
      const decoration = this.createRandomDecoration(model, lineCount);
      if (decoration) {
        decorations.push(decoration);
      }
    }

    this.decorationIds = this.editor.deltaDecorations(
      this.decorationIds,
      decorations
    );
  }

  private createRandomDecoration(
    model: monaco.editor.ITextModel,
    lineCount: number
  ): monaco.editor.IModelDeltaDecoration | null {
    const lineNumber = Math.floor(Math.random() * lineCount) + 1;
    const lineContent = model.getLineContent(lineNumber);

    if (lineContent.trim().length === 0) return null;

    // Find a random word or segment in the line
    const words = lineContent.match(/\b\w+\b/g);
    if (!words || words.length === 0) return null;

    const randomWord = words[Math.floor(Math.random() * words.length)];
    const startCol = lineContent.indexOf(randomWord) + 1;
    const endCol = startCol + randomWord.length;

    const isSquiggle = Math.random() > 0.5;

    if (isSquiggle) {
      const squiggleClass = SQUIGGLE_CLASSES[
        Math.floor(Math.random() * SQUIGGLE_CLASSES.length)
      ];
      return {
        range: new monaco.Range(lineNumber, startCol, lineNumber, endCol),
        options: {
          className: squiggleClass,
          hoverMessage: { value: this.getRandomMessage() },
          inlineClassName: squiggleClass,
        },
      };
    } else {
      const colorClass = DECORATION_COLORS[
        Math.floor(Math.random() * DECORATION_COLORS.length)
      ];
      return {
        range: new monaco.Range(lineNumber, startCol, lineNumber, endCol),
        options: {
          inlineClassName: colorClass,
        },
      };
    }
  }

  private getRandomMessage(): string {
    const messages = [
      '🎲 Random suggestion: Have you tried turning it off and on again?',
      '🤔 This looks suspicious... or does it?',
      '⚠️ Warning: Code may or may not work',
      '💡 Tip: Add more semicolons',
      '🐛 Potential bug detected (just kidding)',
      '✨ This code sparks joy',
      '🎯 Consider refactoring... or not',
      '🌈 Beautiful variable name!',
      '🔥 Hot code path detected',
      '🧙 Magic number spotted (not really)',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}
