import { useEffect, useState } from 'react';
import { useGachaStore } from '../../store/gachaStore';
import { LootboxCard } from './LootboxCard';
import { BadgeCollection } from '../BadgeCollection';
import type { LootboxType } from '@shared/gachaTypes';
import { Package, Gift, Crown, Tag } from '../Icons';
import '../../styles/gacha.css';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShopModal({ isOpen, onClose }: ShopModalProps) {
  const { inventory, devAddLootboxes, devClearAll, getTotalBadges } = useGachaStore();
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const lootboxConfigs: {
    type: LootboxType;
    price: string;
    pulls: number;
    description: string;
    dropRates: string;
    badge?: string;
  }[] = [
    {
      type: 'basic',
      price: '$5',
      pulls: 1,
      description: '1 random pull',
      dropRates: '60% Common, 25% Uncommon, 10% Rare, 4% Epic, 1% Legendary',
    },
    {
      type: 'premium',
      price: '$15',
      pulls: 3,
      description: '3 random pulls with better rates!',
      dropRates: '40% Common, 35% Uncommon, 15% Rare, 8% Epic, 2% Legendary',
      badge: 'BEST VALUE',
    },
    {
      type: 'legendary',
      price: '$40',
      pulls: 10,
      description: '10 pulls with INSANE rates!',
      dropRates: '20% Common, 30% Uncommon, 25% Rare, 15% Epic, 10% Legendary',
      badge: 'WHALE TIER',
    },
  ];

  const iconProps = { size: 14, strokeWidth: 2 };

  return (
    <div className="shop-modal-overlay" onClick={onClose}>
      <div className="shop-modal" onClick={(e) => e.stopPropagation()}>
        <button className="shop-modal-close" onClick={onClose}>
          x
        </button>

        <div className="shop-header">
          <h1>LOOTBOX SHOP</h1>
          <p className="shop-subtitle">Unlock temporary IDE features!</p>
        </div>

        <div className="shop-inventory">
          <span>Your Inventory: </span>
          <span className="inv-item"><Package {...iconProps} /> {inventory.basic}</span>
          <span className="inv-item"><Gift {...iconProps} /> {inventory.premium}</span>
          <span className="inv-item"><Crown {...iconProps} /> {inventory.legendary}</span>
          <span className="inv-item"><Tag {...iconProps} /> {getTotalBadges()} badges</span>
        </div>

        <div className="lootbox-cards">
          {lootboxConfigs.map((config) => (
            <LootboxCard key={config.type} {...config} />
          ))}
        </div>

        {/* Badge Collection Section */}
        <div className="badge-collection-section">
          <button
            className="badge-toggle-btn"
            onClick={() => setShowBadges(!showBadges)}
          >
            <Tag {...iconProps} />
            Badge Collection ({getTotalBadges()})
            <span className="toggle-arrow">{showBadges ? '▼' : '▶'}</span>
          </button>
          {showBadges && <BadgeCollection />}
        </div>

        {/* Dev Mode Section */}
        <div className="dev-mode-section">
          <h3>Dev Mode</h3>
          <p className="dev-note">For testing (Stripe coming later)</p>
          <div className="dev-buttons">
            <button className="dev-button add" onClick={() => devAddLootboxes(5)}>
              +5 Each Lootbox
            </button>
            <button className="dev-button clear" onClick={devClearAll}>
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
