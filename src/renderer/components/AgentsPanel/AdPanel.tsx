import { useState, useEffect } from 'react';
import { Dices, Zap, Check } from '../Icons';

const AD_MESSAGES = [
  'Your code could be PERFECT with AI assistance!',
  'Tired of bugs? Get PREMIUM now!',
  'Limited time: 50% MORE tokens!',
  'Unlock the POWER of AI coding!',
  'Why struggle alone? BUY NOW!',
];

const FAKE_DEALS = [
  { name: 'MEGA PACK', originalPrice: 99.99, salePrice: 49.99, discount: 50 },
  { name: 'STARTER BUNDLE', originalPrice: 29.99, salePrice: 19.99, discount: 33 },
  { name: 'WHALE SUPREME', originalPrice: 199.99, salePrice: 149.99, discount: 25 },
];

export function AdPanel() {
  const [countdown, setCountdown] = useState(599); // 9:59
  const [currentAd, setCurrentAd] = useState(0);
  const [purchasingIndex, setPurchasingIndex] = useState<number | null>(null);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 599)); // Reset after 0
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate ad messages
  useEffect(() => {
    const adTimer = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % AD_MESSAGES.length);
    }, 3000);
    return () => clearInterval(adTimer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePurchase = (index: number) => {
    if (purchasingIndex !== null) return;

    // Trigger success animation
    setPurchasingIndex(index);
    setTimeout(() => {
      setPurchasingIndex(null);
    }, 600);
  };

  const iconProps = { size: 18, strokeWidth: 2 };

  return (
    <div className="ad-panel">
      <div className="ad-countdown">
        <span className="ad-countdown-label">OFFER EXPIRES IN:</span>
        <span className="ad-countdown-time">{formatTime(countdown)}</span>
      </div>

      <div className="ad-banner ad-banner-animated">
        <span className="ad-emoji"><Dices {...iconProps} /></span>
        <span className="ad-text">{AD_MESSAGES[currentAd]}</span>
        <span className="ad-emoji"><Dices {...iconProps} /></span>
      </div>

      <div className="ad-deals">
        {FAKE_DEALS.map((deal, index) => (
          <div key={index} className="ad-deal-card">
            <div className="ad-deal-badge">{deal.discount}% OFF!</div>
            <div className="ad-deal-name">{deal.name}</div>
            <div className="ad-deal-prices">
              <span className="ad-price-original">${deal.originalPrice}</span>
              <span className="ad-price-sale">${deal.salePrice}</span>
            </div>
            <button
              className={`ad-buy-button ${purchasingIndex === index ? 'success' : ''}`}
              onClick={() => handlePurchase(index)}
              disabled={purchasingIndex === index}
            >
              {purchasingIndex === index ? (
                <><Check size={14} /> Purchased!</>
              ) : (
                'BUY NOW!'
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="ad-footer">
        <span className="ad-flash">
          <Zap size={14} strokeWidth={2} /> FLASH SALE <Zap size={14} strokeWidth={2} />
        </span>
      </div>
    </div>
  );
}
