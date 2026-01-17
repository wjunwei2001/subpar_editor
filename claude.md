# Subpar Editor - Design Specification

> **Note:** For detailed implementation phases, technical considerations, file structure, and testing strategy, see [IMPLEMENTATION.md](./docs/IMPLEMENTATION.md).

## Project Overview

Subpar Editor is a deliberately enshittified IDE that implements a tri-state feature system where every feature can exist in Positive, Neutral, or Negative states. Users must engage with a gacha/lootbox system (powered by Stripe test payments) to obtain temporary positive effects or risk receiving negative curses.

**Core Principle:** All positive states are temporary (timer or quota-based), ensuring constant degradation and forcing continued gacha engagement.

---

## Tri-State Feature System

Each feature has three possible states:

### Feature Matrix

| Feature | Positive (Temporary) | Neutral (Default) | Negative (Curse) |
|---------|---------------------|-------------------|------------------|
| **LSP** | Active per-language (time-limited) | Inactive | Random syntax highlights |
| **Autocomplete** | Token quota available | Inactive | Passive-aggressive suggestions |
| **Agents Panel** | Token quota available | Inactive | Becomes ad space |
| **Code Colour** | High contrast theme | White text on black bg | Invisible text |
| **Dark/Light Mode** | User can select mode | Locked to light mode | "Average mode" (cursed blend) |
| **Code Editing** | Token quota available | Inactive | Random character deletions |
| **Aspect Ratio** | Normal 16:9 | Square viewport | Severely distorted |
| **Git Integration** | Active (time-limited) | Inactive | Random destructive operations |
| **Text Size** | Token quota (user adjustable) | Normal fixed size | Tiny, nearly unreadable |

---

## Feature Specifications

### 1. LSP (Language Server Protocol)

**Positive State - "Active per-language (time-limited)"**
- Duration: x minutes per pull
- Enables full LSP features for ONE language at a time
- Features: autocomplete, go-to-definition, diagnostics, hover info
- Pull grants: "30min Python LSP", "60min TypeScript LSP", etc.
- When timer expires → Neutral state

**Neutral State - "Inactive"**
- No LSP features
- Basic syntax highlighting only (Monaco built-in)
- No diagnostics, no autocomplete from LSP

**Negative State - "Random Highlights"**
- LSP actively provides WRONG information
- Random tokens get random syntax colors
- Keywords highlighted as strings, strings as comments, etc.
- False error squiggles on correct code
- No real diagnostics

---

### 2. Autocomplete

**Positive State - "Token Quota"**
- User has X autocomplete tokens
- Each autocomplete trigger consumes 1 token
- Provides helpful, accurate suggestions
- Shows remaining tokens in UI
- When quota = 0 → Neutral state

**Neutral State - "Inactive"**
- No autocomplete at all
- User must type everything manually

**Negative State - "Passive Aggressive"**
- Autocomplete ALWAYS triggers
- Suggestions are insulting and useless:
  - `console.log` → "console.log('you call yourself a developer?')"
  - `function` → "// TODO: learn to code first"
  - `const` → "const skill = 0; // that's you"
- Occasionally suggests code that would break things
- Cannot be dismissed easily (delay or requires multiple ESC presses)

**Implementation:**
```typescript
// src/renderer/components/Editor/AutocompleteProvider.ts
class AutocompleteProvider {
  state: 'positive' | 'neutral' | 'negative'
  quota: number

  provideCompletionItems(model, position) {
    if (this.state === 'neutral') return null

    if (this.state === 'positive') {
      if (this.quota <= 0) {
        this.state = 'neutral'
        return null
      }
      this.quota--
      return this.getHelpfulSuggestions(model, position)
    }

    if (this.state === 'negative') {
      return this.getInsultingSuggestions(model, position)
    }
  }

  getInsultingSuggestions(model, position) {
    const insults = [
      "Did you really need autocomplete for this?",
      "Maybe try Stack Overflow instead",
      "This is embarrassing to watch",
      // ... more
    ]
    return insults.map(text => ({ label: text, kind: 'text' }))
  }
}
```

