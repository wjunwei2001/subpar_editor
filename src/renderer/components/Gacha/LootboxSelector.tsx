import type { LootboxType, LootboxInventory } from '@shared/gachaTypes';

interface LootboxSelectorProps {
  onPull: (type: LootboxType) => void;
  inventory: LootboxInventory;
}

export function LootboxSelector({ onPull, inventory }: LootboxSelectorProps) {
  const lootboxes: { type: LootboxType; emoji: string; label: string }[] = [
    { type: 'basic', emoji: '📦', label: 'Basic' },
    { type: 'premium', emoji: '🎁', label: 'Premium' },
    { type: 'legendary', emoji: '👑', label: 'Legendary' },
  ];

  return (
    <div className="lootbox-selector">
      <p className="selector-subtitle">Select a lootbox to open</p>

      <div className="lootbox-grid">
        {lootboxes.map(({ type, emoji, label }) => (
          <button
            key={type}
            className={`lootbox-option ${type} ${inventory[type] <= 0 ? 'empty' : ''}`}
            onClick={() => onPull(type)}
            disabled={inventory[type] <= 0}
          >
            <div className="lootbox-emoji">{emoji}</div>
            <div className="lootbox-label">{label}</div>
            <div className="lootbox-count">{inventory[type]} available</div>
          </button>
        ))}
      </div>

      {inventory.basic + inventory.premium + inventory.legendary === 0 && (
        <p className="no-lootboxes">No lootboxes! Visit the Shop to get more.</p>
      )}
    </div>
  );
}
