import React, { Suspense, useState, useEffect, Component } from 'react';
import { motion } from 'framer-motion';
import type { EffectCategory, Rarity } from '@shared/gachaTypes';
import { Sparkles, Skull, Tag } from '../Icons';

interface LootboxModelProps {
  category: EffectCategory;
  isBadge?: boolean;
  rarity?: Rarity;
}

// Global counter for unique keys across component instances
let instanceCounter = 0;

// Model colors based on category
const CATEGORY_COLORS: Record<EffectCategory, string> = {
  positive: '#22c55e',
  neutral: '#8b5cf6',
  negative: '#ef4444',
};

// Loading placeholder
function LoadingPlaceholder() {
  return (
    <div
      style={{
        width: '280px',
        height: '280px',
        margin: '0 auto 16px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #333',
        borderTop: '3px solid #888',
        borderRadius: '50%',
        animation: 'lootbox-spin 1s linear infinite',
      }} />
    </div>
  );
}

// Error/Fallback display with icon
function FallbackDisplay({ category }: { category: EffectCategory }) {
  const color = CATEGORY_COLORS[category];

  const renderIcon = () => {
    const iconProps = { size: 100, strokeWidth: 1 };
    switch (category) {
      case 'positive':
        return <Sparkles {...iconProps} />;
      case 'negative':
        return <Skull {...iconProps} />;
      default:
        return <Tag {...iconProps} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        width: '280px',
        height: '280px',
        margin: '0 auto 16px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color,
        filter: `drop-shadow(0 0 20px ${color})`,
      }}
    >
      {renderIcon()}
    </motion.div>
  );
}

// Error boundary
class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('LootboxModel 3D error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Lazy-loaded 3D scene
const Lootbox3DScene = React.lazy(() => import('./Lootbox3DScene'));

export function LootboxModel({ category, isBadge, rarity }: LootboxModelProps) {
  const [canRender3D, setCanRender3D] = useState(false);
  const [checkComplete, setCheckComplete] = useState(false);
  // Generate a unique instance ID on mount to force fresh Canvas each time
  const [instanceId] = useState(() => ++instanceCounter);

  // Determine model based on category and rarity
  // - Negative/Curse: bad model (red)
  // - Badges: good model (gold)
  // - Epic/Legendary rarity: good model (gold)
  // - Common/Uncommon/Rare: neutral model (silver)
  const getEffectiveCategory = (): EffectCategory => {
    if (category === 'negative') return 'negative';
    if (isBadge) return 'positive';
    if (rarity === 'epic' || rarity === 'legendary') return 'positive';
    return 'neutral';
  };

  const effectiveCategory = getEffectiveCategory();

  useEffect(() => {
    // Check WebGL support
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        setCanRender3D(!!gl);
      } catch {
        setCanRender3D(false);
      }
      setCheckComplete(true);
    };

    // Small delay to ensure we're mounted
    const timer = setTimeout(checkWebGL, 50);
    return () => clearTimeout(timer);
  }, []);

  // Still checking
  if (!checkComplete) {
    return <LoadingPlaceholder />;
  }

  // WebGL not available, show fallback
  if (!canRender3D) {
    return <FallbackDisplay category={effectiveCategory} />;
  }

  return (
    <motion.div
      className="lootbox-3d-model"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        width: '280px',
        height: '280px',
        margin: '0 auto 16px auto',
      }}
    >
      <ErrorBoundary fallback={<FallbackDisplay category={effectiveCategory} />}>
        <Suspense fallback={<LoadingPlaceholder />}>
          {/* Key forces fresh Canvas mount on each lootbox pull */}
          <Lootbox3DScene key={`scene-${instanceId}`} category={effectiveCategory} />
        </Suspense>
      </ErrorBoundary>
      <style>{`
        @keyframes lootbox-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
