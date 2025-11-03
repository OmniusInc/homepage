'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TileParticleProps {
  position: [number, number, number];
  rotation: [number, number, number];
}

function TileParticle({ position, rotation }: TileParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Memoize geometry to avoid recreating on every render
  const geometry = useMemo(() => new THREE.PlaneGeometry(3, 3), []);

  // Subtle animation - slight floating motion
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.z =
        position[2] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.2;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Main plate with physical material for reflections */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial
          color="#1e7fb8"
          metalness={0.5}
          roughness={0.2}
          transparent
          opacity={0.8}
          emissive="#1e7fb8"
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glowing cyan edges */}
      <lineSegments>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color="#00d9ff" linewidth={2} transparent opacity={1.0} />
      </lineSegments>
    </group>
  );
}

function TiledGrid() {
  // Memoize tiles array to prevent regeneration on every render
  const tiles = useMemo(() => {
    const tilesArray: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
    }> = [];

    // Create grid of tiles with random rotations
    // Adjusted z-range to be in front of camera (camera at z: 10)
    for (let x = -15; x <= 15; x += 2) {
      for (let y = -10; y <= 10; y += 2) {
        for (let z = -5; z <= 5; z += 3) {
          // Random rotation for each tile (keeping it subtle)
          const rotX = (Math.random() - 0.5) * 0.4;
          const rotY = (Math.random() - 0.5) * 0.4;
          const rotZ = (Math.random() - 0.5) * 0.3;

          tilesArray.push({
            position: [x, y, z],
            rotation: [rotX, rotY, rotZ],
          });
        }
      }
    }

    return tilesArray;
  }, []); // Empty dependency array - only create once

  return (
    <>
      {tiles.map((tile, index) => (
        <TileParticle key={index} position={tile.position} rotation={tile.rotation} />
      ))}
    </>
  );
}

function Lights() {
  return (
    <>
      {/* Main directional light for overall illumination */}
      <directionalLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />

      {/* Purple accent light (left side) */}
      <pointLight position={[-10, 5, 5]} intensity={0.8} color="#8b5cf6" distance={30} />

      {/* Cyan accent light (right side) */}
      <pointLight position={[10, -5, 5]} intensity={0.8} color="#06b6d4" distance={30} />

      {/* Pink accent light (top back) */}
      <pointLight position={[0, 10, -10]} intensity={0.6} color="#ec4899" distance={25} />

      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.2} />
    </>
  );
}

export function TiledBackground3D() {
  return (
    <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, 50, 20], fov: 20 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <Lights />
        <TiledGrid />
      </Canvas>
    </div>
  );
}