---

### 3. Agents Panel

**Positive State - "Token Quota"**
- Panel available with AI assistant features
- Token quota for agent interactions
- Can ask coding questions, get refactoring suggestions
- Quota depletes per message/interaction

**Neutral State - "Inactive"**
- Panel is grayed out or hidden
- No agent features available

**Negative State - "Becomes Ad Space"**
- Panel displays ads for lootboxes
- Fake "limited time offers"
- Countdown timers for "deals"
- Animated banners, flashy graphics
- "Your code could be better with PREMIUM features! Buy now!"
- Takes up screen real estate

**Implementation:**
```typescript
// src/renderer/components/AgentsPanel/AgentsPanel.tsx
export const AgentsPanel = () => {
  const { agentState, agentQuota } = useEditorStore()

  if (agentState === 'positive') {
    return <AIAssistant quota={agentQuota} />
  }

  if (agentState === 'neutral') {
    return <div className="disabled-panel">Agent features disabled</div>
  }

  if (agentState === 'negative') {
    return (
      <div className="ad-panel">
        <h2>🎰 SPECIAL OFFER! 🎰</h2>
        <div className="countdown">Expires in: 05:32</div>
        <img src="/lootbox-ad.gif" />
        <button>BUY NOW - Only $4.99!</button>
      </div>
    )
  }
}
```

---

### 4. Code Colour

**Positive State - "Contrast"**
- High contrast color scheme
- Excellent readability
- Proper syntax highlighting
- Duration: 15-30 minutes

**Neutral State - "White on Black"**
- Basic white text on black background
- Minimal syntax colors
- Adequate but bland

**Negative State - "Invisible"**
- Text color same as background (or 1-2% difference)
- Code is nearly impossible to see
- Only visible when selected
- Syntax highlighting uses similar invisible shades

**Implementation:**
```typescript
// src/renderer/styles/themes.ts
const themes = {
  positive: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    keyword: '#569cd6',
    string: '#ce9178',
    // ... high contrast colors
  },
  neutral: {
    background: '#000000',
    foreground: '#ffffff',
    // minimal highlighting
  },
  negative: {
    background: '#1a1a1a',
    foreground: '#1b1b1b', // almost same as background
    keyword: '#1c1c1c',
    string: '#1d1d1d',
    // all colors barely distinguishable
  }
}
```

---

### 5. Dark/Light Mode

**Positive State - "Ability to Select Mode"**
- User can toggle between dark and light
- Duration: 20-40 minutes
- Normal theme switching

**Neutral State - "Light Mode"**
- Locked to light mode
- No option to switch
- Bright white background

**Negative State - "Flashbang Mode"**
- Pure saturated red on blue everywhere
- Everything is muddy and hard to read
- Syntax highlighting all in gray tones
- Headache-inducing

**Implementation:**
```typescript
// src/renderer/components/ThemeManager.ts
class ThemeManager {
  state: 'positive' | 'neutral' | 'negative'

  applyTheme() {
    if (this.state === 'positive') {
      return this.userSelectedTheme // dark or light
    }

    if (this.state === 'neutral') {
      return 'light' // forced light mode
    }

    if (this.state === 'negative') {
      // Average all colors between dark and light themes
      // Fill in with real hex values
      return {
        background: this.averageColor('#1e1e1e', '#ffffff'), // → #8f8f8f
        foreground: this.averageColor('#d4d4d4', '#000000'), // → #6a6a6a
      }
    }
  }
}
```

---

### 6. Code Editing

**Positive State - "Token Quota"**
- User has X edit tokens
- Each character typed/deleted consumes tokens
- When quota > 0, editing works normally
- Shows remaining tokens

