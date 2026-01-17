// Gacha System Type Definitions

export type LootboxType = 'basic' | 'premium' | 'legendary';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type EffectCategory = 'positive' | 'neutral' | 'negative';

// Features that can be affected by gacha
export type GachaFeature =
  | 'lsp'
  | 'autocomplete'
  | 'agentsPanel'
  | 'codeColour'
  | 'themeMode'
  | 'codeEditing'
  | 'aspectRatio'
  | 'git'
  | 'textSize';

// Sponsor badges for neutral pulls
export type SponsorBadge =
  | 'virtu'
  | 'marshallWace'
  | 'ahrefs'
  | 'qrt'
  | 'squarePoint'
  | 'citadel'
  | 'optiver';

// A single gacha pull result
export interface GachaPull {
  id: string;
  timestamp: number;
  lootboxType: LootboxType;
  rarity: Rarity;
  category: EffectCategory;
  effect: GachaEffect;
}

// Base effect interface
export interface BaseEffect {
  name: string;
  description: string;
}

// Timer-based positive effect
export interface TimerEffect extends BaseEffect {
  type: 'timer';
  feature: GachaFeature;
  durationMs: number;
}

// Quota-based positive effect
export interface QuotaEffect extends BaseEffect {
  type: 'quota';
  feature: GachaFeature;
  amount: number;
}

// Special positive effects
export interface SpecialEffect extends BaseEffect {
  type: 'special';
  effectId: 'godMode' | 'immunityShield' | 'infiniteQuota';
  durationMs: number;
  feature?: GachaFeature; // For infiniteQuota
}

// Neutral badge effect
export interface BadgeEffect extends BaseEffect {
  type: 'badge';
  badge: SponsorBadge;
}

// Curse (negative) effect
export interface CurseEffect extends BaseEffect {
  type: 'curse';
  curseId: string;
  feature?: GachaFeature;
  durationMs?: number;
}

// Meta curse effect (affects gacha system itself)
export interface MetaCurseEffect extends BaseEffect {
  type: 'metaCurse';
  curseId: 'lootboxAddict' | 'badLuck' | 'quotaDrain' | 'timerReduction';
  durationMs?: number;
  multiplier?: number;
}

export type PositiveEffect = TimerEffect | QuotaEffect | SpecialEffect;
export type NegativeEffect = CurseEffect | MetaCurseEffect;
export type GachaEffect = PositiveEffect | BadgeEffect | NegativeEffect;

// Active effect tracking (for timer-based effects)
export interface ActiveEffect {
  id: string;
  pullId: string;
  feature: GachaFeature | 'immunity' | 'godMode';
  type: 'positive' | 'negative';
  expiresAt: number;
  originalState?: string; // To restore after negative expires
}

// Badge collection
export interface BadgeCollection {
  virtu: number;
  marshallWace: number;
  ahrefs: number;
  qrt: number;
  squarePoint: number;
  citadel: number;
  optiver: number;
}

// Lootbox inventory
export interface LootboxInventory {
  basic: number;
  premium: number;
  legendary: number;
}
