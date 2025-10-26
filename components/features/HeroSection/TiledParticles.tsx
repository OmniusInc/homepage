'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * マウス位置を追跡
 */
function MouseTracker({ onMouseMove }: { onMouseMove: (x: number, y: number) => void }) {
  const { viewport } = useThree();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // スクリーン座標を3D空間座標に変換
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;

      // ビューポートサイズに合わせて変換
      const worldX = (x * viewport.width) / 2;
      const worldY = (y * viewport.height) / 2;

      onMouseMove(worldX, worldY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [viewport, onMouseMove]);

  return null;
}

/**
 * 波打つタイル（マウスインタラクション付き）
 */
function WavingTile({
  position,
  rotation,
  baseZ,
  normalizedX,
  normalizedY,
  colIndex,
  mousePosition,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  baseZ: number;
  normalizedX: number;
  normalizedY: number;
  colIndex: number;
  mousePosition: { x: number; y: number };
}) {
  const tileRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (tileRef.current) {
      // マウス位置との距離を計算
      const dx = position[0] - mousePosition.x;
      const dy = position[1] - mousePosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // マウスの影響範囲（距離が近いほど強く反応）- 控えめに調整
      const influenceRadius = 20; // 30 → 20 に縮小
      const mouseInfluence = Math.max(0, 1 - distance / influenceRadius);

      // 波のアニメーション - ゆっくりとした動き
      const wave1 =
        Math.sin(state.clock.elapsedTime * 0.8 + normalizedX * 5 + normalizedY * 3) * 0.8;
      const wave2 =
        Math.sin(state.clock.elapsedTime * 0.5 + normalizedX * 3 - normalizedY * 4) * 0.5;
      const combinedWave = wave1 + wave2;

      // マウスの影響を加える（カーソルに近いタイルが浮き上がる）- 控えめに調整
      const mouseWave = mouseInfluence * 2; // 5 → 2 に縮小
      tileRef.current.position.z = baseZ + combinedWave + mouseWave;

      // 波に合わせてタイルの角度も変化
      // 波の勾配を計算して、それに沿ってタイルを傾ける（反転）
      const waveGradientX =
        Math.cos(state.clock.elapsedTime * 0.8 + normalizedX * 5 + normalizedY * 3) * 5 * 0.8;
      const waveGradientY =
        Math.cos(state.clock.elapsedTime * 0.8 + normalizedX * 5 + normalizedY * 3) * 3 * 0.8;

      // 第2の波の勾配を計算（90度方向の回転用）
      const wave2GradientX =
        Math.cos(state.clock.elapsedTime * 0.5 + normalizedX * 3 - normalizedY * 4) * 3 * 0.5;
      const wave2GradientY =
        Math.cos(state.clock.elapsedTime * 0.5 + normalizedX * 3 - normalizedY * 4) * -4 * 0.5;

      // 列ごとに符号を反転
      const colFlip = colIndex % 2 === 0 ? 1 : -1;

      // マウスによる回転効果（カーソルの方向を向く）- 控えめに調整
      const mouseRotationX = mouseInfluence * (dy / distance || 0) * 0.1; // 0.3 → 0.1 に縮小
      const mouseRotationY = mouseInfluence * (-dx / distance || 0) * 0.1; // 0.3 → 0.1 に縮小

      const rotationX = -waveGradientY * 0.02 + mouseRotationX; // 反転 + マウス効果
      const rotationY = -waveGradientX * 0.015 + mouseRotationY; // 反転 + マウス効果
      const rotationZ = -(wave2GradientX + wave2GradientY) * 0.03 * colFlip; // 90度方向の回転（列ごとに反転、角度幅を増加）

      tileRef.current.rotation.x = rotation[0] + rotationX;
      tileRef.current.rotation.y = rotation[1] + rotationY;
      tileRef.current.rotation.z = rotation[2] + rotationZ;
    }
  });

  return (
    <group ref={tileRef} position={position} rotation={rotation}>
      <RoundedBox args={[8, 8, 0.25]} radius={0.4} smoothness={8}>
        <meshPhysicalMaterial
          color="#6ab8d8"
          transparent
          opacity={0.25}
          metalness={0.1}
          roughness={0.05}
          transmission={0.92}
          thickness={0.4}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          envMapIntensity={6.0}
          ior={1.52}
          reflectivity={0.98}
          attenuationColor="#88ccee"
          attenuationDistance={2.5}
          iridescence={0.5}
          iridescenceIOR={1.4}
          sheen={0.8}
          sheenColor="#ffffff"
        />
      </RoundedBox>
    </group>
  );
}

/**
 * シンプルなタイルグリッド（マウスインタラクション対応）
 */
function SimpleTileGrid({ mousePosition }: { mousePosition: { x: number; y: number } }) {
  const groupRef = useRef<THREE.Group>(null);

  // タイルを直接レンダリング
  const tiles = [];
  const tileSize = 8; // タイルのサイズ
  const tileDepth = 0.25; // 厚み
  const spacing = 8.5; // タイル間の間隔（タイルサイズ + 少しの隙間）
  const rows = 20; // 縦をさらに増やす（15 → 20）
  const cols = 28; // 横をさらに増やす（20 → 28）

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = (col - cols / 2) * spacing;
      const y = (row - rows / 2) * spacing;

      // 弓なりに曲げる - 左右方向（右側を手前に）
      const normalizedX = (col - cols / 2) / (cols / 2); // -1 to 1
      const normalizedY = (row - rows / 2) / (rows / 2); // -1 to 1
      const curvature = normalizedX * normalizedX * 36; // 曲線をさらに強く（30 → 36）

      // タイルの回転を曲線に合わせる
      // Y軸周りの回転 - 曲線の接線方向に沿うように（逆方向）
      const tileRotationY = -normalizedX * 0.6; // 回転を増加（0.5 → 0.6）

      tiles.push(
        <WavingTile
          key={`${row}-${col}`}
          position={[x, y, 0]}
          rotation={[0, tileRotationY, 0]}
          baseZ={curvature}
          normalizedX={normalizedX}
          normalizedY={normalizedY}
          colIndex={col}
          mousePosition={mousePosition}
        />
      );
    }
  }

  // グループ全体を斜めに傾ける（左上が手前に来るように）
  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      rotation={[-Math.PI * 0.15, -Math.PI * 0.06, -Math.PI * 0.06]}
    >
      {tiles}
    </group>
  );
}

/**
 * Canvas内部コンポーネント（マウストラッキング付き）
 */
function Scene() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (x: number, y: number) => {
    setMousePosition({ x, y });
  };

  return (
    <>
      {/* マウストラッカー */}
      <MouseTracker onMouseMove={handleMouseMove} />

      {/* 環境マップ - 暗めの環境で光を引き立てる */}
      <Environment preset="night" background={false} blur={0.8} />

      {/* 暗めの環境光 - 光の差し込みを引き立てる */}
      <ambientLight intensity={0.3} color="#1a1f2e" />

      {/* メインの太陽光 - 右上から黄金色の光 */}
      <directionalLight position={[30, 35, 25]} intensity={4.5} color="#ffd700" castShadow />

      {/* タイルグリッド */}
      <SimpleTileGrid mousePosition={mousePosition} />
    </>
  );
}

export function TiledParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <Canvas
        camera={{
          position: [5, 0, 26],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          alpha: true,
          antialias: true,
        }}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
