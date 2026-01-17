import { useGachaStore } from '../../store/gachaStore';
import type { LootboxType } from '@shared/gachaTypes';

interface LootboxCardProps {
  type: LootboxType;
  price: string;
  pulls: number;
  description: string;
  dropRates: string;
  badge?: string;
}

export function LootboxCard({
  type,
  price,
  pulls,
  description,
  dropRates,
  badge,
}: LootboxCardProps) {
  const { addLootbox, priceMultiplier } = useGachaStore();

  const displayPrice =
    priceMultiplier > 1
      ? `${price} (x${priceMultiplier} CURSE!)`
      : price;

  const getEmoji = () => {
    switch (type) {
      case 'basic':
        return '📦';
      case 'premium':
        return '🎁';
      case 'legendary':
        return '👑';
    }
  };

  const handlePurchase = () => {
    // In dev mode, just add the lootbox directly
    // Stripe integration will replace this
    addLootbox(type);
  };

  return (
    <div className={`lootbox-card ${type}`}>
      {badge && <div className="card-badge">{badge}</div>}

      <div className="card-emoji">{getEmoji()}</div>

      <h2 className="card-title">{type.toUpperCase()} Lootbox</h2>

      <div className="card-price">{displayPrice}</div>

      <p className="card-description">{description}</p>

      <div className="card-drops">
        <span className="drops-label">Drop Rates:</span>
        <span className="drops-rates">{dropRates}</span>
      </div>

      <button className="purchase-button" onClick={handlePurchase}>
        Buy Now
      </button>
    </div>
  );
}
