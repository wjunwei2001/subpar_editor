import * as monaco from 'monaco-editor';

// Text color classes
const TEXT_COLORS = [
  'random-text-red',
  'random-text-green',
  'random-text-blue',
  'random-text-yellow',
  'random-text-purple',
  'random-text-cyan',
  'random-text-orange',
  'random-text-pink',
];

// Background highlight classes
const HIGHLIGHT_COLORS = [
  'random-highlight-1',
  'random-highlight-2',
  'random-highlight-3',
];

// Squiggle classes
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
    // Always create at least 60% of max decorations
    const minDecorations = Math.floor(this.options.maxDecorations * 0.6);
    const numDecorations = Math.min(
      this.options.maxDecorations,
      minDecorations + Math.floor(Math.random() * (this.options.maxDecorations - minDecorations))
    );

    // Try harder to create decorations - retry on failure
    let attempts = 0;
    while (decorations.length < numDecorations && attempts < numDecorations * 3) {
      const decoration = this.createRandomDecoration(model, lineCount);
      if (decoration) {
        decorations.push(decoration);
      }
      attempts++;
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

    // Choose decoration type: 30% whole line, 70% word-based
    const isWholeLine = Math.random() < 0.3;

    if (isWholeLine) {
      // Whole line decoration
      const rand = Math.random();
      if (rand < 0.5) {
        // Line background highlight
        const highlightClass = HIGHLIGHT_COLORS[Math.floor(Math.random() * HIGHLIGHT_COLORS.length)];
        return {
          range: new monaco.Range(lineNumber, 1, lineNumber, lineContent.length + 1),
          options: {
            isWholeLine: true,
            className: highlightClass,
          },
        };
      } else {
        // Whole line text color
        const colorClass = TEXT_COLORS[Math.floor(Math.random() * TEXT_COLORS.length)];
        return {
          range: new monaco.Range(lineNumber, 1, lineNumber, lineContent.length + 1),
          options: {
            inlineClassName: colorClass,
          },
        };
      }
    }

    // Word-based decoration
    const words = lineContent.match(/\b\w+\b/g);
    if (!words || words.length === 0) return null;

    const randomWord = words[Math.floor(Math.random() * words.length)];
    const startCol = lineContent.indexOf(randomWord) + 1;
    const endCol = startCol + randomWord.length;

    // Choose decoration type: 35% text color, 35% squiggle, 30% highlight
    const rand = Math.random();

    if (rand < 0.35) {
      // Text color change
      const colorClass = TEXT_COLORS[Math.floor(Math.random() * TEXT_COLORS.length)];
      return {
        range: new monaco.Range(lineNumber, startCol, lineNumber, endCol),
        options: {
          inlineClassName: colorClass,
        },
      };
    } else if (rand < 0.7) {
      // Squiggle
      const squiggleClass = SQUIGGLE_CLASSES[Math.floor(Math.random() * SQUIGGLE_CLASSES.length)];
      return {
        range: new monaco.Range(lineNumber, startCol, lineNumber, endCol),
        options: {
          inlineClassName: squiggleClass,
          hoverMessage: { value: this.getRandomMessage() },
        },
      };
    } else {
      // Background highlight
      const highlightClass = HIGHLIGHT_COLORS[Math.floor(Math.random() * HIGHLIGHT_COLORS.length)];
      return {
        range: new monaco.Range(lineNumber, startCol, lineNumber, endCol),
        options: {
          inlineClassName: highlightClass,
        },
      };
    }
  }

  private getRandomMessage(): string {
    const messages = [
      '[Random] Have you tried turning it off and on again?',
      '[Hmm] This looks suspicious... or does it?',
      '[Warning] Code may or may not work',
      '[Tip] Add more semicolons',
      '[Bug?] Potential bug detected (just kidding)',
      '[Nice] This code sparks joy',
      '[Hint] Consider refactoring... or not',
      '[Style] Beautiful variable name!',
      '[Hot] Hot code path detected',
      '[Magic] Magic number spotted (not really)',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}
