// Gacha System Configuration Constants

import type { LootboxType, Rarity, SponsorBadge } from './gachaTypes';

// Lootbox prices in cents (for Stripe)
export const LOOTBOX_PRICES: Record<LootboxType, number> = {
  basic: 500,      // $5.00
  premium: 1500,   // $15.00
  legendary: 4000, // $40.00
};

// Display prices
export const LOOTBOX_DISPLAY_PRICES: Record<LootboxType, string> = {
  basic: '$5',
  premium: '$15',
  legendary: '$40',
};

// Number of pulls per lootbox type
export const LOOTBOX_PULLS: Record<LootboxType, number> = {
  basic: 1,
  premium: 3,
  legendary: 10,
};

// Rarity weights by lootbox type
export const RARITY_WEIGHTS: Record<LootboxType, Record<Rarity, number>> = {
  basic: {
    common: 0.60,
    uncommon: 0.25,
    rare: 0.10,
    epic: 0.04,
    legendary: 0.01,
  },
  premium: {
    common: 0.40,
    uncommon: 0.35,
    rare: 0.15,
    epic: 0.08,
    legendary: 0.02,
  },
  legendary: {
    common: 0.20,
    uncommon: 0.30,
    rare: 0.25,
    epic: 0.15,
    legendary: 0.10,
  },
};

// Effect category weights (positive/neutral/negative split)
export const EFFECT_CATEGORY_WEIGHTS = {
  positive: 0.50,  // 50% chance for positive
  neutral: 0.30,   // 30% chance for badge
  negative: 0.20,  // 20% chance for curse
};

// Timer durations in milliseconds
export const TIMER_DURATIONS = {
  // LSP per language
  lsp: {
    common: 30 * 60 * 1000,     // 30 min
    uncommon: 60 * 60 * 1000,   // 60 min
    rare: 120 * 60 * 1000,      // 120 min
  },
  // Git integration
  git: {
    common: 45 * 60 * 1000,     // 45 min
    uncommon: 90 * 60 * 1000,   // 90 min
    rare: 180 * 60 * 1000,      // 180 min
  },
  // Dark/Light mode selection
  themeMode: {
    common: 20 * 60 * 1000,     // 20 min
    uncommon: 40 * 60 * 1000,   // 40 min
    rare: 90 * 60 * 1000,       // 90 min
  },
  // Code color (contrast)
  codeColour: {
    common: 15 * 60 * 1000,     // 15 min
    uncommon: 30 * 60 * 1000,   // 30 min
    rare: 60 * 60 * 1000,       // 60 min
  },
  // Aspect ratio
  aspectRatio: {
    common: 10 * 60 * 1000,     // 10 min
    uncommon: 20 * 60 * 1000,   // 20 min
    rare: 45 * 60 * 1000,       // 45 min
  },
};

// Quota amounts
export const QUOTA_AMOUNTS = {
  autocomplete: {
    common: 10,
    uncommon: 50,
    rare: 200,
    epic: 1000,
  },
  codeEditing: {
    common: 100,
    uncommon: 500,
    rare: 2000,
    epic: 99999, // "Unlimited" for 1 hour (handled specially)
  },
  textSize: {
    common: 3,
    uncommon: 10,
    rare: 50,
  },
  agentsPanel: {
    common: 5,
    uncommon: 20,
    rare: 100,
  },
};

// Special effect durations
export const SPECIAL_EFFECT_DURATIONS = {
  godMode: 60 * 60 * 1000,        // 1 hour
  immunityShield: 24 * 60 * 60 * 1000, // 24 hours
  infiniteQuota: 24 * 60 * 60 * 1000,  // 24 hours
};

// Curse durations in milliseconds
export const CURSE_DURATIONS = {
  lspCorruption: 10 * 60 * 1000,       // 10 min - "LSP? Only MCP"
  passiveAggressive: 15 * 60 * 1000,   // 15 min - "Autocomplate"
  adPanel: 20 * 60 * 1000,             // 20 min - "AI: Ads increased"
  invisibleCode: 5 * 60 * 1000,        // 5 min - "Now you see me now you don't"
  randomDeletions: 5 * 60 * 1000,      // 5 min - "You don't need those"
  aspectRatioFucked: 10 * 60 * 1000,   // 10 min - "Ratioed"
  destructiveGit: 15 * 60 * 1000,      // 15 min - "Git Gud"
  tinyText: 10 * 60 * 1000,            // 10 min - "Is this for ants?"
  badLuck: 60 * 60 * 1000,             // 1 hour - "Bad Luck"
};

// Meta curse configurations
export const META_CURSE_CONFIG = {
  lootboxAddict: {
    pullsAffected: 3,
    priceMultiplier: 2,
  },
  badLuck: {
    durationMs: 60 * 60 * 1000,
    negativeBoost: 0.15, // +15% chance of negative
  },
  quotaDrain: {
    multiplier: 0.5, // Halves all quotas
  },
  timerReduction: {
    multiplier: 0.5, // Reduces all timers by 50%
  },
};

// Sponsor badge display names
export const BADGE_DISPLAY_NAMES: Record<SponsorBadge, string> = {
  virtu: 'Virtu Financial',
  marshallWace: 'Marshall Wace',
  ahrefs: 'Ahrefs',
  qrt: 'QRT',
  squarePoint: 'SquarePoint Capital',
  citadel: 'Citadel',
  optiver: 'Optiver',
};

// Rarity colors for UI
export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#9e9e9e',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

// Rarity names for display
export const RARITY_NAMES: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'LEGENDARY',
};
