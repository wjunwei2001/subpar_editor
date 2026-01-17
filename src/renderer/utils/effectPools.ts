// Effect pools for gacha system

import type {
  Rarity,
  PositiveEffect,
  BadgeEffect,
  NegativeEffect,
  SponsorBadge,
  GachaFeature,
  TimerEffect,
  QuotaEffect,
  SpecialEffect,
  CurseEffect,
  MetaCurseEffect,
} from '@shared/gachaTypes';
import {
  TIMER_DURATIONS,
  QUOTA_AMOUNTS,
  SPECIAL_EFFECT_DURATIONS,
  CURSE_DURATIONS,
  META_CURSE_CONFIG,
} from '@shared/gachaConfig';

// Helper to create timer effects
function timerEffect(
  name: string,
  description: string,
  feature: GachaFeature,
  durationMs: number
): TimerEffect {
  return { type: 'timer', name, description, feature, durationMs };
}

// Helper to create quota effects
function quotaEffect(
  name: string,
  description: string,
  feature: GachaFeature,
  amount: number
): QuotaEffect {
  return { type: 'quota', name, description, feature, amount };
}

// Positive effects by rarity
export const POSITIVE_POOLS: Record<Rarity, PositiveEffect[]> = {
  common: [
    timerEffect('Python LSP', 'LSP enabled for Python (30 min)', 'lsp', TIMER_DURATIONS.lsp.common),
    timerEffect('Git Access', 'Git features enabled (45 min)', 'git', TIMER_DURATIONS.git.common),
    timerEffect('Theme Toggle', 'Dark/Light mode selection (20 min)', 'themeMode', TIMER_DURATIONS.themeMode.common),
    timerEffect('Color Boost', 'High contrast colors (15 min)', 'codeColour', TIMER_DURATIONS.codeColour.common),
    timerEffect('Normal View', 'Normal aspect ratio (10 min)', 'aspectRatio', TIMER_DURATIONS.aspectRatio.common),
    quotaEffect('Autocomplete Tokens', '10 autocomplete tokens', 'autocomplete', QUOTA_AMOUNTS.autocomplete.common),
    quotaEffect('Edit Tokens', '100 code editing tokens', 'codeEditing', QUOTA_AMOUNTS.codeEditing.common),
    quotaEffect('Text Adjustments', '3 text size adjustments', 'textSize', QUOTA_AMOUNTS.textSize.common),
    quotaEffect('Agent Tokens', '5 AI agent interactions', 'agentsPanel', QUOTA_AMOUNTS.agentsPanel.common),
  ],
  uncommon: [
    timerEffect('TypeScript LSP', 'LSP enabled for TypeScript (60 min)', 'lsp', TIMER_DURATIONS.lsp.uncommon),
    timerEffect('Extended Git', 'Git features enabled (90 min)', 'git', TIMER_DURATIONS.git.uncommon),
    timerEffect('Theme Freedom', 'Dark/Light mode selection (40 min)', 'themeMode', TIMER_DURATIONS.themeMode.uncommon),
    timerEffect('Enhanced Colors', 'High contrast colors (30 min)', 'codeColour', TIMER_DURATIONS.codeColour.uncommon),
    timerEffect('Comfortable View', 'Normal aspect ratio (20 min)', 'aspectRatio', TIMER_DURATIONS.aspectRatio.uncommon),
    quotaEffect('Autocomplete Pack', '50 autocomplete tokens', 'autocomplete', QUOTA_AMOUNTS.autocomplete.uncommon),
    quotaEffect('Edit Pack', '500 code editing tokens', 'codeEditing', QUOTA_AMOUNTS.codeEditing.uncommon),
    quotaEffect('Text Pack', '10 text size adjustments', 'textSize', QUOTA_AMOUNTS.textSize.uncommon),
    quotaEffect('Agent Pack', '20 AI agent interactions', 'agentsPanel', QUOTA_AMOUNTS.agentsPanel.uncommon),
  ],
  rare: [
    timerEffect('JavaScript LSP', 'LSP enabled for JavaScript (120 min)', 'lsp', TIMER_DURATIONS.lsp.rare),
    timerEffect('Pro Git', 'Git features enabled (180 min)', 'git', TIMER_DURATIONS.git.rare),
    timerEffect('Theme Master', 'Dark/Light mode selection (90 min)', 'themeMode', TIMER_DURATIONS.themeMode.rare),
    timerEffect('Premium Colors', 'High contrast colors (60 min)', 'codeColour', TIMER_DURATIONS.codeColour.rare),
    timerEffect('Perfect View', 'Normal aspect ratio (45 min)', 'aspectRatio', TIMER_DURATIONS.aspectRatio.rare),
    quotaEffect('Autocomplete Vault', '200 autocomplete tokens', 'autocomplete', QUOTA_AMOUNTS.autocomplete.rare),
    quotaEffect('Edit Vault', '2000 code editing tokens', 'codeEditing', QUOTA_AMOUNTS.codeEditing.rare),
    quotaEffect('Text Vault', '50 text size adjustments', 'textSize', QUOTA_AMOUNTS.textSize.rare),
    quotaEffect('Agent Vault', '100 AI agent interactions', 'agentsPanel', QUOTA_AMOUNTS.agentsPanel.rare),
  ],
  epic: [
    quotaEffect('Autocomplete Hoard', '1000 autocomplete tokens', 'autocomplete', QUOTA_AMOUNTS.autocomplete.epic),
    quotaEffect('Unlimited Editing', 'Unlimited editing for 1 hour', 'codeEditing', QUOTA_AMOUNTS.codeEditing.epic),
    {
      type: 'special',
      name: 'Infinite Autocomplete',
      description: 'Unlimited autocomplete for 24 hours',
      effectId: 'infiniteQuota',
      feature: 'autocomplete',
      durationMs: SPECIAL_EFFECT_DURATIONS.infiniteQuota,
    } as SpecialEffect,
    {
      type: 'special',
      name: 'Infinite Agent',
      description: 'Unlimited AI agent for 24 hours',
      effectId: 'infiniteQuota',
      feature: 'agentsPanel',
      durationMs: SPECIAL_EFFECT_DURATIONS.infiniteQuota,
    } as SpecialEffect,
  ],
  legendary: [
    {
      type: 'special',
      name: 'GOD MODE',
      description: 'All features in positive state for 1 hour!',
      effectId: 'godMode',
      durationMs: SPECIAL_EFFECT_DURATIONS.godMode,
    } as SpecialEffect,
    {
      type: 'special',
      name: 'Immunity Shield',
      description: 'Blocks all negative effects for 24 hours!',
      effectId: 'immunityShield',
      durationMs: SPECIAL_EFFECT_DURATIONS.immunityShield,
    } as SpecialEffect,
  ],
};