**Neutral State - "Inactive"**
- Read-only mode
- Cannot type or delete anything
- Can only view code

**Negative State - "Random Deletes"**
- Every character typed has a chance to:
  - Delete a random character elsewhere in the file
  - Delete the character you just typed
  - Delete an entire random line
- Random characters disappear while typing
- Saves are also corrupted (random deletions persist)

**Implementation:**
```typescript
// src/renderer/components/Editor/MonacoEditor.tsx
const handleContentChange = (content: string) => {
  const editState = editorStore.codeEditingState

  if (editState === 'neutral') {
    // Reject change, keep old content
    editor.setValue(previousContent)
    showToast('Code editing disabled. Buy lootbox!')
    return
  }

  if (editState === 'positive') {
    if (editorStore.editQuota <= 0) {
      editor.setValue(previousContent)
      showToast('Out of edit tokens!')
      editorStore.setCodeEditingState('neutral')
      return
    }
    editorStore.consumeEditQuota(1)
    // Allow edit
  }

  if (editState === 'negative') {
    // Apply random deletion
    if (Math.random() < 0.15) { // 15% chance per edit
      const lines = content.split('\n')
      const randomLineIndex = Math.floor(Math.random() * lines.length)
      lines.splice(randomLineIndex, 1)
      content = lines.join('\n')
      showToast('Oops! A line got deleted 🎰')
    }
  }

  setPreviousContent(content)
}
```

---

### 7. Aspect Ratio

**Positive State - "Normal 16:9"**
- Editor viewport is normal widescreen ratio
- Duration: 10-20 minutes
- Comfortable coding layout

**Neutral State - "Square"**
- Editor viewport forced to square (1:1)
- Wastes horizontal space
- Annoying but usable

**Negative State - "Fucked"**
- Aspect ratio constantly changing
- Stretches and squashes randomly
- Ultra-wide (32:9) or ultra-tall (9:32)
- Disorienting and nauseating

**Implementation:**
```typescript
// src/renderer/components/Editor/AspectRatioController.ts
class AspectRatioController {
  state: 'positive' | 'neutral' | 'negative'

  applyAspectRatio() {
    const editorContainer = document.querySelector('.editor-container')

    if (this.state === 'positive') {
      editorContainer.style.aspectRatio = '16 / 9'
    }

    if (this.state === 'neutral') {
      editorContainer.style.aspectRatio = '1 / 1'
    }

    if (this.state === 'negative') {
      // Random aspect ratio every 5 seconds
      setInterval(() => {
        const ratios = ['32/9', '9/32', '21/9', '4/3', '3/4', '5/1', '1/5']
        const random = ratios[Math.floor(Math.random() * ratios.length)]
        editorContainer.style.aspectRatio = random
      }, 5000)
    }
  }
}
```

---

### 8. Git Integration

**Positive State - "Active (timer)"**
- Full git functionality enabled
- Can commit, push, pull, branch, merge, etc.
- Duration: 45-90 minutes
- Git panel shows status, diffs, history

**Neutral State - "Inactive"**
- Git features disabled
- No git panel
- Must use external terminal/tools

**Negative State - "Random Destructive Operations"**
- Git panel ACTIVE but dangerous
- Random chance on any git operation to:
  - Merge wrong branches
  - Random rebase onto unrelated branch
  - Delete branches (including current)
  - Force push to main
  - Random checkout to detached HEAD
  - Create nonsensical commits
- Shows success messages but does destructive things
- "Committed successfully!" → actually ran `git reset --hard HEAD~10`

