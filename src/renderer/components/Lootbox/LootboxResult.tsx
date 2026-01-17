import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GachaPull, RARITY_COLORS } from '@shared/gacha';

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
  const isPositive = pull.type === 'positive';
  const isLegendary = pull.rarity === 'legendary';

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

  // Icon based on effect type
  const getIcon = () => {
    if (isPositive) {
      switch (pull.feature) {
        case 'lsp': return '🧠';
        case 'git': return '📦';
        case 'autocomplete': return '⌨️';
        case 'editing': return '✏️';
        case 'theme': return '🎨';
        case 'color': return '👁️';
        case 'all': return '👑';
        case 'immunity': return '🛡️';
        case 'infinite': return '♾️';
        default: return '✨';
      }
    } else {
      switch (pull.feature) {
        case 'lsp': return '🐛';
        case 'visibility': return '👻';
        case 'textSize': return '🔍';
        case 'autocomplete': return '😈';
        case 'agents': return '📺';
        case 'theme': return '🌈';
        case 'editing': return '👹';
        case 'aspect': return '🎭';
        case 'git': return '💀';
        case 'quota': return '📉';
        case 'timer': return '⏰';
        case 'luck': return '🍀';
        case 'all': return '💥';
        default: return '💀';
      }
    }
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

      {/* Icon */}
      <motion.div
        className={`result-icon ${isPositive ? 'positive' : 'negative'}`}
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
        {pull.effect}
      </motion.div>

      {/* Description */}
      <motion.div
        className="result-description"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {pull.description}
        {pull.duration && (
          <div style={{ marginTop: 4, color: '#888' }}>
            Duration: {formatDuration(pull.duration)}
          </div>
        )}
        {pull.quota && (
          <div style={{ marginTop: 4, color: '#888' }}>
            Quota: {pull.quota}
          </div>
        )}
      </motion.div>

      {/* Type indicator */}
      <motion.div
        className={`result-type-indicator ${isPositive ? 'positive' : 'negative'}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.45 }}
      >
        {isPositive ? '✨ BLESSING' : '💀 CURSE'}
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
        {isPositive ? 'Claim Reward' : 'Accept Fate'}
      </motion.button>
    </motion.div>
  );
}
