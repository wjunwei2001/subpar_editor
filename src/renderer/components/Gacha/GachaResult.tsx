import type { GachaPull } from '@shared/gachaTypes';
import { RARITY_COLORS, RARITY_NAMES } from '@shared/gachaConfig';

interface GachaResultProps {
  pull: GachaPull;
  onContinue: () => void;
}

export function GachaResult({ pull, onContinue }: GachaResultProps) {
  const { rarity, category, effect } = pull;

  const getCategoryEmoji = () => {
    switch (category) {
      case 'positive':
        return '✨';
      case 'neutral':
        return '🏷️';
      case 'negative':
        return '💀';
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'positive':
        return 'BLESSING';
      case 'neutral':
        return 'BADGE';
      case 'negative':
        return 'CURSE';
    }
  };

  const getEffectDetails = () => {
    switch (effect.type) {
      case 'timer':
        const minutes = Math.floor(effect.durationMs / 60000);
        return `Duration: ${minutes} minutes`;
      case 'quota':
        return `+${effect.amount} tokens`;
      case 'special':
        const specialMinutes = Math.floor(effect.durationMs / 60000);
        return `Duration: ${specialMinutes} minutes`;
      case 'badge':
        return 'Added to collection!';
      case 'curse':
        if (effect.durationMs) {
          const curseMinutes = Math.floor(effect.durationMs / 60000);
          return `Duration: ${curseMinutes} minutes`;
        }
        return 'Applied immediately!';
      case 'metaCurse':
        if (effect.durationMs) {
          const metaMinutes = Math.floor(effect.durationMs / 60000);
          return `Duration: ${metaMinutes} minutes`;
        }
        return 'Applied immediately!';
    }
  };

  return (
    <div className="gacha-result">
      <div
        className={`result-card ${category}`}
        style={{ borderColor: RARITY_COLORS[rarity] }}
      >
        <div className="result-rarity" style={{ color: RARITY_COLORS[rarity] }}>
          {RARITY_NAMES[rarity]}
        </div>

        <div className="result-category">
          <span className="category-emoji">{getCategoryEmoji()}</span>
          <span className="category-label">{getCategoryLabel()}</span>
        </div>

        <div className="result-effect">
          <h3>{effect.name}</h3>
          <p className="effect-description">{effect.description}</p>
          <p className="effect-details">{getEffectDetails()}</p>
        </div>
      </div>

      <button className="continue-button" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}