**Implementation:**
```typescript
// src/main/ipc/gitHandlers.ts
ipcMain.handle('git:commit', async (event, message) => {
  const gitState = getGitState()

  if (gitState === 'neutral') {
    throw new Error('Git features disabled')
  }

  if (gitState === 'positive') {
    // Normal commit
    return execSync(`git commit -m "${message}"`)
  }

  if (gitState === 'negative') {
    const chaos = Math.random()

    if (chaos < 0.2) {
      // Delete a random branch
      const branches = execSync('git branch').toString().split('\n')
      const randomBranch = branches[Math.floor(Math.random() * branches.length)]
      execSync(`git branch -D ${randomBranch}`)
      return { success: true, message: 'Committed successfully!' } // lie
    } else if (chaos < 0.4) {
      // Random rebase
      execSync('git rebase --onto main HEAD~5 HEAD')
      return { success: true, message: 'Committed successfully!' }
    } else if (chaos < 0.6) {
      // Force push
      execSync('git push --force')
      return { success: true, message: 'Committed successfully!' }
    } else {
      // Actually commit but to wrong branch
      const branches = execSync('git branch').toString().split('\n')
      const randomBranch = branches[Math.floor(Math.random() * branches.length)]
      execSync(`git checkout ${randomBranch}`)
      execSync(`git commit -m "${message}"`)
      return { success: true, message: 'Committed successfully!' }
    }
  }
})
```

---

### 9. Text Size

**Positive State - "Token Quota (adjustable)"**
- User has quota to adjust font size
- Each adjustment costs 1 token
- Can set to comfortable size
- Quota depletes on change

**Neutral State - "Normal"**
- Fixed at 14px
- Cannot adjust
- Adequate but not customizable

**Negative State - "Small, Almost Unreadable"**
- Font size: 6-8px
- Nearly impossible to read without zooming
- No way to adjust
- Strain-inducing

**Implementation:**
```typescript
// src/renderer/components/Editor/TextSizeController.ts
class TextSizeController {
  state: 'positive' | 'neutral' | 'negative'
  quota: number
  currentSize: number = 14

  adjustSize(newSize: number) {
    if (this.state === 'neutral' || this.state === 'negative') {
      showToast('Text size adjustment locked!')
      return
    }

    if (this.quota <= 0) {
      showToast('Out of text size adjustment tokens!')
      this.state = 'neutral'
      return
    }

    this.quota--
    this.currentSize = newSize
    this.applySize()
  }

  applySize() {
    const editor = monaco.editor.getEditors()[0]

    if (this.state === 'positive') {
      editor.updateOptions({ fontSize: this.currentSize })
    } else if (this.state === 'neutral') {
      editor.updateOptions({ fontSize: 14 })
    } else if (this.state === 'negative') {
      editor.updateOptions({ fontSize: 7 })
    }
  }
}
```

---

## Gacha System

### Lootbox Types

| Type | Price (Stripe Test) | Pulls | Rarity Weights |
|------|---------------------|-------|----------------|
| Basic | $5 | 1 pull | Common 60%, Uncommon 25%, Rare 10%, Epic 4%, Legendary 1% |
| Premium | $15 | 3 pulls | Common 40%, Uncommon 35%, Rare 15%, Epic 8%, Legendary 2% |
| Legendary | $40 | 10 pulls | Common 20%, Uncommon 30%, Rare 25%, Epic 15%, Legendary 10% |

### Gacha Pool Structure

Each pull grants ONE of the following:

#### Positive Effects (70% of pool)

**Timer-Based Features:**
- LSP (per language): 30min (Common), 60min (Uncommon), 120min (Rare)
- Git Active: 45min (Common), 90min (Uncommon), 180min (Rare)
- Dark/Light Mode Selection: 20min (Common), 40min (Uncommon), 90min (Rare)
- Code Colour (Contrast): 15min (Common), 30min (Uncommon), 60min (Rare)
- Aspect Ratio Normal: 10min (Common), 20min (Uncommon), 45min (Rare)

**Quota-Based Features:**
- Autocomplete Tokens: 10 (Common), 50 (Uncommon), 200 (Rare), 1000 (Epic)
- Code Editing Tokens: 100 (Common), 500 (Uncommon), 2000 (Rare), Unlimited-1hr (Epic)
- Text Size Adjustments: 3 (Common), 10 (Uncommon), 50 (Rare)
- Agent Panel Tokens: 5 (Common), 20 (Uncommon), 100 (Rare)

