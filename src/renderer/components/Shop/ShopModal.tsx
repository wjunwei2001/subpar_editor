import { useGachaStore } from '../../store/gachaStore';
import { LootboxCard } from './LootboxCard';
import type { LootboxType } from '@shared/gachaTypes';
import '../../styles/gacha.css';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShopModal({ isOpen, onClose }: ShopModalProps) {
  const { inventory, devAddLootboxes, devClearAll, getTotalBadges, badges } = useGachaStore();

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
          <span className="inv-item">📦 {inventory.basic}</span>
          <span className="inv-item">🎁 {inventory.premium}</span>
          <span className="inv-item">👑 {inventory.legendary}</span>
          <span className="inv-item">🏷️ {getTotalBadges()} badges</span>
        </div>

        <div className="lootbox-cards">
          {lootboxConfigs.map((config) => (
            <LootboxCard key={config.type} {...config} />
          ))}
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
