// Effect applicator - applies gacha pull effects to feature stores

import type {
  GachaPull,
  GachaEffect,
  ActiveEffect,
  TimerEffect,
  QuotaEffect,
  SpecialEffect,
  BadgeEffect,
  CurseEffect,
  MetaCurseEffect,
  GachaFeature,
} from '@shared/gachaTypes';
import { useEditorStore } from '../store/editorStore';
import { useAgentStore } from '../store/agentStore';
import { META_CURSE_CONFIG, SPECIAL_EFFECT_DURATIONS } from '@shared/gachaConfig';

// Helper to generate effect ID
function generateEffectId(): string {
  return `effect-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Apply a timer-based effect
function applyTimerEffect(
  effect: TimerEffect,
  pullId: string,
  addActiveEffect: (effect: ActiveEffect) => void
): void {
  const { feature, durationMs } = effect;
  const expiresAt = Date.now() + durationMs;

  // Create active effect tracker
  const activeEffect: ActiveEffect = {
    id: generateEffectId(),
    pullId,
    feature,
    type: 'positive',
    expiresAt,
  };

  // Apply to appropriate store
  switch (feature) {
    case 'lsp':
      useEditorStore.getState().setLspMode('lsp');
      break;
    case 'themeMode':
      useEditorStore.getState().setColorMode('positive');
      break;
    case 'codeColour':
      useEditorStore.getState().setColorMode('positive');
      break;
    case 'aspectRatio':
      useEditorStore.getState().setAspectRatioMode('positive');
      break;
    case 'git':
      useEditorStore.getState().setGitMode('positive');
      break;
    default:
      break;
  }

  addActiveEffect(activeEffect);
}

// Apply a quota-based effect
function applyQuotaEffect(effect: QuotaEffect): void {
  const { feature, amount } = effect;

  switch (feature) {
    case 'autocomplete':
      const currentAC = useEditorStore.getState().autocompleteQuota;
      useEditorStore.getState().setAutocompleteQuota(currentAC + amount);
      useEditorStore.getState().setAutocompleteMode('positive');
      break;
    case 'codeEditing':
      const currentEdit = useEditorStore.getState().codeEditingQuota;
      useEditorStore.getState().setCodeEditingQuota(currentEdit + amount);
      useEditorStore.getState().setCodeEditingMode('positive');
      break;
    case 'agentsPanel':
      useAgentStore.getState().addQuota(amount);
      break;
    case 'textSize':
      // Text size adjustments - not yet fully implemented
      break;
    default:
      break;
  }
}

// Apply a special effect (legendary effects)
function applySpecialEffect(
  effect: SpecialEffect,
  pullId: string,
  addActiveEffect: (effect: ActiveEffect) => void,
  setImmunity: (durationMs: number) => void
): void {
  const { effectId, durationMs, feature } = effect;
  const expiresAt = Date.now() + durationMs;

  switch (effectId) {
    case 'godMode':
      // Enable all features in positive state
      useEditorStore.getState().setLspMode('lsp');
      useEditorStore.getState().setAutocompleteMode('positive');
      useEditorStore.getState().setAutocompleteQuota(99999);
      useEditorStore.getState().setCodeEditingMode('positive');
      useEditorStore.getState().setCodeEditingQuota(99999);
      useEditorStore.getState().setColorMode('positive');
      useEditorStore.getState().setCodeVisibilityMode('visible');
      useEditorStore.getState().setAspectRatioMode('positive');
      useEditorStore.getState().setGitMode('positive');
      useAgentStore.getState().setState('positive');
      useAgentStore.getState().setQuota(99999);

      addActiveEffect({
        id: generateEffectId(),
        pullId,
        feature: 'godMode',
        type: 'positive',
        expiresAt,
      });
      break;

    case 'immunityShield':
      setImmunity(durationMs);
      addActiveEffect({
        id: generateEffectId(),
        pullId,
        feature: 'immunity',
        type: 'positive',
        expiresAt,
      });
      break;

    case 'infiniteQuota':
      if (feature === 'autocomplete') {
        useEditorStore.getState().setAutocompleteQuota(99999);
        useEditorStore.getState().setAutocompleteMode('positive');
      } else if (feature === 'agentsPanel') {
        useAgentStore.getState().setQuota(99999);
        useAgentStore.getState().setState('positive');
      }

      addActiveEffect({
        id: generateEffectId(),
        pullId,
        feature: feature || 'autocomplete',
        type: 'positive',
        expiresAt,
      });
      break;
  }
}

// Apply a badge effect
function applyBadgeEffect(
  effect: BadgeEffect,
  addBadge: (badge: any) => void,
  setCursorBadge: (badge: any) => void
): void {
  addBadge(effect.badge);
  // Auto-set the most recent badge as cursor
  setCursorBadge(effect.badge);
}

// Apply a curse effect
function applyCurseEffect(
  effect: CurseEffect,
  pullId: string,
  addActiveEffect: (effect: ActiveEffect) => void
): void {
  const { curseId, feature, durationMs } = effect;

  if (!feature || !durationMs) return;

  const expiresAt = Date.now() + durationMs;

  // Create active effect tracker
  const activeEffect: ActiveEffect = {
    id: generateEffectId(),
    pullId,
    feature,
    type: 'negative',
    expiresAt,
  };

  // Apply negative state to feature
  switch (feature) {
    case 'lsp':
      useEditorStore.getState().setLspMode('random');
      break;
    case 'autocomplete':
      useEditorStore.getState().setAutocompleteMode('negative');
      break;
    case 'agentsPanel':
      useAgentStore.getState().setNegativeTimer(durationMs);
      break;
    case 'codeColour':
      useEditorStore.getState().setCodeVisibilityMode('invisible');
      break;
    case 'codeEditing':
      useEditorStore.getState().setCodeEditingMode('negative');
      break;
    case 'textSize':
      useEditorStore.getState().setTextSizeMode('negative');
      break;
    case 'aspectRatio':
      useEditorStore.getState().setAspectRatioMode('negative');
      break;
    case 'git':
      useEditorStore.getState().setGitMode('negative');
      break;
  }

  addActiveEffect(activeEffect);
}

// Apply a meta curse effect
function applyMetaCurseEffect(
  effect: MetaCurseEffect,
  applyPriceMultiplier: (multiplier: number, pulls: number) => void,
  applyBadLuck: (durationMs: number) => void,
  applyTimerReduction: () => void
): void {
  const { curseId, durationMs, multiplier } = effect;

  switch (curseId) {
    case 'lootboxAddict':
      applyPriceMultiplier(
        META_CURSE_CONFIG.lootboxAddict.priceMultiplier,
        META_CURSE_CONFIG.lootboxAddict.pullsAffected
      );
      break;

    case 'badLuck':
      if (durationMs) {
        applyBadLuck(durationMs);
      }
      break;

    case 'quotaDrain':
      // Halve all quotas
      const editorState = useEditorStore.getState();
      editorState.setAutocompleteQuota(Math.floor(editorState.autocompleteQuota * 0.5));
      editorState.setCodeEditingQuota(Math.floor(editorState.codeEditingQuota * 0.5));

      const agentState = useAgentStore.getState();
      agentState.setQuota(Math.floor(agentState.quota * 0.5));
      break;

    case 'timerReduction':
      applyTimerReduction();
      break;
  }
}

// Main apply effect function
export function applyEffect(
  pull: GachaPull,
  getState: () => any,
  setState: (fn: any) => void
): void {
  const effect = pull.effect;

  // Get store actions
  const addActiveEffect = (e: ActiveEffect) => {
    setState((state: any) => ({
      activeEffects: [...state.activeEffects, e],
    }));
  };

  const addBadge = (badge: any) => {
    setState((state: any) => ({
      badges: {
        ...state.badges,
        [badge]: state.badges[badge] + 1,
      },
    }));
  };

  const setCursorBadge = (badge: any) => {
    setState({ cursorBadge: badge });
  };

  const setImmunity = (durationMs: number) => {
    setState({
      hasImmunity: true,
      immunityExpiresAt: Date.now() + durationMs,
    });
  };

  const applyPriceMultiplier = (multiplier: number, pulls: number) => {
    setState({
      priceMultiplier: multiplier,
      priceMultiplierPullsRemaining: pulls,
    });
  };

  const applyBadLuck = (durationMs: number) => {
    setState({
      badLuckExpiresAt: Date.now() + durationMs,
    });
  };

  const applyTimerReduction = () => {
    const state = getState();
    const now = Date.now();
    const multiplier = META_CURSE_CONFIG.timerReduction.multiplier;

    const updatedEffects = state.activeEffects.map((e: ActiveEffect) => {
      const remainingTime = e.expiresAt - now;
      const newRemainingTime = remainingTime * multiplier;
      return {
        ...e,
        expiresAt: now + newRemainingTime,
      };
    });

    setState({ activeEffects: updatedEffects });
  };

  // Apply based on effect type
  switch (effect.type) {
    case 'timer':
      applyTimerEffect(effect as TimerEffect, pull.id, addActiveEffect);
      break;
    case 'quota':
      applyQuotaEffect(effect as QuotaEffect);
      break;
    case 'special':
      applySpecialEffect(effect as SpecialEffect, pull.id, addActiveEffect, setImmunity);
      break;
    case 'badge':
      applyBadgeEffect(effect as BadgeEffect, addBadge, setCursorBadge);
      break;
    case 'curse':
      applyCurseEffect(effect as CurseEffect, pull.id, addActiveEffect);
      break;
    case 'metaCurse':
      applyMetaCurseEffect(
        effect as MetaCurseEffect,
        applyPriceMultiplier,
        applyBadLuck,
        applyTimerReduction
      );
      break;
  }
}

// Remove an effect (revert to neutral)
export function removeEffect(effect: ActiveEffect): void {
  const feature = effect.feature;

  // Only revert if it was a negative effect or timer-based positive
  if (effect.type === 'negative') {
    // Revert to neutral
    switch (feature) {
      case 'lsp':
        useEditorStore.getState().setLspMode('off');
        break;
      case 'autocomplete':
        useEditorStore.getState().setAutocompleteMode('neutral');
        break;
      case 'agentsPanel':
        useAgentStore.getState().setState('neutral');
        break;
      case 'codeColour':
        useEditorStore.getState().setCodeVisibilityMode('visible');
        useEditorStore.getState().setColorMode('neutral');
        break;
      case 'codeEditing':
        useEditorStore.getState().setCodeEditingMode('neutral');
        break;
      case 'textSize':
        useEditorStore.getState().setTextSizeMode('neutral');
        break;
      case 'aspectRatio':
        useEditorStore.getState().setAspectRatioMode('neutral');
        break;
      case 'git':
        useEditorStore.getState().setGitMode('neutral');
        break;
    }
  } else if (effect.type === 'positive') {
    // Timer expired, revert to neutral
    switch (feature) {
      case 'lsp':
        useEditorStore.getState().setLspMode('off');
        break;
      case 'themeMode':
      case 'codeColour':
        useEditorStore.getState().setColorMode('neutral');
        break;
      case 'godMode':
        // Revert all features to neutral
        useEditorStore.getState().setLspMode('off');
        useEditorStore.getState().setAutocompleteMode('neutral');
        useEditorStore.getState().setCodeEditingMode('neutral');
        useEditorStore.getState().setColorMode('neutral');
        useEditorStore.getState().setAspectRatioMode('neutral');
        useEditorStore.getState().setGitMode('neutral');
        useAgentStore.getState().setState('neutral');
        break;
      case 'immunity':
        // Just remove the immunity flag
        break;
      case 'autocomplete':
        // Don't revert quota - just let it be
        break;
      case 'agentsPanel':
        // Don't revert quota
        break;
      case 'aspectRatio':
        useEditorStore.getState().setAspectRatioMode('neutral');
        break;
      case 'git':
        useEditorStore.getState().setGitMode('neutral');
        break;
    }
  }
}