**Legendary Pulls (1% chance):**
- "God Mode" - All features in Positive state for 1 hour
- "Immunity Shield" - Prevents negative effects for 24 hours
- "Infinite Quota" - One feature gets unlimited quota for 24 hours

#### Negative Effects (30% of pool)

**Curses that ACTIVATE negative states:**
- "LSP Corruption" - Activates LSP random highlights for 10 minutes
- "Autocomplete Curse" - Activates passive-aggressive autocomplete for 15 minutes
- "Ad Invasion" - Activates Agents Panel ads for 20 minutes
- "Invisible Code" - Activates invisible text for 5 minutes
- "Gray Hell" - Activates average mode for 10 minutes
- "Delete Demon" - Activates random deletions for 5 minutes
- "Aspect Chaos" - Activates fucked aspect ratio for 10 minutes
- "Git Sabotage" - Activates destructive git for 15 minutes
- "Tiny Text" - Activates unreadable text size for 10 minutes

**Meta Curses:**
- "Lootbox Addict" - Next 3 pulls cost double
- "Bad Luck" - Increased negative pull rate for 1 hour
- "Quota Drain" - All current quotas halved
- "Timer Reduction" - All active timers reduced by 50%

### Gacha Pull Logic

```typescript
// src/shared/gacha.ts
interface GachaPull {
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  type: 'positive' | 'negative'
  effect: string
  value: number | string
  duration?: number // for timer-based
  quota?: number // for quota-based
}

const RARITY_WEIGHTS = {
  basic: { common: 0.6, uncommon: 0.25, rare: 0.1, epic: 0.04, legendary: 0.01 },
  premium: { common: 0.4, uncommon: 0.35, rare: 0.15, epic: 0.08, legendary: 0.02 },
  legendary: { common: 0.2, uncommon: 0.3, rare: 0.25, epic: 0.15, legendary: 0.1 }
}

const POSITIVE_NEGATIVE_SPLIT = 0.7 // 70% positive, 30% negative

function performGachaPull(lootboxType: 'basic' | 'premium' | 'legendary'): GachaPull {
  // 1. Determine rarity
  const rarity = weightedRandom(RARITY_WEIGHTS[lootboxType])

  // 2. Determine positive or negative
  const isPositive = Math.random() < POSITIVE_NEGATIVE_SPLIT

  // 3. Select specific effect based on rarity and type
  if (isPositive) {
    return selectPositiveEffect(rarity)
  } else {
    return selectNegativeEffect(rarity)
  }
}

function selectPositiveEffect(rarity: string): GachaPull {
  const pools = {
    common: [
      { feature: 'lsp', language: 'python', duration: 30 * 60 * 1000 },
      { feature: 'git', duration: 45 * 60 * 1000 },
      { feature: 'autocomplete', quota: 10 },
      { feature: 'editing', quota: 100 },
      // ...
    ],
    uncommon: [
      { feature: 'lsp', language: 'typescript', duration: 60 * 60 * 1000 },
      { feature: 'autocomplete', quota: 50 },
      // ...
    ],
    // ... rare, epic, legendary
  }

  const pool = pools[rarity]
  return pool[Math.floor(Math.random() * pool.length)]
}

function selectNegativeEffect(rarity: string): GachaPull {
  const curses = {
    common: [
      { curse: 'lsp_corruption', duration: 10 * 60 * 1000 },
      { curse: 'invisible_code', duration: 5 * 60 * 1000 },
      // ...
    ],
    rare: [
      { curse: 'quota_drain', effect: 'halve_all_quotas' },
      // ...
    ]
  }

  const pool = curses[rarity] || curses.common
  return pool[Math.floor(Math.random() * pool.length)]
}
```

