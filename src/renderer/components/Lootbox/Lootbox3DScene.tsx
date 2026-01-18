import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, PerspectiveCamera } from '@react-three/drei';
import type { EffectCategory } from '@shared/gachaTypes';
import * as THREE from 'three';

interface Lootbox3DSceneProps {
  category: EffectCategory;
}

// Map categories to model files
const MODEL_MAP: Record<EffectCategory, string> = {
  positive: '/models/good.glb',
  neutral: '/models/neutral.glb',
  negative: '/models/bad.glb',
};

// Model colors based on category - gold for good, silver for neutral, red for curse
const CATEGORY_COLORS: Record<EffectCategory, { material: string; light: string }> = {
  positive: { material: '#ffd700', light: '#ffb300' },  // Gold
  neutral: { material: '#c0c0c0', light: '#e8e8e8' },   // Silver
  negative: { material: '#dc2626', light: '#ef4444' },  // Red
};

// Component to force proper viewport sizing on mount
// This fixes the issue where Canvas renders at wrong size on subsequent mounts
function ViewportFixer() {
  const { gl, size, camera, invalidate } = useThree();

  useEffect(() => {
    // Force the renderer to use correct size
    gl.setSize(size.width, size.height);

    // Update camera aspect ratio if it's a PerspectiveCamera
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
    }

    // Force a re-render
    invalidate();

    // Also do it after a small delay to catch any timing issues
    const timer = setTimeout(() => {
      gl.setSize(size.width, size.height);
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
      }
      invalidate();
    }, 100);

    return () => clearTimeout(timer);
  }, [gl, size, camera, invalidate]);

  return null;
}

function Model({ category }: { category: EffectCategory }) {
  const modelPath = MODEL_MAP[category];
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const colors = CATEGORY_COLORS[category];

  // Clone the scene and apply category color
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // Apply category color to all meshes
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          // Clone and colorize material
          const mat = (mesh.material as THREE.Material).clone();
          if ('color' in mat) {
            (mat as THREE.MeshStandardMaterial).color = new THREE.Color(colors.material);
          }
          if ('metalness' in mat) {
            (mat as THREE.MeshStandardMaterial).metalness = 0.6;
          }
          if ('roughness' in mat) {
            (mat as THREE.MeshStandardMaterial).roughness = 0.3;
          }
          mesh.material = mat;
        }
      }
    });

    // Calculate bounds and scale
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0) {
      // Scale to fit nicely in the container
      const scale = 2.5 / maxDim;
      clone.scale.setScalar(scale);
    }

    return clone;
  }, [scene, colors.material]);

  // Gentle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={clonedScene} />
      </Center>
    </group>
  );
}

// Preload all models
useGLTF.preload('/models/good.glb');
useGLTF.preload('/models/neutral.glb');
useGLTF.preload('/models/bad.glb');

export default function Lootbox3DScene({ category }: Lootbox3DSceneProps) {
  const colors = CATEGORY_COLORS[category];

  console.log('[Lootbox3DScene] Rendering with category:', category, 'model:', MODEL_MAP[category]);

  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
      // Properly handle device pixel ratio (capped at 2 for performance)
      dpr={[1, 2]}
      // Disable resize debounce to fix sizing issues on remount
      resize={{ debounce: 0 }}
      // Continuous rendering
      frameloop="always"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl, size, camera }) => {
        gl.setClearColor(0x000000, 0);
        // Force correct size on creation
        gl.setSize(size.width, size.height);
        // Update camera if needed
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.aspect = size.width / size.height;
          camera.updateProjectionMatrix();
        }
      }}
    >
      {/* Viewport fixer ensures correct sizing on mount */}
      <ViewportFixer />

      {/* Use PerspectiveCamera from drei for automatic aspect ratio handling */}
      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />

      {/* Lighting setup - bright white lights to show model colors */}
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight position={[5, 5, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-3, -3, -3]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[0, 5, 0]} intensity={1} color="#ffffff" />
      {/* Colored accent light */}
      <pointLight position={[0, 0, 4]} intensity={0.8} color={colors.light} />

      <Model category={category} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 4}
      />
    </Canvas>
  );
}