// Sponsor badges (neutral effects)
const ALL_BADGES: SponsorBadge[] = [
  'virtu',
  'marshallWace',
  'ahrefs',
  'qrt',
  'squarePoint',
  'citadel',
  'optiver',
];

export function getRandomBadge(): BadgeEffect {
  const badge = ALL_BADGES[Math.floor(Math.random() * ALL_BADGES.length)];
  const displayNames: Record<SponsorBadge, string> = {
    virtu: 'Virtu Financial',
    marshallWace: 'Marshall Wace',
    ahrefs: 'Ahrefs',
    qrt: 'QRT',
    squarePoint: 'SquarePoint Capital',
    citadel: 'Citadel',
    optiver: 'Optiver',
  };

  return {
    type: 'badge',
    name: `${displayNames[badge]} Badge`,
    description: `You received a collectible ${displayNames[badge]} sponsor badge!`,
    badge,
  };
}

// Curses by rarity
export const CURSE_POOLS: Record<Rarity, NegativeEffect[]> = {
  common: [
    {
      type: 'curse',
      name: 'LSP? Only MCP',
      description: 'LSP shows random wrong highlights (10 min)',
      curseId: 'lspCorruption',
      feature: 'lsp',
      durationMs: CURSE_DURATIONS.lspCorruption,
    } as CurseEffect,
    {
      type: 'curse',
      name: 'Autocomplate',
      description: 'Passive-aggressive autocomplete (15 min)',
      curseId: 'passiveAggressive',
      feature: 'autocomplete',
      durationMs: CURSE_DURATIONS.passiveAggressive,
    } as CurseEffect,
    {
      type: 'curse',
      name: 'AI: Ads Increased',
      description: 'Agent panel becomes ad space (20 min)',
      curseId: 'adPanel',
      feature: 'agentsPanel',
      durationMs: CURSE_DURATIONS.adPanel,
    } as CurseEffect,
  ],
  uncommon: [
    {
      type: 'curse',
      name: 'Now You See Me...',
      description: 'Code becomes nearly invisible (5 min)',
      curseId: 'invisibleCode',
      feature: 'codeColour',
      durationMs: CURSE_DURATIONS.invisibleCode,
    } as CurseEffect,
    {
      type: 'curse',
      name: 'You Don\'t Need Those',
      description: 'Random character deletions (5 min)',
      curseId: 'randomDeletions',
      feature: 'codeEditing',
      durationMs: CURSE_DURATIONS.randomDeletions,
    } as CurseEffect,
    {
      type: 'curse',
      name: 'Ratioed',
      description: 'Aspect ratio goes crazy (10 min)',
      curseId: 'aspectRatioFucked',
      feature: 'aspectRatio',
      durationMs: CURSE_DURATIONS.aspectRatioFucked,
    } as CurseEffect,
  ],
  rare: [
    {
      type: 'curse',
      name: 'Git Gud',
      description: 'Git operations become destructive (15 min)',
      curseId: 'destructiveGit',
      feature: 'git',
      durationMs: CURSE_DURATIONS.destructiveGit,
    } as CurseEffect,
    {
      type: 'curse',
      name: 'Is This For Ants?',
      description: 'Text becomes tiny (10 min)',
      curseId: 'tinyText',
      feature: 'textSize',
      durationMs: CURSE_DURATIONS.tinyText,
    } as CurseEffect,
    {
      type: 'metaCurse',
      name: 'Bad Luck',
      description: 'Increased negative pull rate for 1 hour',
      curseId: 'badLuck',
      durationMs: META_CURSE_CONFIG.badLuck.durationMs,
    } as MetaCurseEffect,
  ],
  epic: [
    {
      type: 'metaCurse',
      name: 'Lootbox Addict',
      description: 'Next 3 pulls cost double',
      curseId: 'lootboxAddict',
      multiplier: META_CURSE_CONFIG.lootboxAddict.priceMultiplier,
    } as MetaCurseEffect,
    {
      type: 'metaCurse',
      name: 'Quota Drain',
      description: 'All current quotas halved!',
      curseId: 'quotaDrain',
      multiplier: META_CURSE_CONFIG.quotaDrain.multiplier,
    } as MetaCurseEffect,
  ],
  legendary: [
    {
      type: 'metaCurse',
      name: 'Timer Reduction',
      description: 'All active timers reduced by 50%!',
      curseId: 'timerReduction',
      multiplier: META_CURSE_CONFIG.timerReduction.multiplier,
    } as MetaCurseEffect,
  ],
};

// Get a random positive effect for a rarity
export function getPositiveEffect(rarity: Rarity): PositiveEffect {
  const pool = POSITIVE_POOLS[rarity];
  return pool[Math.floor(Math.random() * pool.length)];
}

// Get a random negative effect for a rarity
export function getNegativeEffect(rarity: Rarity): NegativeEffect {
  const pool = CURSE_POOLS[rarity];
  // Fall back to common if no curses for this rarity
  const effectPool = pool.length > 0 ? pool : CURSE_POOLS.common;
  return effectPool[Math.floor(Math.random() * effectPool.length)];
}
