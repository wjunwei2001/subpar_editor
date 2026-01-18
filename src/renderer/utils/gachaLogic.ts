// Core gacha pull mechanics

import type {
  LootboxType,
  Rarity,
  EffectCategory,
  GachaPull,
  GachaEffect,
} from '@shared/gachaTypes';
import {
  RARITY_WEIGHTS,
  EFFECT_CATEGORY_WEIGHTS,
  META_CURSE_CONFIG,
} from '@shared/gachaConfig';
import {
  getPositiveEffect,
  getRandomBadge,
  getNegativeEffect,
} from './effectPools';

// Weighted random selection
function weightedRandom<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let random = Math.random() * total;

  for (const [key, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      return key;
    }
  }

  // Fallback to first entry
  return entries[0][0];
}

// Determine rarity based on lootbox type
function determineRarity(lootboxType: LootboxType): Rarity {
  return weightedRandom(RARITY_WEIGHTS[lootboxType]);
}

// Determine effect category (positive/neutral/negative)
function determineCategory(lootboxType: LootboxType, hasBadLuck: boolean): EffectCategory {
  const weights = { ...EFFECT_CATEGORY_WEIGHTS[lootboxType] };

  // Apply bad luck curse if active
  if (hasBadLuck) {
    weights.negative += META_CURSE_CONFIG.badLuck.negativeBoost;
    weights.positive -= META_CURSE_CONFIG.badLuck.negativeBoost;
  }

  return weightedRandom(weights);
}

// Select specific effect based on rarity and category
function selectEffect(rarity: Rarity, category: EffectCategory): GachaEffect {
  switch (category) {
    case 'positive':
      return getPositiveEffect(rarity);
    case 'neutral':
      return getRandomBadge();
    case 'negative':
      return getNegativeEffect(rarity);
  }
}

// Generate unique pull ID
function generatePullId(): string {
  return `pull-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Main pull function
export function performGachaPull(
  lootboxType: LootboxType,
  hasBadLuck: boolean = false
): GachaPull {
  // 1. Determine rarity
  const rarity = determineRarity(lootboxType);

  // 2. Determine category
  const category = determineCategory(lootboxType, hasBadLuck);

  // 3. Select effect
  const effect = selectEffect(rarity, category);

  // 4. Build pull result
  return {
    id: generatePullId(),
    timestamp: Date.now(),
    lootboxType,
    rarity,
    category,
    effect,
  };
}
