export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type LootboxType = 'basic' | 'premium' | 'legendary';
export type EffectType = 'positive' | 'negative';

export interface GachaPull {
  rarity: Rarity;
  type: EffectType;
  effect: string;
  description: string;
  feature?: string;
  duration?: number; // milliseconds for timer-based
  quota?: number; // for quota-based
}

const RARITY_WEIGHTS: Record<LootboxType, Record<Rarity, number>> = {
  basic: { common: 0.6, uncommon: 0.25, rare: 0.1, epic: 0.04, legendary: 0.01 },
  premium: { common: 0.4, uncommon: 0.35, rare: 0.15, epic: 0.08, legendary: 0.02 },
  legendary: { common: 0.2, uncommon: 0.3, rare: 0.25, epic: 0.15, legendary: 0.1 },
};

const POSITIVE_NEGATIVE_SPLIT = 0.7; // 70% positive, 30% negative

const POSITIVE_EFFECTS: Record<Rarity, GachaPull[]> = {
  common: [
    { rarity: 'common', type: 'positive', effect: 'Python LSP', description: '30 minutes of Python language support', feature: 'lsp', duration: 30 * 60 * 1000 },
    { rarity: 'common', type: 'positive', effect: 'Git Access', description: '45 minutes of git functionality', feature: 'git', duration: 45 * 60 * 1000 },
    { rarity: 'common', type: 'positive', effect: 'Autocomplete Tokens', description: '10 autocomplete tokens', feature: 'autocomplete', quota: 10 },
    { rarity: 'common', type: 'positive', effect: 'Edit Tokens', description: '100 character edit tokens', feature: 'editing', quota: 100 },
    { rarity: 'common', type: 'positive', effect: 'Theme Selection', description: '20 minutes of theme choice', feature: 'theme', duration: 20 * 60 * 1000 },
    { rarity: 'common', type: 'positive', effect: 'High Contrast', description: '15 minutes of readable code', feature: 'color', duration: 15 * 60 * 1000 },
  ],
  uncommon: [
    { rarity: 'uncommon', type: 'positive', effect: 'TypeScript LSP', description: '60 minutes of TypeScript support', feature: 'lsp', duration: 60 * 60 * 1000 },
    { rarity: 'uncommon', type: 'positive', effect: 'Git Pro', description: '90 minutes of git functionality', feature: 'git', duration: 90 * 60 * 1000 },
    { rarity: 'uncommon', type: 'positive', effect: 'Autocomplete Pack', description: '50 autocomplete tokens', feature: 'autocomplete', quota: 50 },
    { rarity: 'uncommon', type: 'positive', effect: 'Edit Pack', description: '500 character edit tokens', feature: 'editing', quota: 500 },
    { rarity: 'uncommon', type: 'positive', effect: 'Theme Freedom', description: '40 minutes of theme choice', feature: 'theme', duration: 40 * 60 * 1000 },
    { rarity: 'uncommon', type: 'positive', effect: 'Contrast Plus', description: '30 minutes of readable code', feature: 'color', duration: 30 * 60 * 1000 },
  ],
  rare: [
    { rarity: 'rare', type: 'positive', effect: 'Full LSP', description: '120 minutes of full language support', feature: 'lsp', duration: 120 * 60 * 1000 },
    { rarity: 'rare', type: 'positive', effect: 'Git Master', description: '180 minutes of git functionality', feature: 'git', duration: 180 * 60 * 1000 },
    { rarity: 'rare', type: 'positive', effect: 'Autocomplete Crate', description: '200 autocomplete tokens', feature: 'autocomplete', quota: 200 },
    { rarity: 'rare', type: 'positive', effect: 'Edit Crate', description: '2000 character edit tokens', feature: 'editing', quota: 2000 },
    { rarity: 'rare', type: 'positive', effect: 'Theme Mastery', description: '90 minutes of theme choice', feature: 'theme', duration: 90 * 60 * 1000 },
    { rarity: 'rare', type: 'positive', effect: 'Perfect Vision', description: '60 minutes of readable code', feature: 'color', duration: 60 * 60 * 1000 },
  ],
  epic: [
    { rarity: 'epic', type: 'positive', effect: 'Autocomplete Vault', description: '1000 autocomplete tokens', feature: 'autocomplete', quota: 1000 },
    { rarity: 'epic', type: 'positive', effect: 'Unlimited Editing', description: '1 hour of unlimited edits', feature: 'editing', duration: 60 * 60 * 1000 },
    { rarity: 'epic', type: 'positive', effect: 'Full IDE', description: '4 hours of all features', feature: 'all', duration: 4 * 60 * 60 * 1000 },
  ],
  legendary: [
    { rarity: 'legendary', type: 'positive', effect: 'GOD MODE', description: 'All features active for 1 hour!', feature: 'all', duration: 60 * 60 * 1000 },
    { rarity: 'legendary', type: 'positive', effect: 'Immunity Shield', description: 'No curses for 24 hours!', feature: 'immunity', duration: 24 * 60 * 60 * 1000 },
    { rarity: 'legendary', type: 'positive', effect: 'Infinite Power', description: 'Unlimited everything for 24 hours!', feature: 'infinite', duration: 24 * 60 * 60 * 1000 },
  ],
};