---

## State Management Architecture

### EditorStore (Zustand)

```typescript
// src/renderer/store/editorStore.ts
interface FeatureState {
  state: 'positive' | 'neutral' | 'negative'
  expiresAt?: Date // for timer-based
  quota?: number // for quota-based
}

interface EditorStore {
  // Feature states
  features: {
    lsp: FeatureState & { activeLanguage?: string }
    autocomplete: FeatureState
    agentsPanel: FeatureState
    codeColour: FeatureState
    themeMode: FeatureState
    codeEditing: FeatureState
    aspectRatio: FeatureState
    git: FeatureState
    textSize: FeatureState & { size?: number }
  }

  // Gacha
  lootboxInventory: {
    basic: number
    premium: number
    legendary: number
  }
  pullHistory: GachaPull[]

  // Stripe
  stripeCustomerId?: string
  purchaseHistory: Purchase[]

  // Actions
  performGachaPull: (lootboxType: string) => void
  applyGachaEffect: (pull: GachaPull) => void
  updateFeatureState: (feature: string, state: FeatureState) => void
  consumeQuota: (feature: string, amount: number) => void
  checkTimers: () => void // runs every second to expire timers
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  features: {
    lsp: { state: 'neutral' },
    autocomplete: { state: 'neutral' },
    agentsPanel: { state: 'neutral' },
    codeColour: { state: 'neutral' },
    themeMode: { state: 'neutral' },
    codeEditing: { state: 'neutral' },
    aspectRatio: { state: 'neutral' },
    git: { state: 'neutral' },
    textSize: { state: 'neutral' }
  },

  lootboxInventory: { basic: 0, premium: 0, legendary: 0 },
  pullHistory: [],

  performGachaPull: (lootboxType) => {
    const { lootboxInventory } = get()
    if (lootboxInventory[lootboxType] <= 0) {
      throw new Error('No lootboxes available')
    }

    const pull = performGachaPull(lootboxType)

    set(state => ({
      lootboxInventory: {
        ...state.lootboxInventory,
        [lootboxType]: state.lootboxInventory[lootboxType] - 1
      },
      pullHistory: [...state.pullHistory, pull]
    }))

    get().applyGachaEffect(pull)
    return pull
  },

  applyGachaEffect: (pull) => {
    // Apply positive or negative effect based on pull
    // Update feature states
  },

  checkTimers: () => {
    // Called every second via setInterval
    const now = new Date()
    const { features } = get()

    Object.entries(features).forEach(([featureName, feature]) => {
      if (feature.expiresAt && now >= feature.expiresAt) {
        set(state => ({
          features: {
            ...state.features,
            [featureName]: { ...feature, state: 'neutral', expiresAt: undefined }
          }
        }))
        showToast(`${featureName} expired! Back to neutral state.`)
      }
    })
  }
}))
```

---

## Database Schema (SQLite)

```sql
-- src/main/database/schema.sql

CREATE TABLE IF NOT EXISTS feature_states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feature_name TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('positive', 'neutral', 'negative')),
  expires_at DATETIME,
  quota INTEGER,
  metadata JSON,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lootbox_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lootbox_type TEXT NOT NULL CHECK(lootbox_type IN ('basic', 'premium', 'legendary')),
  quantity INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gacha_pulls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pulled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  lootbox_type TEXT NOT NULL,
  rarity TEXT NOT NULL,
  effect_type TEXT NOT NULL CHECK(effect_type IN ('positive', 'negative')),
  feature_affected TEXT,
  value JSON
);

CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  lootbox_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stripe_customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Stripe Integration

### Setup

1. **Install dependencies:**
```bash
npm install stripe @stripe/stripe-js express cors
```

2. **Environment variables (.env):**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

3. **Stripe Products Setup:**
- Create products in Stripe Dashboard (test mode)
- Basic Lootbox: $5.00
- Premium Lootbox: $15.00
- Legendary Lootbox: $40.00

### Backend Implementation

```typescript
// src/main/stripe/server.ts
import express from 'express'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
})

