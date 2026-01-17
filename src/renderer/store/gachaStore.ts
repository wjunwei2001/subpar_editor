import { create } from 'zustand';
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
