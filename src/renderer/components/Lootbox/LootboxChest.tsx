import { motion } from 'framer-motion';
import { Rarity, RARITY_COLORS } from '@shared/gacha';
import { LootboxParticles } from './LootboxParticles';

interface LootboxChestProps {
  phase: 'anticipation' | 'opening' | 'reveal';
  rarity: Rarity;
}

export function LootboxChest({ phase, rarity }: LootboxChestProps) {
  const rarityColor = RARITY_COLORS[rarity];

  // Chest variant based on rarity
  const getChestClass = () => {
    if (rarity === 'legendary' || rarity === 'epic') return 'chest-legendary';
    if (rarity === 'rare' || rarity === 'uncommon') return 'chest-premium';
    return '';
  };

  return (
    <motion.div
      className="lootbox-chest-container"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ duration: 0.3 }}
      style={{ '--rarity-color': rarityColor } as React.CSSProperties}
    >
      {/* Glow behind chest */}
      <motion.div
        className="chest-glow"
        animate={{
          opacity: phase === 'anticipation' ? [0, 0.3, 0.5, 0.7] : phase === 'opening' ? 1 : 0,
          scale: phase === 'opening' ? 1.5 : 1,
        }}
        transition={{ duration: phase === 'anticipation' ? 1 : 0.3 }}
      />

      {/* Light rays (only visible during opening) */}
      {(phase === 'opening' || phase === 'reveal') && (
        <div className="light-rays-container">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="light-ray"
              style={{
                transform: `translateX(-50%) rotate(${i * 45}deg)`,
              }}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{
                opacity: [0, 1, 0.8],
                scaleY: [0, 1.5, 1.2],
              }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Particles */}
      <LootboxParticles phase={phase} rarity={rarity} />

      {/* Chest */}
      <motion.div
        className={`chest-wrapper ${getChestClass()}`}
        animate={
          phase === 'anticipation'
            ? {
                rotate: [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5, 0],
                scale: [1, 1.02, 1, 1.03, 1, 1.04, 1, 1.05, 1],
              }
            : {}
        }
        transition={{ duration: 1, ease: 'easeInOut' }}
      >
        {/* Lid */}
        <motion.div
          className="chest-lid"
          animate={
            phase === 'opening' || phase === 'reveal'
              ? { rotateX: -110 }
              : { rotateX: 0 }
          }
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 12,
          }}
        />

        {/* Base */}
        <div className="chest-base" />
      </motion.div>
    </motion.div>
  );
}
