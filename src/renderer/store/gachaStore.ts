import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  LootboxType,
  LootboxInventory,
  GachaPull,
  BadgeCollection,
  ActiveEffect,
  SponsorBadge,
  GachaFeature,
} from '@shared/gachaTypes';
import { performGachaPull } from '../utils/gachaLogic';
import { applyEffect, removeEffect } from '../utils/effectApplicator';
import { META_CURSE_CONFIG } from '@shared/gachaConfig';

interface GachaState {
  // Inventory
  inventory: LootboxInventory;

  // Pull history
  pullHistory: GachaPull[];

  // Badge collection
  badges: BadgeCollection;

  // Active effects (timer-based)
  activeEffects: ActiveEffect[];

  // Meta curse states
  priceMultiplier: number;
  priceMultiplierPullsRemaining: number;
  badLuckExpiresAt: number | null;
  hasImmunity: boolean;
  immunityExpiresAt: number | null;

  // Actions
  addLootbox: (type: LootboxType, amount?: number) => void;
  removeLootbox: (type: LootboxType) => void;
  getTotalLootboxes: () => number;

  // Gacha pull
  pull: (type: LootboxType) => GachaPull | null;

  // Effect management
  addActiveEffect: (effect: ActiveEffect) => void;
  removeActiveEffect: (id: string) => void;
  checkTimers: () => void;

  // Badge management
  addBadge: (badge: SponsorBadge) => void;
  getTotalBadges: () => number;

  // Meta curse actions
  applyPriceMultiplier: (multiplier: number, pulls: number) => void;
  applyBadLuck: (durationMs: number) => void;
  applyQuotaDrain: () => void;
  applyTimerReduction: () => void;
  setImmunity: (durationMs: number) => void;

  // Dev mode
  devAddLootboxes: (amount: number) => void;
  devClearAll: () => void;
}

export const useGachaStore = create<GachaState>()(
  persist(
    (set, get) => ({
      inventory: {
        basic: 0,
        premium: 0,
        legendary: 0,
      },

      pullHistory: [],

      badges: {
        virtu: 0,
        marshallWace: 0,
        ahrefs: 0,
        qrt: 0,
        squarePoint: 0,
        citadel: 0,
        optiver: 0,
      },

      activeEffects: [],

      priceMultiplier: 1,
      priceMultiplierPullsRemaining: 0,
      badLuckExpiresAt: null,
      hasImmunity: false,
      immunityExpiresAt: null,

      addLootbox: (type, amount = 1) =>
        set((state) => ({
          inventory: {
            ...state.inventory,
            [type]: state.inventory[type] + amount,
          },
        })),

      removeLootbox: (type) =>
        set((state) => ({
          inventory: {
            ...state.inventory,
            [type]: Math.max(0, state.inventory[type] - 1),
          },
        })),

      getTotalLootboxes: () => {
        const { inventory } = get();
        return inventory.basic + inventory.premium + inventory.legendary;
      },

      pull: (type: LootboxType) => {
        const state = get();

        // Check inventory
        if (state.inventory[type] <= 0) {
          return null;
        }

        // Check if price multiplier curse active
        if (state.priceMultiplierPullsRemaining > 0) {
          set((s) => ({
            priceMultiplierPullsRemaining: s.priceMultiplierPullsRemaining - 1,
            priceMultiplier: s.priceMultiplierPullsRemaining <= 1 ? 1 : s.priceMultiplier,
          }));
        }

        // Check for bad luck curse
        const hasBadLuck = state.badLuckExpiresAt && Date.now() < state.badLuckExpiresAt;

        // Perform the pull
        const pull = performGachaPull(type, hasBadLuck ? true : false);

        // Remove lootbox from inventory
        set((s) => ({
          inventory: {
            ...s.inventory,
            [type]: s.inventory[type] - 1,
          },
          pullHistory: [...s.pullHistory.slice(-99), pull], // Keep last 100 pulls
        }));

        // Check immunity before applying negative effects
        if (pull.category === 'negative' && state.hasImmunity) {
          // Immunity blocks negative effects - convert to neutral
          return {
            ...pull,
            category: 'neutral',
            effect: {
              type: 'badge',
              name: 'Immunity Block',
              description: 'Your immunity shield blocked a curse!',
              badge: 'citadel' as SponsorBadge,
            },
          } as GachaPull;
        }

        // Apply the effect
        applyEffect(pull, get, set);

        return pull;
      },

      addActiveEffect: (effect) =>
        set((state) => ({
          activeEffects: [...state.activeEffects, effect],
        })),

      removeActiveEffect: (id) => {
        const state = get();
        const effect = state.activeEffects.find((e) => e.id === id);

        if (effect) {
          // Revert the feature to neutral state
          removeEffect(effect);
        }

        set((s) => ({
          activeEffects: s.activeEffects.filter((e) => e.id !== id),
        }));
      },

      checkTimers: () => {
        const state = get();
        const now = Date.now();

        // Check active effects
        const expiredEffects = state.activeEffects.filter((e) => now >= e.expiresAt);
        for (const effect of expiredEffects) {
          get().removeActiveEffect(effect.id);
        }

        // Check immunity
        if (state.immunityExpiresAt && now >= state.immunityExpiresAt) {
          set({ hasImmunity: false, immunityExpiresAt: null });
        }

        // Check bad luck
        if (state.badLuckExpiresAt && now >= state.badLuckExpiresAt) {
          set({ badLuckExpiresAt: null });
        }
      },

      addBadge: (badge) =>
        set((state) => ({
          badges: {
            ...state.badges,
            [badge]: state.badges[badge] + 1,
          },
        })),

      getTotalBadges: () => {
        const { badges } = get();
        return Object.values(badges).reduce((sum, count) => sum + count, 0);
      },

      applyPriceMultiplier: (multiplier, pulls) =>
        set({
          priceMultiplier: multiplier,
          priceMultiplierPullsRemaining: pulls,
        }),

      applyBadLuck: (durationMs) =>
        set({
          badLuckExpiresAt: Date.now() + durationMs,
        }),

      applyQuotaDrain: () => {
        // This is handled in effectApplicator
      },

      applyTimerReduction: () => {
        const state = get();
        const multiplier = META_CURSE_CONFIG.timerReduction.multiplier;
        const now = Date.now();

        // Reduce all active timer-based effects
        const updatedEffects = state.activeEffects.map((effect) => {
          const remainingTime = effect.expiresAt - now;
          const newRemainingTime = remainingTime * multiplier;
          return {
            ...effect,
            expiresAt: now + newRemainingTime,
          };
        });

        set({ activeEffects: updatedEffects });
      },

      setImmunity: (durationMs) =>
        set({
          hasImmunity: true,
          immunityExpiresAt: Date.now() + durationMs,
        }),

      // Dev mode helpers
      devAddLootboxes: (amount) =>
        set((state) => ({
          inventory: {
            basic: state.inventory.basic + amount,
            premium: state.inventory.premium + amount,
            legendary: state.inventory.legendary + amount,
          },
        })),

      devClearAll: () =>
        set({
          inventory: { basic: 0, premium: 0, legendary: 0 },
          pullHistory: [],
          badges: {
            virtu: 0,
            marshallWace: 0,
            ahrefs: 0,
            qrt: 0,
            squarePoint: 0,
            citadel: 0,
            optiver: 0,
          },
          activeEffects: [],
          priceMultiplier: 1,
          priceMultiplierPullsRemaining: 0,
          badLuckExpiresAt: null,
          hasImmunity: false,
          immunityExpiresAt: null,
        }),
    }),
    {
      name: 'gacha-store',
      partialize: (state) => ({
        inventory: state.inventory,
        pullHistory: state.pullHistory,
        badges: state.badges,
        activeEffects: state.activeEffects,
        priceMultiplier: state.priceMultiplier,
        priceMultiplierPullsRemaining: state.priceMultiplierPullsRemaining,
        badLuckExpiresAt: state.badLuckExpiresAt,
        hasImmunity: state.hasImmunity,
        immunityExpiresAt: state.immunityExpiresAt,
      }),
    }
  )
);
import { GachaPull, LootboxType, performGachaPull, performDemoPull, Rarity, EffectType } from '@shared/gacha';

