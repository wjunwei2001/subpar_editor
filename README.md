# Subpar Editor

A lightweight IDE built with Electron, React, TypeScript, and Monaco Editor.

## Features

- File tree explorer
- Monaco code editor with syntax highlighting
- Integrated terminal
- Code execution (Python, JavaScript, TypeScript)
- Git integration (status, stage, commit, branches)
- LSP support (TypeScript/JavaScript, Python)
- Multiple file tabs

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Python 3** (optional, for Python LSP support)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including the TypeScript language server.

### 2. Setup LSP (Optional)

**TypeScript/JavaScript LSP** is included automatically via npm.

**Python LSP** requires a separate install:

```bash
# Option A: Use the setup script
npm run setup:lsp

# Option B: Install manually
pip install python-lsp-server
```

### 3. Run Development Server

```bash
npm run dev
```

This will:
1. Build the main process
2. Start the Vite dev server
3. Launch Electron

### 4. Build for Production

```bash
npm run build
```

Output will be in the `release/` directory.

## Project Structure

```
subpar_editor/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts           # Entry point
│   │   ├── preload.ts        # IPC bridge
│   │   ├── ipc/              # IPC handlers
│   │   ├── git/              # Git service
│   │   └── lsp/              # LSP server management
│   │
│   ├── renderer/             # React app (renderer process)
│   │   ├── App.tsx           # Main layout
│   │   ├── components/       # React components
│   │   ├── store/            # Zustand state management
│   │   ├── lsp/              # LSP client
│   │   └── styles/           # CSS styles
│   │
│   └── shared/               # Shared types
│       └── types.ts
│
├── scripts/
│   └── setup-lsp.js          # LSP setup helper
│
└── package.json
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:main` | Build main process only |
| `npm run setup:lsp` | Install Python LSP |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` / `Cmd+S` | Save file |
| `Ctrl+Space` | Trigger autocomplete |
| `Ctrl+Shift+Space` / `Cmd+Shift+Space` | Trigger inline suggestions |
| `F12` | Go to definition |

## Troubleshooting

### LSP not working

**TypeScript LSP:**
```bash
# Verify it's installed
npx typescript-language-server --version
```

**Python LSP:**
```bash
# Verify it's installed
pylsp --version

# If not found, install it
pip install python-lsp-server
```

### node-pty build errors

node-pty requires native compilation. Ensure you have build tools:

**Windows:**
```bash
npm install --global windows-build-tools
```

**macOS:**
```bash
xcode-select --install
```

**Linux:**
```bash
sudo apt-get install build-essential
```

## Tech Stack

- **Electron** - Desktop application framework
- **React** - UI framework
- **TypeScript** - Type safety
- **Monaco Editor** - Code editor (VS Code's editor)
- **xterm.js** - Terminal emulator
- **node-pty** - PTY for terminal
- **Zustand** - State management
- **simple-git** - Git operations
- **vscode-jsonrpc** - LSP communication
- **Vite** - Build tool
