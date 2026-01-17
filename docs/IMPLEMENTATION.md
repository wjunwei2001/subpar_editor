# Subpar Editor - Implementation Guide

> **Note:** This document contains the detailed implementation plan. For feature specifications and design overview, see [claude.md](./claude.md).

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up database (SQLite + schema)
- [ ] Create feature state management in Zustand
- [ ] Implement timer system (setInterval for expiration checks)
- [ ] Create Feature Status Bar UI component
- [ ] Add basic feature state indicators

### Phase 2: Stripe Integration (Week 1-2)
- [ ] Set up Stripe test account
- [ ] Create products in Stripe Dashboard
- [ ] Implement Express server for webhooks
- [ ] Create Checkout session creation endpoint
- [ ] Handle webhook events (payment success)
- [ ] Update lootbox inventory on purchase
- [ ] Build Shop UI
- [ ] Test payment flow end-to-end

### Phase 3: Gacha System (Week 2)
- [ ] Implement gacha pull logic (rarity weights)
- [ ] Create gacha effect pool (positive + negative)
- [ ] Build Gacha Modal UI
- [ ] Add slot machine animation
- [ ] Implement result reveal animation
- [ ] Create pull history tracking
- [ ] Test all rarity distributions

### Phase 4: Feature Implementation - Neutral/Positive States (Week 2-3)

**4.1: LSP**
- [ ] Integrate language server protocol clients
- [ ] Create LSP manager with timer
- [ ] Enable per-language activation
- [ ] Implement expiration logic

**4.2: Autocomplete**
- [ ] Implement quota-based autocomplete provider
- [ ] Track quota consumption
- [ ] Disable when quota = 0

**4.3: Code Editing**
- [ ] Hook into Monaco content changes
- [ ] Implement edit quota system
- [ ] Block edits when quota depleted

**4.4: Git**
- [ ] Build git integration UI panel
- [ ] Implement timer-based activation
- [ ] Add basic git operations (commit, push, pull, branch)

**4.5: Theme/Visual Features**
- [ ] Implement theme manager (dark/light/average)
- [ ] Create color scheme system (contrast/basic/invisible)
- [ ] Build aspect ratio controller
- [ ] Implement text size controller

**4.6: Agents Panel**
- [ ] Create AI agent UI component
- [ ] Implement quota tracking for interactions
- [ ] Add basic agent functionality

### Phase 5: Negative States Implementation (Week 3-4)

**5.1: LSP Random Highlights**
- [ ] Override Monaco tokenization
- [ ] Implement random color assignment
- [ ] Add false diagnostics generator
- [ ] Create 10-second rotation timer

**5.2: Passive Aggressive Autocomplete**
- [ ] Create insult database
- [ ] Implement insulting suggestion provider
- [ ] Add forced autocomplete trigger
- [ ] Make dismissal difficult

**5.3: Random Deletions**
- [ ] Implement random character deletion
- [ ] Add random line deletion
- [ ] Show mocking notifications
- [ ] Ensure deletions persist on save

**5.4: Git Sabotage**
- [ ] Implement random branch operations
- [ ] Add dangerous rebase logic
- [ ] Create false success messages
- [ ] Add random force push

**5.5: Visual Sabotage**
- [ ] Implement invisible text theme
- [ ] Create average mode color blending
- [ ] Build aspect ratio chaos animator
- [ ] Set tiny text size

**5.6: Agents Panel Ads**
- [ ] Design lootbox advertisement banners
- [ ] Create fake countdown timers
- [ ] Add animated ad content
- [ ] Implement "limited offer" popups

### Phase 6: Polish & Testing (Week 4)
- [ ] Test all feature state transitions
- [ ] Verify timer expirations work correctly
- [ ] Test quota consumption and depletion
- [ ] Verify gacha pull distributions match intended rates
- [ ] Test Stripe integration thoroughly
- [ ] Add comprehensive error handling
- [ ] Implement state persistence (save/load from DB)
- [ ] Add notification system for state changes
- [ ] Create onboarding tutorial explaining the system

### Phase 7: Chaos Features (Week 5)
- [ ] Implement meta curses (quota drain, timer reduction)
- [ ] Add "Lootbox Addict" curse (double cost)
- [ ] Create "Bad Luck" curse (worse rates)
- [ ] Implement pity system (optional)
- [ ] Add achievement tracking
- [ ] Create statistics dashboard (total spent, rarest pull, etc.)

---

## Technical Considerations

### State Persistence

All feature states must persist across app restarts:

```typescript
// On app start
async function loadPersistedState() {
  const features = await db.all('SELECT * FROM feature_states')
  const lootboxes = await db.all('SELECT * FROM lootbox_inventory')

  // Check if timers expired while app was closed
  const now = new Date()
  features.forEach(feature => {
    if (feature.expires_at && new Date(feature.expires_at) < now) {
      feature.state = 'neutral'
      feature.expires_at = null
    }
  })

  // Load into Zustand
  useEditorStore.setState({ features, lootboxInventory: lootboxes })
}

// On state change
function persistState() {
  const { features } = useEditorStore.getState()

  Object.entries(features).forEach(([name, state]) => {
    db.run(
      'INSERT OR REPLACE INTO feature_states (feature_name, state, expires_at, quota) VALUES (?, ?, ?, ?)',
      [name, state.state, state.expiresAt, state.quota]
    )
  })
}
```

### Performance Optimizations

1. **Debounce quota checks** - Don't check on every keystroke, debounce to every 100ms
2. **Efficient timer checks** - Single setInterval that checks all timers, not individual intervals per feature
3. **Lazy load LSP** - Only start language servers when feature is in positive state
4. **Cache gacha pool** - Pre-calculate gacha pools on app start, don't compute on every pull