type AnimationPhase = 'idle' | 'anticipation' | 'opening' | 'reveal' | 'result';

interface GachaState {
  // Modal state
  isOpen: boolean;
  animationPhase: AnimationPhase;
  currentPull: GachaPull | null;

  // Inventory
  lootboxInventory: Record<LootboxType, number>;
  pullHistory: GachaPull[];

  // Actions
  openLootbox: () => void;
  closeLootbox: () => void;
  startPull: (lootboxType: LootboxType) => void;
  startDemoPull: (rarity?: Rarity, type?: EffectType) => void;
  setAnimationPhase: (phase: AnimationPhase) => void;
  claimReward: () => void;
  addLootbox: (type: LootboxType, count?: number) => void;
}

export const useGachaStore = create<GachaState>((set, get) => ({
  isOpen: false,
  animationPhase: 'idle',
  currentPull: null,

  lootboxInventory: {
    basic: 3, // Start with some demo lootboxes
    premium: 1,
    legendary: 0,
  },
  pullHistory: [],

  openLootbox: () => set({ isOpen: true, animationPhase: 'idle', currentPull: null }),

  closeLootbox: () => set({ isOpen: false, animationPhase: 'idle', currentPull: null }),

  startPull: (lootboxType: LootboxType) => {
    const { lootboxInventory } = get();
    if (lootboxInventory[lootboxType] <= 0) {
      return;
    }

    // Consume lootbox
    set((state) => ({
      lootboxInventory: {
        ...state.lootboxInventory,
        [lootboxType]: state.lootboxInventory[lootboxType] - 1,
      },
    }));

    // Perform the pull
    const pull = performGachaPull(lootboxType);

    set({
      currentPull: pull,
      animationPhase: 'anticipation',
    });
  },

  startDemoPull: (rarity?: Rarity, type?: EffectType) => {
    // Demo pull without consuming inventory
    const pull = performDemoPull(rarity, type);

    set({
      currentPull: pull,
      animationPhase: 'anticipation',
    });
  },

  setAnimationPhase: (phase: AnimationPhase) => set({ animationPhase: phase }),

  claimReward: () => {
    const { currentPull, pullHistory } = get();
    if (currentPull) {
      set({
        pullHistory: [...pullHistory, currentPull],
        animationPhase: 'idle',
        currentPull: null,
        isOpen: false,
      });
      // TODO: Apply the effect to the editor state
    }
  },

  addLootbox: (type: LootboxType, count = 1) => {
    set((state) => ({
      lootboxInventory: {
        ...state.lootboxInventory,
        [type]: state.lootboxInventory[type] + count,
      },
    }));
  },
}));
