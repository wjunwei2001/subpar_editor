import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGachaStore } from '../../store/gachaStore';
import { LootboxChest } from './LootboxChest';
import { LootboxResult } from './LootboxResult';
import { Rarity, EffectType } from '@shared/gacha';
import './LootboxModal.css';

export function LootboxModal() {
  const {
    isOpen,
    animationPhase,
    currentPull,
    setAnimationPhase,
    closeLootbox,
    startDemoPull,
    claimReward,
  } = useGachaStore();

  // Progress through animation phases
  useEffect(() => {
    if (animationPhase === 'anticipation') {
      const timer = setTimeout(() => setAnimationPhase('opening'), 1000);
      return () => clearTimeout(timer);
    }
    if (animationPhase === 'opening') {
      const timer = setTimeout(() => setAnimationPhase('reveal'), 600);
      return () => clearTimeout(timer);
    }
    if (animationPhase === 'reveal') {
      const timer = setTimeout(() => setAnimationPhase('result'), 800);
      return () => clearTimeout(timer);
    }
  }, [animationPhase, setAnimationPhase]);

  const handleBackdropClick = useCallback(() => {
    if (animationPhase === 'idle') {
      closeLootbox();
    } else if (animationPhase === 'result') {
      claimReward();
    }
  }, [animationPhase, closeLootbox, claimReward]);

  const handleDemoPull = useCallback((rarity?: Rarity, type?: EffectType) => {
    startDemoPull(rarity, type);
  }, [startDemoPull]);

  const isLegendary = currentPull?.rarity === 'legendary';
  const showScreenFlash = animationPhase === 'opening' && isLegendary;

  if (!isOpen) return null;

  return (
    <div className="lootbox-overlay" onClick={handleBackdropClick}>
      <motion.div
        className="lootbox-modal"
        onClick={(e) => e.stopPropagation()}
        animate={animationPhase === 'opening' ? {
          x: [0, -5, 5, -5, 5, -3, 3, 0],
          y: [0, 3, -3, 3, -3, 2, -2, 0],
        } : {}}
        transition={{ duration: 0.4 }}
      >
        {/* Vignette effect */}
        <div className={`lootbox-vignette ${animationPhase !== 'idle' ? 'active' : ''}`} />

        {/* Screen flash for legendary */}
        <AnimatePresence>
          {showScreenFlash && (
            <motion.div
              className="lootbox-screen-flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        <div className="lootbox-content">
          <h2 className="lootbox-title">
            {animationPhase === 'idle' ? '🎰 LOOTBOX 🎰' : ''}
          </h2>

          {animationPhase === 'idle' && (
            <div className="lootbox-demo-buttons">
              <p className="lootbox-subtitle">Demo Mode - Test Any Rarity</p>
              <div className="rarity-buttons">
                <button className="rarity-btn rarity-common" onClick={() => handleDemoPull('common')}>
                  Common
                </button>
                <button className="rarity-btn rarity-uncommon" onClick={() => handleDemoPull('uncommon')}>
                  Uncommon
                </button>
                <button className="rarity-btn rarity-rare" onClick={() => handleDemoPull('rare')}>
                  Rare
                </button>
                <button className="rarity-btn rarity-epic" onClick={() => handleDemoPull('epic')}>
                  Epic
                </button>
                <button className="rarity-btn rarity-legendary" onClick={() => handleDemoPull('legendary')}>
                  Legendary
                </button>
              </div>
              <div className="type-buttons">
                <button className="type-btn type-positive" onClick={() => handleDemoPull(undefined, 'positive')}>
                  Random Positive
                </button>
                <button className="type-btn type-negative" onClick={() => handleDemoPull(undefined, 'negative')}>
                  Random Curse
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {(animationPhase === 'anticipation' || animationPhase === 'opening' || animationPhase === 'reveal') && (
              <LootboxChest
                key="chest"
                phase={animationPhase}
                rarity={currentPull?.rarity || 'common'}
              />
            )}

            {animationPhase === 'result' && currentPull && (
              <LootboxResult
                key="result"
                pull={currentPull}
                onClaim={claimReward}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