### Security Considerations

1. **Stripe webhook verification** - Always verify webhook signatures
2. **Environment variables** - Never commit Stripe keys, use .env
3. **SQL injection** - Use parameterized queries
4. **File deletion safety** - In negative state, consider moving to trash instead of rm (or make it optional)

### User Experience

1. **Clear feedback** - Always notify user when states change
2. **Countdown indicators** - Show remaining time/quota clearly
3. **Warning notifications** - Warn when quota/timer is low
4. **Graceful degradation** - Don't crash if a feature fails, just disable it
5. **Tutorial/Onboarding** - Explain the tri-state system on first launch

---

## File Structure

```
subpar_editor/
├── src/
│   ├── main/
│   │   ├── main.ts
│   │   ├── preload.ts
│   │   ├── database/
│   │   │   ├── db.ts
│   │   │   ├── schema.sql
│   │   │   └── queries.ts
│   │   ├── stripe/
│   │   │   ├── server.ts
│   │   │   ├── checkout.ts
│   │   │   └── webhooks.ts
│   │   └── ipc/
│   │       ├── fileHandlers.ts
│   │       ├── terminalHandlers.ts
│   │       ├── gachaHandlers.ts
│   │       ├── featureHandlers.ts
│   │       └── gitHandlers.ts
│   ├── renderer/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── FeatureStatusBar/
│   │   │   │   ├── FeatureStatusBar.tsx
│   │   │   │   ├── FeatureIndicator.tsx
│   │   │   │   └── Countdown.tsx
│   │   │   ├── GachaModal/
│   │   │   │   ├── GachaModal.tsx
│   │   │   │   ├── SlotMachineAnimation.tsx
│   │   │   │   └── GachaResult.tsx
│   │   │   ├── Shop/
│   │   │   │   ├── Shop.tsx
│   │   │   │   ├── LootboxCard.tsx
│   │   │   │   └── PurchaseButton.tsx
│   │   │   ├── Editor/
│   │   │   │   ├── MonacoEditor.tsx
│   │   │   │   ├── LSPManager.ts
│   │   │   │   ├── AutocompleteProvider.ts
│   │   │   │   ├── TextSizeController.ts
│   │   │   │   └── AspectRatioController.ts
│   │   │   ├── Git/
│   │   │   │   ├── GitPanel.tsx
│   │   │   │   └── GitManager.ts
│   │   │   ├── AgentsPanel/
│   │   │   │   ├── AgentsPanel.tsx
│   │   │   │   ├── AIAssistant.tsx
│   │   │   │   └── AdSpace.tsx
│   │   │   └── Theme/
│   │   │       ├── ThemeManager.ts
│   │   │       └── themes.ts
│   │   ├── hooks/
│   │   │   ├── useFeatureState.ts
│   │   │   ├── useGacha.ts
│   │   │   └── useTimer.ts
│   │   ├── store/
│   │   │   └── editorStore.ts
│   │   └── styles/
│   │       ├── global.css
│   │       ├── gacha.css
│   │       └── shop.css
│   └── shared/
│       ├── types.ts
│       ├── gacha.ts
│       └── constants.ts
├── docs/
│   ├── features.md
│   ├── claude.md
│   └── IMPLEMENTATION.md (this file)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env (gitignored)
└── README.md
```

---

## Configuration Files

### .env.example
```
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here

# Product IDs (create in Stripe Dashboard)
STRIPE_BASIC_PRICE_ID=price_basic_lootbox
STRIPE_PREMIUM_PRICE_ID=price_premium_lootbox
STRIPE_LEGENDARY_PRICE_ID=price_legendary_lootbox
```

### package.json additions
```json
{
  "dependencies": {
    "stripe": "^14.0.0",
    "@stripe/stripe-js": "^2.0.0",
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "better-sqlite3": "^9.0.0"
  }
}
```

---

## Testing Strategy

### Unit Tests
- Gacha pull logic (verify rarity distributions)
- Feature state transitions
- Quota consumption
- Timer expiration

### Integration Tests
- Stripe webhook handling
- Database persistence
- IPC communication

### Manual Testing Checklist
- [ ] Purchase lootbox with Stripe test card
- [ ] Verify lootbox added to inventory
- [ ] Pull from each lootbox type
- [ ] Verify positive effects activate correctly
- [ ] Verify negative effects activate correctly
- [ ] Test timer expiration (wait for timer to run out)
- [ ] Test quota depletion (use all quota)
- [ ] Test state persistence (restart app, verify states preserved)
- [ ] Test each feature in all 3 states
- [ ] Verify git sabotage doesn't destroy real data (use test repo)

---

## Future Enhancements (Post-MVP)

1. **Achievements System**
   - "First Blood" - Pull first negative effect
   - "Whale" - Spend $100
   - "Lucky" - Pull legendary on first try
   - "Survivor" - Code for 1 hour with all negative states

2. **Leaderboards**
   - Most money spent
   - Most gacha pulls
   - Rarest pull

3. **Daily Rewards**
   - Free basic lootbox every 24 hours
   - Login streak bonuses

4. **Battle Pass**
   - Season pass with progression
   - Complete coding challenges to earn lootboxes

5. **Social Features**
   - Share gacha pulls on social media
   - Gift lootboxes to friends
   - Competitive mode (who can code with worst features)

6. **More Negative States**
   - Keyboard remapping (random keys swapped)
   - Mouse drift (cursor moves randomly)
   - Audio harassment (annoying sounds on keypress)
   - Popup ads every 30 seconds

