import { useState } from 'react';
import { useGachaStore } from '../../store/gachaStore';
import { LootboxSelector } from './LootboxSelector';
import { PullAnimation } from './PullAnimation';
import { GachaResult } from './GachaResult';
import type { LootboxType, GachaPull } from '@shared/gachaTypes';
import '../../styles/gacha.css';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalState = 'select' | 'pulling' | 'result';

export function GachaModal({ isOpen, onClose }: GachaModalProps) {
  const [modalState, setModalState] = useState<ModalState>('select');
  const [currentPull, setCurrentPull] = useState<GachaPull | null>(null);
  const { inventory, pull } = useGachaStore();

  if (!isOpen) return null;

  const handlePull = async (type: LootboxType) => {
    if (inventory[type] <= 0) return;

    setModalState('pulling');

    // Animation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = pull(type);
    setCurrentPull(result);
    setModalState('result');
  };

  const handleContinue = () => {
    setCurrentPull(null);
    setModalState('select');
  };

  const handleClose = () => {
    setCurrentPull(null);
    setModalState('select');
    onClose();
  };

  return (
    <div className="gacha-modal-overlay" onClick={handleClose}>
      <div className="gacha-modal" onClick={(e) => e.stopPropagation()}>
        <button className="gacha-modal-close" onClick={handleClose}>
          x
        </button>

        <div className="gacha-modal-header">
          <h2>GACHA</h2>
        </div>

        <div className="gacha-modal-content">
          {modalState === 'select' && (
            <LootboxSelector onPull={handlePull} inventory={inventory} />
          )}

          {modalState === 'pulling' && <PullAnimation />}

          {modalState === 'result' && currentPull && (
            <GachaResult pull={currentPull} onContinue={handleContinue} />
          )}
        </div>
      </div>
    </div>
  );
}
