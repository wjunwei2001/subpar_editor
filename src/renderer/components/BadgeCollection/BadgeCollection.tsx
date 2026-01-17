import { useGachaStore } from '../../store/gachaStore';
import type { SponsorBadge, BadgeCollection as BadgeCollectionType } from '@shared/gachaTypes';
import { BADGE_DISPLAY_NAMES, getBadgeLogoUrl } from '@shared/gachaConfig';
import './BadgeCollection.css';

const ALL_BADGES: SponsorBadge[] = [
  'virtu',
  'marshallWace',
  'ahrefs',
  'qrt',
  'squarePoint',
  'citadel',
  'optiver',
];

interface BadgeCardProps {
  badge: SponsorBadge;
  count: number;
}

function BadgeCard({ badge, count }: BadgeCardProps) {
  const isCollected = count > 0;
  const logoUrl = getBadgeLogoUrl(badge);

  return (
    <div className={`badge-card ${isCollected ? 'collected' : 'locked'}`}>
      <div className="badge-logo-container">
        {isCollected ? (
          <img
            src={logoUrl}
            alt={BADGE_DISPLAY_NAMES[badge]}
            className="badge-logo"
            onError={(e) => {
              // Fallback if logo fails to load
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : (
          <div className="badge-logo-locked">?</div>
        )}
        <div className="badge-logo-fallback hidden">{BADGE_DISPLAY_NAMES[badge][0]}</div>
      </div>
      <div className="badge-info">
        <div className="badge-name">
          {isCollected ? BADGE_DISPLAY_NAMES[badge] : '???'}
        </div>
        {isCollected && count > 1 && (
          <div className="badge-count">x{count}</div>
        )}
      </div>
      {!isCollected && (
        <div className="badge-locked-overlay">
          <span className="lock-icon">🔒</span>
        </div>
      )}
    </div>
  );
}

export function BadgeCollection() {
  const { badges, getTotalBadges } = useGachaStore();
  const totalCollected = ALL_BADGES.filter((b) => badges[b] > 0).length;

  return (
    <div className="badge-collection">
      <div className="badge-collection-header">
        <h3>Sponsor Badge Collection</h3>
        <div className="badge-progress">
          {totalCollected} / {ALL_BADGES.length} collected
        </div>
      </div>

      <div className="badge-grid">
        {ALL_BADGES.map((badge) => (
          <BadgeCard key={badge} badge={badge} count={badges[badge]} />
        ))}
      </div>

      {getTotalBadges() > 0 && (
        <div className="badge-total">
          Total badges earned: {getTotalBadges()}
        </div>
      )}
    </div>
  );
}
