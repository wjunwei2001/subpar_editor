import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGachaStore } from '../../store/gachaStore';
import { LootboxChest } from './LootboxChest';
import { LootboxResult } from './LootboxResult';
import type { LootboxType } from '@shared/gachaTypes';
import './LootboxModal.css';

export function LootboxModal() {
  const {
    isOpen,
    animationPhase,
    currentPull,
    inventory,
    setAnimationPhase,
    closeLootbox,
    startPull,
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

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(() => {
    if (animationPhase === 'idle') {
      closeLootbox();
    } else if (animationPhase === 'result') {
      claimReward();
    }
  }, [animationPhase, closeLootbox, claimReward]);

  const handlePull = useCallback((type: LootboxType) => {
    if (inventory[type] > 0) {
      startPull(type);
    }
  }, [inventory, startPull]);

  const isLegendary = currentPull?.rarity === 'legendary';
  const showScreenFlash = animationPhase === 'opening' && isLegendary;

  if (!isOpen) return null;

  const totalLootboxes = inventory.basic + inventory.premium + inventory.legendary;

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
            {animationPhase === 'idle' ? 'LOOTBOX' : ''}
          </h2>

          {animationPhase === 'idle' && (
            <div className="lootbox-selector">
              <p className="lootbox-subtitle">Select a lootbox to open</p>

              <div className="lootbox-options">
                <button
                  className={`lootbox-option basic ${inventory.basic <= 0 ? 'empty' : ''}`}
                  onClick={() => handlePull('basic')}
                  disabled={inventory.basic <= 0}
                >
                  <div className="lootbox-emoji">📦</div>
                  <div className="lootbox-label">Basic</div>
                  <div className="lootbox-count">{inventory.basic} available</div>
                </button>

                <button
                  className={`lootbox-option premium ${inventory.premium <= 0 ? 'empty' : ''}`}
                  onClick={() => handlePull('premium')}
                  disabled={inventory.premium <= 0}
                >
                  <div className="lootbox-emoji">🎁</div>
                  <div className="lootbox-label">Premium</div>
                  <div className="lootbox-count">{inventory.premium} available</div>
                </button>

                <button
                  className={`lootbox-option legendary ${inventory.legendary <= 0 ? 'empty' : ''}`}
                  onClick={() => handlePull('legendary')}
                  disabled={inventory.legendary <= 0}
                >
                  <div className="lootbox-emoji">👑</div>
                  <div className="lootbox-label">Legendary</div>
                  <div className="lootbox-count">{inventory.legendary} available</div>
                </button>
              </div>

              {totalLootboxes === 0 && (
                <p className="no-lootboxes">No lootboxes! Visit the Shop to get more.</p>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            {(animationPhase === 'anticipation' || animationPhase === 'opening' || animationPhase === 'reveal') && (
              <LootboxChest
                key="chest"
                phase={animationPhase}
                rarity={currentPull?.rarity || 'common'}
                lootboxType={currentPull?.lootboxType || 'basic'}
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
