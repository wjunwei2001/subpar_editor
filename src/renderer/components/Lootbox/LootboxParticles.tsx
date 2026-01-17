import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Rarity, RARITY_COLORS } from '@shared/gacha';

interface LootboxParticlesProps {
  phase: 'anticipation' | 'opening' | 'reveal';
  rarity: Rarity;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

export function LootboxParticles({ phase, rarity }: LootboxParticlesProps) {
  const rarityColor = RARITY_COLORS[rarity];

  // Generate particles
  const swirlParticles = useMemo<Particle[]>(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      angle: (i / 12) * 360,
      distance: 60 + Math.random() * 30,
      size: 4 + Math.random() * 4,
      delay: Math.random() * 0.5,
    }));
  }, []);

  const burstParticles = useMemo<Particle[]>(() => {
    return [...Array(16)].map((_, i) => ({
      id: i,
      angle: (i / 16) * 360 + Math.random() * 20,
      distance: 120 + Math.random() * 60,
      size: 3 + Math.random() * 5,
      delay: Math.random() * 0.2,
    }));
  }, []);

  return (
    <div
      className="particles-container"
      style={{ '--rarity-color': rarityColor } as React.CSSProperties}
    >
      {/* Swirling particles during anticipation */}
      {phase === 'anticipation' && swirlParticles.map((particle) => (
        <motion.div
          key={`swirl-${particle.id}`}
          className="particle"
          style={{
            width: particle.size,
            height: particle.size,
          }}
          initial={{
            x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
            y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
            opacity: 0,
          }}
          animate={{
            x: [
              Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
              Math.cos(((particle.angle + 180) * Math.PI) / 180) * (particle.distance * 0.8),
              Math.cos(((particle.angle + 360) * Math.PI) / 180) * (particle.distance * 0.6),
            ],
            y: [
              Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
              Math.sin(((particle.angle + 180) * Math.PI) / 180) * (particle.distance * 0.8),
              Math.sin(((particle.angle + 360) * Math.PI) / 180) * (particle.distance * 0.6),
            ],
            opacity: [0, 1, 1, 0.8],
            scale: [0.5, 1, 1.2, 0.8],
          }}
          transition={{
            duration: 1,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Burst particles during opening */}
      {(phase === 'opening' || phase === 'reveal') && burstParticles.map((particle) => (
        <motion.div
          key={`burst-${particle.id}`}
          className="particle particle-sparkle"
          style={{
            width: particle.size,
            height: particle.size,
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
            y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
            opacity: [1, 1, 0],
            scale: [0, 1.5, 0.5],
          }}
          transition={{
            duration: 0.8,
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}