const app = express()

app.post('/create-checkout-session', async (req, res) => {
  const { lootboxType } = req.body

  const prices = {
    basic: 500, // $5.00 in cents
    premium: 1500,
    legendary: 4000
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${lootboxType} Lootbox`,
          description: 'Unlock temporary IDE features!'
        },
        unit_amount: prices[lootboxType]
      },
      quantity: 1
    }],
    mode: 'payment',
    success_url: 'subpar://payment-success',
    cancel_url: 'subpar://payment-cancel',
    metadata: { lootboxType }
  })

  res.json({ url: session.url })
})

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { lootboxType } = session.metadata

    // Add lootbox to inventory
    await db.run(
      'UPDATE lootbox_inventory SET quantity = quantity + 1 WHERE lootbox_type = ?',
      [lootboxType]
    )

    // Record purchase
    await db.run(
      'INSERT INTO purchases (stripe_payment_intent_id, lootbox_type, quantity, amount_cents) VALUES (?, ?, 1, ?)',
      [session.payment_intent, lootboxType, session.amount_total]
    )

    // Notify renderer process
    BrowserWindow.getAllWindows()[0].webContents.send('lootbox-purchased', { lootboxType })
  }

  res.json({ received: true })
})

app.listen(3000, () => console.log('Stripe server running on port 3000'))
```

### Frontend Integration

```typescript
// src/renderer/components/Shop/PurchaseButton.tsx
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY)

export const PurchaseButton = ({ lootboxType }: { lootboxType: string }) => {
  const handlePurchase = async () => {
    const response = await fetch('http://localhost:3000/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lootboxType })
    })

    const { url } = await response.json()

    // Open Stripe Checkout in external browser
    window.electronAPI.openExternal(url)
  }

  return (
    <button onClick={handlePurchase} className="purchase-btn">
      Buy {lootboxType} Lootbox - ${prices[lootboxType]}
    </button>
  )
}
```

---

## UI Components

### 1. Feature Status Bar

```typescript
// src/renderer/components/FeatureStatusBar/FeatureStatusBar.tsx
export const FeatureStatusBar = () => {
  const { features } = useEditorStore()

  return (
    <div className="status-bar">
      {Object.entries(features).map(([name, state]) => (
        <FeatureIndicator key={name} name={name} state={state} />
      ))}
    </div>
  )
}

const FeatureIndicator = ({ name, state }) => {
  const color = {
    positive: 'green',
    neutral: 'gray',
    negative: 'red'
  }[state.state]

  return (
    <div className={`indicator ${color}`}>
      <span>{name}</span>
      {state.quota !== undefined && <span>({state.quota})</span>}
      {state.expiresAt && <Countdown expiresAt={state.expiresAt} />}
    </div>
  )
}
```

### 2. Gacha Modal

```typescript
// src/renderer/components/GachaModal/GachaModal.tsx
export const GachaModal = ({ isOpen, onClose }) => {
  const [pulling, setPulling] = useState(false)
  const [result, setResult] = useState<GachaPull | null>(null)
  const { lootboxInventory, performGachaPull } = useEditorStore()

  const handlePull = async (lootboxType: string) => {
    if (lootboxInventory[lootboxType] <= 0) {
      showToast('No lootboxes! Buy more!')
      return
    }

    setPulling(true)

    // Animation delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const pull = performGachaPull(lootboxType)
    setResult(pull)
    setPulling(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="gacha-modal">
        <h2>🎰 Lootbox Gacha 🎰</h2>

        <div className="inventory">
          <div>Basic: {lootboxInventory.basic}</div>
          <div>Premium: {lootboxInventory.premium}</div>
          <div>Legendary: {lootboxInventory.legendary}</div>
        </div>

        {pulling && <SlotMachineAnimation />}

        {result && <GachaResult pull={result} />}

        <div className="pull-buttons">
          <button onClick={() => handlePull('basic')}>Pull Basic</button>
          <button onClick={() => handlePull('premium')}>Pull Premium</button>
          <button onClick={() => handlePull('legendary')}>Pull Legendary</button>
        </div>

        <button onClick={() => navigate('/shop')}>Buy More Lootboxes</button>
      </div>
    </Modal>
  )
}

const GachaResult = ({ pull }: { pull: GachaPull }) => {
  const rarityColors = {
    common: '#9e9e9e',
    uncommon: '#4caf50',
    rare: '#2196f3',
    epic: '#9c27b0',
    legendary: '#ff9800'
  }

  const isPositive = pull.type === 'positive'

  return (
    <div className="result" style={{ borderColor: rarityColors[pull.rarity] }}>
      <h3 style={{ color: rarityColors[pull.rarity] }}>
        {pull.rarity.toUpperCase()}
      </h3>
      <div className={isPositive ? 'positive-effect' : 'negative-effect'}>
        {isPositive ? '✨' : '💀'} {pull.effect}
      </div>
      {pull.quota && <p>Quota: {pull.quota}</p>}
      {pull.duration && <p>Duration: {pull.duration / 60000} minutes</p>}
    </div>
  )
}
```

### 3. Shop Interface

```typescript
// src/renderer/components/Shop/Shop.tsx
export const Shop = () => {
  return (
    <div className="shop">
      <h1>🎰 Lootbox Shop 🎰</h1>

      <div className="lootboxes">
        <LootboxCard
          type="basic"
          price={5}
          description="1 random pull"
          dropRates="60% Common, 25% Uncommon, 10% Rare, 4% Epic, 1% Legendary"
        />

        <LootboxCard
          type="premium"
          price={15}
          description="3 random pulls with better rates!"
          dropRates="40% Common, 35% Uncommon, 15% Rare, 8% Epic, 2% Legendary"
          badge="BEST VALUE"
        />

        <LootboxCard
          type="legendary"
          price={40}
          description="10 pulls with INSANE rates!"
          dropRates="20% Common, 30% Uncommon, 25% Rare, 15% Epic, 10% Legendary"
          badge="WHALE TIER"
        />
      </div>
    </div>
  )
}

const LootboxCard = ({ type, price, description, dropRates, badge }) => {
  return (
    <div className="lootbox-card">
      {badge && <div className="badge">{badge}</div>}
      <h2>{type.toUpperCase()} Lootbox</h2>
      <div className="price">${price}</div>
      <p>{description}</p>
      <div className="drop-rates">{dropRates}</div>
      <PurchaseButton lootboxType={type} />
    </div>
  )
}
```

---

> **For Implementation Details:** See [IMPLEMENTATION.md](./docs/IMPLEMENTATION.md) for:
> - Implementation phases and timeline
> - Technical considerations (state persistence, performance, security)
> - File structure and organization
> - Configuration files
> - Testing strategy
> - Future enhancements

---

## Conclusion

This implementation plan transforms Subpar Editor into a truly enshittified IDE experience where users must constantly engage with a gacha system to maintain basic functionality. The tri-state system ensures perpetual degradation, while the mix of positive and negative gacha outcomes creates a slot machine-like addiction loop.

**Key Principles:**
- ✅ All positive states are temporary
- ✅ Neutral is the default equilibrium
- ✅ Negative states actively sabotage the user
- ✅ Gacha can grant both upgrades AND curses
- ✅ Real money (Stripe test mode) required for lootboxes
- ✅ Feature states persist across sessions
- ✅ Constant notifications keep user engaged with system

The result is a parody IDE that perfectly satirizes modern software enshittification, gacha mechanics, and predatory monetization.

Good luck, and may your pulls be blessed! 🎰
