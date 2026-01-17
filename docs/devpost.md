# IDE Premium Plus Pro Max

# Elevator Pitch
Don't you think IDEs nowadays are too preoccupied with developer productivity that they are neglecting the most important people? That's right, the shareholders! Wait no more because **IDE Premium Plus Pro Max** is here, and we deliver the most shareholder optimized IDE experience: meant to extract the most value out of the devs, for you, the shareholders!

# About the project

## Inspiration
We were inspired by the modern landscape of "developer tools" that have increasingly adopted predatory monetization strategies. From SaaS products with absurd subscription tiers (Basic, Pro, Premium, Enterprise, Ultimate) to mobile games with gacha mechanics and lootboxes, we noticed a troubling trend: **profit over people**.

So we asked ourselves: what if we took this to its logical extreme? What if an IDE—the most essential tool for developers—adopted every terrible monetization practice we've seen? The result is **IDE Premium Plus Pro Max**: a fully functional code editor where basic features like syntax highlighting, autocomplete, LSP support, and even Git integration are locked behind randomized lootboxes.

## What it does
**IDE Premium Plus Pro Max** is a complete IDE built on Electron with Monaco Editor (VSCode's editor component), but with a satirical twist: every useful feature is monetized through a gacha/lootbox system.

### Core Features (when unlocked):
- **Monaco code editor** with syntax highlighting
- **Language Server Protocol (LSP)** support for TypeScript/JavaScript and Python
- **Autocomplete** and code intelligence
- **Integrated terminal** with xterm.js
- **Git integration** (status, staging, commits, branches)
- **AI Agent panel** for code assistance
- **File tree explorer** and multi-tab editing
- **Theme customization** (light/dark mode)

### The Gacha System:
Players purchase lootboxes with real money (simulated):
- **Basic Lootbox** ($5) - 1 pull
- **Premium Lootbox** ($15) - 3 pulls with better rates
- **Legendary Lootbox** ($40) - 10 pulls with insane rates

Each pull has **5 rarity tiers** (Common, Uncommon, Rare, Epic, Legendary) and **3 effect categories**:

1. **Positive Effects** (50% chance): Temporarily unlock IDE features
   - Timer-based (e.g., "30 minutes of LSP support")
   - Quota-based (e.g., "50 autocomplete uses")
   - Special effects (God Mode, Immunity Shield, Infinite Quota)

2. **Neutral Effects** (30% chance): Collectible sponsor badges
   - Real company logos (Citadel, Optiver, QRT, Virtu Financial, Marshall Wace, Ahrefs, SquarePoint Capital)
   - Pokemon-card style collection mechanic
   - No functional benefit—pure vanity

3. **Negative Effects** (20% chance): Curses that harm your IDE
   - **Ad Panel**: AI Agent replaced with flashing ads and fake "FLASH SALE" offers
   - **Invisible Code**: Text becomes transparent
   - **Aspect Ratio Corruption**: Window stretches grotesquely
   - **Random Deletions**: Characters randomly disappear as you type
   - **Tiny Text**: Font size shrinks to unreadable levels
   - **Meta Curses**: Increased lootbox prices, reduced drop rates, quota drains

### The 3D Lootbox Experience:
Opening lootboxes features a **fully animated 3D chest** built with Three.js and React Three Fiber, complete with:
- Particle effects on opening
- Rarity-colored lighting
- Smooth camera animations
- Satisfying visual feedback (just like real gacha games!)

## How we built it

### Tech Stack:
- **Electron** - Desktop application framework
- **React + TypeScript** - UI and type safety
- **Monaco Editor** - VSCode's powerful code editor component
- **Three.js + React Three Fiber** - 3D lootbox animations
- **Zustand** - State management for gacha system, editor state, and agent state
- **xterm.js + node-pty** - Integrated terminal
- **simple-git** - Git operations
- **VSCode Language Server Protocol** - LSP client/server communication
- **Framer Motion** - UI animations
- **Vite** - Fast build tool

### Architecture:
The app uses Electron's main/renderer process architecture:
- **Main process** handles file I/O, LSP servers, terminal PTY, Git operations, and file watching
- **Renderer process** manages the React UI, Monaco editor integration, and 3D animations
- **IPC bridge** connects the two processes securely

### Gacha System Implementation:
We built a comprehensive gacha engine (`src/shared/gachaTypes.ts`, `src/shared/gachaConfig.ts`, `src/renderer/store/gachaStore.ts`) that:
- Implements weighted random selection for rarities and effects
- Tracks active timers and quotas
- Applies/removes effects dynamically
- Persists state (lootbox inventory, badge collection, active effects)
- Handles complex meta-curses that affect the gacha system itself

### Key Features:
- **Real-time feature toggling**: LSP, autocomplete, and other features enable/disable based on active effects
- **Timer management**: Background intervals check expiration and auto-disable features
- **Curse effects**: Dynamically inject CSS, modify editor behavior, swap UI panels
- **Badge collection**: Pokemon-style UI with locked/unlocked states and company logos

## Challenges we ran into

1. **Balancing Satire with Functionality**: We wanted the satire to be obvious and biting, but the IDE needed to actually *work* when features were unlocked. Building a real LSP client, terminal, and Git integration while also making them arbitrarily lockable was tricky.

2. **Complex State Management**: Managing timers, quotas, active effects, curses, meta-curses, and their interactions required careful state design. We had to ensure effects could stack, expire gracefully, and not conflict.

3. **3D Performance**: Rendering a 3D lootbox scene inside an Electron app while maintaining 60fps required optimization—especially when particle effects fired during opening animations.

4. **Monaco + LSP Integration**: Getting Monaco Editor to work with external LSP servers over JSON-RPC, then dynamically enabling/disabling those servers based on gacha pulls, was a significant technical challenge.

5. **Curse Implementation**: Each curse needed custom logic—some modified CSS, others intercepted editor events, and some replaced entire UI panels. Making these reversible and non-destructive was complex.

6. **IPC Communication**: Coordinating between Electron's main and renderer processes for file operations, terminal commands, and LSP communication required careful IPC design.

## What we learned

1. **Game Monetization Psychology**: Implementing a gacha system gave us insight into how manipulative these mechanics are—the dopamine hits from rarities, the "just one more pull" mentality, the FOMO from limited-time offers. It's genuinely dystopian.

2. **Electron Architecture**: Deep understanding of main/renderer process separation, IPC security, native module compilation (node-pty), and building cross-platform desktop apps.

3. **Language Server Protocol**: Learned how modern IDEs implement intelligent code features through LSP, JSON-RPC communication, and the complexity of multi-language support.

4. **3D Web Graphics**: React Three Fiber provided a declarative way to build 3D scenes, but we learned about performance optimization, lighting, camera controls, and particle systems.

5. **State Management at Scale**: Zustand proved excellent for complex state with multiple stores (editor, git, gacha, agents) that needed to interact without prop-drilling hell.

6. **The Absurdity of Modern Monetization**: Building this parody made us acutely aware of how normalized terrible UX patterns have become in software. The line between our satire and real products is uncomfortably thin.

# Built with

- **Electron** - Desktop application framework
- **React** - UI framework
- **TypeScript** - Type safety and developer experience
- **Monaco Editor** - VSCode's code editor component
- **Three.js** - 3D graphics library
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber
- **Zustand** - Lightweight state management
- **xterm.js** - Terminal emulator
- **node-pty** - Pseudoterminal for integrated terminal
- **simple-git** - Git operations in Node.js
- **VSCode Language Server Protocol** - LSP client implementation
- **TypeScript Language Server** - LSP for TypeScript/JavaScript
- **Python LSP Server** (pylsp) - LSP for Python
- **Framer Motion** - Animation library
- **Vite** - Build tool and dev server
- **electron-builder** - Build and package Electron apps
