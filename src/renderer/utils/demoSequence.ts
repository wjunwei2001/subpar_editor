// Demo mode - predetermined gacha pull sequence for demonstrations

import type { GachaPull } from '@shared/gachaTypes';
import { QUOTA_AMOUNTS, CURSE_DURATIONS } from '@shared/gachaConfig';

// Check if demo mode is enabled via environment variable
export const isDemoMode = (): boolean => {
  return import.meta.env.VITE_DEMO_MODE === 'true';
};

// The predetermined demo sequence
// Flow: Agent (positive) -> Badge -> Autocomplete curse -> LSP curse -> Ads curse -> Invisible code
export const DEMO_SEQUENCE: Omit<GachaPull, 'id' | 'timestamp'>[] = [
  // 1. Agent Tokens (Uncommon, Positive) - "Nice! You can use the AI agent!"
  {
    lootboxType: 'premium',
    rarity: 'uncommon',
    category: 'positive',
    effect: {
      type: 'quota',
      name: 'Agent Pack',
      description: '20 AI agent interactions',
      feature: 'agentsPanel',
      amount: QUOTA_AMOUNTS.agentsPanel.uncommon,
    },
  },

  // 2. Citadel Badge (Common, Neutral) - "A collectible badge - not bad!"
  {
    lootboxType: 'basic',
    rarity: 'common',
    category: 'neutral',
    effect: {
      type: 'badge',
      name: 'Citadel Badge',
      description: 'You received a collectible Citadel sponsor badge!',
      badge: 'citadel',
    },
  },

  // 3. Autocomplate (Common, Curse) - "Uh oh... first curse"
  {
    lootboxType: 'basic',
    rarity: 'common',
    category: 'negative',
    effect: {
      type: 'curse',
      name: 'Autocomplate',
      description: 'Passive-aggressive autocomplete (15 min)',
      curseId: 'passiveAggressive',
      feature: 'autocomplete',
      durationMs: CURSE_DURATIONS.passiveAggressive,
    },
  },

  // 4. LSP? Only MCP (Common, Curse) - "Syntax highlighting is broken now"
  {
    lootboxType: 'basic',
    rarity: 'common',
    category: 'negative',
    effect: {
      type: 'curse',
      name: 'LSP? Only MCP',
      description: 'LSP shows random wrong highlights (10 min)',
      curseId: 'lspCorruption',
      feature: 'lsp',
      durationMs: CURSE_DURATIONS.lspCorruption,
    },
  },

  // 5. AI: Ads Increased (Common, Curse) - "Wait - your agent panel is now ads!"
  {
    lootboxType: 'basic',
    rarity: 'common',
    category: 'negative',
    effect: {
      type: 'curse',
      name: 'AI: Ads Increased',
      description: 'Agent panel becomes ad space (20 min)',
      curseId: 'adPanel',
      feature: 'agentsPanel',
      durationMs: CURSE_DURATIONS.adPanel,
    },
  },

  // 6. Invisible Code (Uncommon, Curse) - "And now you can't see your code..."
  {
    lootboxType: 'premium',
    rarity: 'uncommon',
    category: 'negative',
    effect: {
      type: 'curse',
      name: 'Now You See Me...',
      description: 'Code becomes nearly invisible (5 min)',
      curseId: 'invisibleCode',
      feature: 'codeColour',
      durationMs: CURSE_DURATIONS.invisibleCode,
    },
  },
];

// Get the next demo pull, cycling through the sequence
let demoIndex = 0;

export function getNextDemoPull(): GachaPull {
  const template = DEMO_SEQUENCE[demoIndex];

  // Create full pull with id and timestamp
  const pull: GachaPull = {
    ...template,
    id: `demo-${Date.now()}-${demoIndex}`,
    timestamp: Date.now(),
  };

  // Advance to next in sequence (cycle back to start)
  demoIndex = (demoIndex + 1) % DEMO_SEQUENCE.length;

  return pull;
}

// Reset demo sequence to beginning
export function resetDemoSequence(): void {
  demoIndex = 0;
}

// Get current demo index (for UI display)
export function getDemoIndex(): number {
  return demoIndex;
}

// Get total demo pulls count
export function getDemoTotal(): number {
  return DEMO_SEQUENCE.length;
}
