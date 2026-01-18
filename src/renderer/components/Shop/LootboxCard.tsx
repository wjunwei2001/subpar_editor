import { useState } from 'react';
import { useGachaStore } from '../../store/gachaStore';
import type { LootboxType } from '@shared/gachaTypes';
import { Package, Gift, Crown, Check } from '../Icons';

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
  const [isPurchasing, setIsPurchasing] = useState(false);

  const displayPrice =
    priceMultiplier > 1
      ? `${price} (x${priceMultiplier} CURSE!)`
      : price;

  const renderIcon = () => {
    const iconProps = { size: 48, strokeWidth: 1.5 };
    switch (type) {
      case 'basic':
        return <Package {...iconProps} />;
      case 'premium':
        return <Gift {...iconProps} />;
      case 'legendary':
        return <Crown {...iconProps} />;
    }
  };

  const handlePurchase = () => {
    if (isPurchasing) return;

    // In dev mode, just add the lootbox directly
    // Stripe integration will replace this
    addLootbox(type);

    // Trigger success animation
    setIsPurchasing(true);
    setTimeout(() => {
      setIsPurchasing(false);
    }, 600);
  };

  return (
    <div className={`lootbox-card ${type}`}>
      {badge && <div className="card-badge">{badge}</div>}

      <div className="card-emoji">{renderIcon()}</div>

      <h2 className="card-title">{type.toUpperCase()} Lootbox</h2>

      <div className="card-price">{displayPrice}</div>

      <p className="card-description">{description}</p>

      <div className="card-drops">
        <span className="drops-label">Drop Rates:</span>
        <span className="drops-rates">{dropRates}</span>
      </div>

      <button
        className={`purchase-button ${isPurchasing ? 'success' : ''}`}
        onClick={handlePurchase}
        disabled={isPurchasing}
      >
        {isPurchasing ? (
          <><Check size={14} /> Purchased!</>
        ) : (
          'Buy Now'
        )}
      </button>
    </div>
  );
}