const NEGATIVE_EFFECTS: Record<Rarity, GachaPull[]> = {
  common: [
    { rarity: 'common', type: 'negative', effect: 'LSP Corruption', description: 'Random syntax highlighting for 10 minutes', feature: 'lsp', duration: 10 * 60 * 1000 },
    { rarity: 'common', type: 'negative', effect: 'Invisible Code', description: 'Text nearly invisible for 5 minutes', feature: 'visibility', duration: 5 * 60 * 1000 },
    { rarity: 'common', type: 'negative', effect: 'Tiny Text', description: 'Unreadable font size for 10 minutes', feature: 'textSize', duration: 10 * 60 * 1000 },
  ],
  uncommon: [
    { rarity: 'uncommon', type: 'negative', effect: 'Autocomplete Curse', description: 'Passive-aggressive suggestions for 15 minutes', feature: 'autocomplete', duration: 15 * 60 * 1000 },
    { rarity: 'uncommon', type: 'negative', effect: 'Ad Invasion', description: 'Agent panel becomes ads for 20 minutes', feature: 'agents', duration: 20 * 60 * 1000 },
    { rarity: 'uncommon', type: 'negative', effect: 'Eye Pain Mode', description: 'Flashbang colors for 10 minutes', feature: 'theme', duration: 10 * 60 * 1000 },
  ],
  rare: [
    { rarity: 'rare', type: 'negative', effect: 'Delete Demon', description: 'Random character deletions for 5 minutes', feature: 'editing', duration: 5 * 60 * 1000 },
    { rarity: 'rare', type: 'negative', effect: 'Aspect Chaos', description: 'Randomly changing aspect ratio for 10 minutes', feature: 'aspect', duration: 10 * 60 * 1000 },
    { rarity: 'rare', type: 'negative', effect: 'Quota Drain', description: 'All current quotas halved!', feature: 'quota' },
  ],
  epic: [
    { rarity: 'epic', type: 'negative', effect: 'Git Sabotage', description: 'Destructive git operations for 15 minutes', feature: 'git', duration: 15 * 60 * 1000 },
    { rarity: 'epic', type: 'negative', effect: 'Timer Reduction', description: 'All active timers reduced by 50%!', feature: 'timer' },
    { rarity: 'epic', type: 'negative', effect: 'Bad Luck', description: 'Increased curse rate for 1 hour', feature: 'luck', duration: 60 * 60 * 1000 },
  ],
  legendary: [
    { rarity: 'legendary', type: 'negative', effect: 'TOTAL CHAOS', description: 'All features go negative for 30 minutes!', feature: 'all', duration: 30 * 60 * 1000 },
  ],
};

function weightedRandom(weights: Record<Rarity, number>): Rarity {
  const entries = Object.entries(weights) as [Rarity, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * total;

  for (const [rarity, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      return rarity;
    }
  }

  return entries[entries.length - 1][0];
}

function selectFromPool(pool: GachaPull[]): GachaPull {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function performGachaPull(lootboxType: LootboxType): GachaPull {
  // 1. Determine rarity based on lootbox type
  const rarity = weightedRandom(RARITY_WEIGHTS[lootboxType]);

  // 2. Determine positive or negative (30% chance of curse)
  const isPositive = Math.random() < POSITIVE_NEGATIVE_SPLIT;

  // 3. Select specific effect from the appropriate pool
  if (isPositive) {
    const pool = POSITIVE_EFFECTS[rarity];
    return selectFromPool(pool);
  } else {
    // For negative effects, use same or lower rarity to avoid guaranteed legendary curse
    const availableRarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const rarityIndex = availableRarities.indexOf(rarity);
    const adjustedRarity = availableRarities[Math.min(rarityIndex, 2)] as Rarity; // Cap at rare for curses
    const pool = NEGATIVE_EFFECTS[adjustedRarity] || NEGATIVE_EFFECTS.common;
    return selectFromPool(pool);
  }
}

// Demo function to test specific rarities
export function performDemoPull(rarity?: Rarity, type?: EffectType): GachaPull {
  const targetRarity = rarity || weightedRandom(RARITY_WEIGHTS.legendary);
  const isPositive = type === 'positive' || (type === undefined && Math.random() < POSITIVE_NEGATIVE_SPLIT);

  if (isPositive) {
    return selectFromPool(POSITIVE_EFFECTS[targetRarity]);
  } else {
    const adjustedRarity = targetRarity === 'legendary' || targetRarity === 'epic' ? 'rare' : targetRarity;
    return selectFromPool(NEGATIVE_EFFECTS[adjustedRarity] || NEGATIVE_EFFECTS.common);
  }
}

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9e9e9e',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

export const LOOTBOX_PRICES: Record<LootboxType, number> = {
  basic: 5,
  premium: 15,
  legendary: 40,
};
