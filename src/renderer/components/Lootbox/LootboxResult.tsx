import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { GachaPull, GachaEffect, EffectCategory, BadgeEffect } from '@shared/gachaTypes';
import { RARITY_COLORS, getBadgeLogoUrl, BADGE_DISPLAY_NAMES } from '@shared/gachaConfig';
import { LootboxModel } from './LootboxModel';

interface LootboxResultProps {
  pull: GachaPull;
  onClaim: () => void;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export function LootboxResult({ pull, onClaim }: LootboxResultProps) {
  const rarityColor = RARITY_COLORS[pull.rarity];
  const isPositive = pull.category === 'positive';
  const isNeutral = pull.category === 'neutral';
  const isNegative = pull.category === 'negative';
  const isLegendary = pull.rarity === 'legendary';
  const isBadge = pull.effect.type === 'badge';

  // Generate floating sparkles
  const sparkles = useMemo<Sparkle[]>(() => {
    const count = isLegendary ? 20 : pull.rarity === 'epic' ? 15 : 10;
    return [...Array(count)].map((_, i) => ({
      id: i,
      x: Math.random() * 300 - 150,
      y: Math.random() * 300 - 150,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
    }));
  }, [pull.rarity, isLegendary]);

  // Get icon based on effect - returns either emoji string or JSX for badge logo
  const getIcon = (): React.ReactNode => {
    const effect = pull.effect;

    if (effect.type === 'badge') {
      const badgeEffect = effect as BadgeEffect;
      const logoUrl = getBadgeLogoUrl(badgeEffect.badge);
      return (
        <img
          src={logoUrl}
          alt={BADGE_DISPLAY_NAMES[badgeEffect.badge]}
          style={{
            width: '64px',
            height: '64px',
            objectFit: 'contain',
            borderRadius: '8px',
            background: '#fff',
            padding: '4px',
          }}
        />
      );
    }

    if (effect.type === 'timer' || effect.type === 'quota') {
      const feature = effect.feature;
      switch (feature) {
        case 'lsp': return '🧠';
        case 'git': return '📦';
        case 'autocomplete': return '⌨️';
        case 'codeEditing': return '✏️';
        case 'themeMode': return '🎨';
        case 'codeColour': return '👁️';
        case 'agentsPanel': return '🤖';
        case 'textSize': return '🔤';
        case 'aspectRatio': return '📐';
        default: return '✨';
      }
    }

    if (effect.type === 'special') {
      switch (effect.effectId) {
        case 'godMode': return '👑';
        case 'immunityShield': return '🛡️';
        case 'infiniteQuota': return '♾️';
        default: return '✨';
      }
    }

    if (effect.type === 'curse') {
      const feature = effect.feature;
      switch (feature) {
        case 'lsp': return '🐛';
        case 'codeColour': return '👻';
        case 'textSize': return '🔍';
        case 'autocomplete': return '😈';
        case 'agentsPanel': return '📺';
        case 'themeMode': return '🌈';
        case 'codeEditing': return '👹';
        case 'aspectRatio': return '🎭';
        case 'git': return '💀';
        default: return '💀';
      }
    }

    if (effect.type === 'metaCurse') {
      switch (effect.curseId) {
        case 'lootboxAddict': return '🎰';
        case 'badLuck': return '🍀';
        case 'quotaDrain': return '📉';
        case 'timerReduction': return '⏰';
        default: return '💥';
      }
    }

    return isPositive ? '✨' : isNegative ? '💀' : '🏷️';
  };

  // Format duration for display
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  // Get effect details string
  const getEffectDetails = () => {
    const effect = pull.effect;

    switch (effect.type) {
      case 'timer':
        return `Duration: ${formatDuration(effect.durationMs)}`;
      case 'quota':
        return `+${effect.amount} tokens`;
      case 'special':
        return `Duration: ${formatDuration(effect.durationMs)}`;
      case 'badge':
        return 'Added to collection!';
      case 'curse':
        if (effect.durationMs) {
          return `Duration: ${formatDuration(effect.durationMs)}`;
        }
        return 'Applied immediately!';
      case 'metaCurse':
        if (effect.durationMs) {
          return `Duration: ${formatDuration(effect.durationMs)}`;
        }
        return 'Applied immediately!';
      default:
        return '';
    }
  };

  // Get category label
  const getCategoryLabel = (): string => {
    switch (pull.category) {
      case 'positive':
        return 'BLESSING';
      case 'neutral':
        return 'BADGE';
      case 'negative':
        return 'CURSE';
    }
  };

  // Get category emoji
  const getCategoryIcon = (): string => {
    switch (pull.category) {
      case 'positive':
        return '✨';
      case 'neutral':
        return '🏆';
      case 'negative':
        return '💀';
    }
  };

  return (
    <motion.div
      className={`lootbox-result ${isLegendary ? 'result-legendary' : ''}`}
      style={{ '--rarity-color': rarityColor } as React.CSSProperties}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {/* Floating sparkles */}
      <div className="result-sparkles">
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="sparkle"
            style={{
              left: '50%',
              top: '50%',
            }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: [0, sparkle.x * 0.5, sparkle.x],
              y: [0, sparkle.y * 0.5, sparkle.y],
              scale: [0, 1, 0.5],
            }}
            transition={{
              duration: sparkle.duration,
              delay: sparkle.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Glow behind result */}
      <div className="result-glow" />

      {/* 3D Model - gold for badges/epic/legendary, silver for others */}
      <LootboxModel category={pull.category} isBadge={isBadge} rarity={pull.rarity} />

      {/* Icon */}
      <motion.div
        className={`result-icon ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}
        initial={{ scale: 0.5, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
      >
        {getIcon()}
      </motion.div>

      {/* Rarity badge */}
      <motion.div
        className="result-rarity-badge"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
      >
        {pull.rarity.toUpperCase()}
      </motion.div>

      {/* Effect name */}
      <motion.div
        className="result-effect-name"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {pull.effect.name}
      </motion.div>

      {/* Description */}
      <motion.div
        className="result-description"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {pull.effect.description}
        <div style={{ marginTop: 4, color: '#888' }}>
          {getEffectDetails()}
        </div>
      </motion.div>

      {/* Type indicator */}
      <motion.div
        className={`result-type-indicator ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.45 }}
      >
        {getCategoryIcon()} {getCategoryLabel()}
      </motion.div>

      {/* Claim button */}
      <motion.button
        className="result-claim-btn"
        onClick={onClaim}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPositive ? 'Claim Reward' : isNegative ? 'Accept Fate' : 'Collect Badge'}
      </motion.button>
    </motion.div>
  );
}
