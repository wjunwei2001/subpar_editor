import React, { useEffect, useRef } from 'react';

interface Drop {
  x: number;
  y: number;
  speed: number;
  char: string;
}

export const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    updateSize();

    const chars = ['0', '1'];
    const fontSize = 14;

    // Create drops
    const drops: Drop[] = [];
    const numDrops = 120;

    const createDrop = (startAtTop = false): Drop => ({
      x: Math.random() * canvas.width,
      y: startAtTop ? -fontSize : Math.random() * canvas.height,
      speed: Math.random() * 2 + 1,
      char: chars[Math.floor(Math.random() * chars.length)],
    });

    // Initialize drops scattered across the screen
    for (let i = 0; i < numDrops; i++) {
      drops.push(createDrop(false));
    }

    // Colors
    const primaryColor = { r: 124, g: 77, b: 255 }; // Purple
    const secondaryColor = { r: 32, g: 201, b: 151 }; // Teal

    let animationId: number;

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#14151a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px "Fira Code", "Consolas", monospace`;
      ctx.textAlign = 'center';

      drops.forEach((drop, i) => {
        // Color based on horizontal position
        const colorMix = drop.x / canvas.width;
        const r = Math.floor(primaryColor.r * (1 - colorMix) + secondaryColor.r * colorMix);
        const g = Math.floor(primaryColor.g * (1 - colorMix) + secondaryColor.g * colorMix);
        const b = Math.floor(primaryColor.b * (1 - colorMix) + secondaryColor.b * colorMix);

        // Vary opacity slightly
        const alpha = 0.3 + Math.random() * 0.4;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

        ctx.fillText(drop.char, drop.x, drop.y);

        // Move down
        drop.y += drop.speed;

        // Randomly change character
        if (Math.random() > 0.95) {
          drop.char = chars[Math.floor(Math.random() * chars.length)];
        }

        // Reset when off screen
        if (drop.y > canvas.height + fontSize) {
          drops[i] = createDrop(true);
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      updateSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};
