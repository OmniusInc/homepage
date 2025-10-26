'use client';

import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * シンプルなタイルグリッド
 */
function SimpleTileGrid() {
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
      const curvature = normalizedX * normalizedX * 36; // 曲線をさらに強く（30 → 36）

      // タイルの回転を曲線に合わせる
      // Y軸周りの回転 - 曲線の接線方向に沿うように（逆方向）
      const tileRotationY = -normalizedX * 0.6; // 回転を増加（0.5 → 0.6）

      tiles.push(
        <RoundedBox
          key={`${row}-${col}`}
          position={[x, y, curvature]}
          rotation={[0, tileRotationY, 0]}
          args={[tileSize, tileSize, tileDepth]}
          radius={0.4}
          smoothness={8}
        >
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
      );
    }
  }

  // グループ全体を斜めに傾ける（左上が手前に来るように）
  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      rotation={[-Math.PI * 0.18, -Math.PI * 0.08, -Math.PI * 0.08]}
    >
      {tiles}
    </group>
  );
}

export function TiledParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <Canvas
        camera={{
          position: [5, 0, 22],
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
        {/* 環境マップ - 暗めの環境で光を引き立てる */}
        <Environment preset="night" background={false} blur={0.8} />

        {/* 暗めの環境光 - 光の差し込みを引き立てる */}
        <ambientLight intensity={0.15} color="#1a1f2e" />

        {/* 強烈なメイン木漏れ日 - 右上から黄金色の光 */}
        <directionalLight position={[30, 35, 25]} intensity={5.5} color="#ffd700" castShadow />

        {/* サブ木漏れ日 - 左上からオレンジ色の光 */}
        <directionalLight position={[-25, 30, 20]} intensity={4.0} color="#ffb347" />

        {/* 逆光 - 後ろから温かい光 */}
        <directionalLight position={[0, -15, -20]} intensity={3.5} color="#ffa500" />

        {/* 集中的な木漏れ日スポット1 - 右上 */}
        <spotLight
          position={[35, 40, 30]}
          angle={0.25}
          penumbra={0.95}
          intensity={8.0}
          color="#fff4cc"
          distance={90}
        />

        {/* 集中的な木漏れ日スポット2 - 左 */}
        <spotLight
          position={[-30, 35, 28]}
          angle={0.3}
          penumbra={0.92}
          intensity={6.5}
          color="#ffe4b3"
          distance={85}
        />

        {/* 集中的な木漏れ日スポット3 - 中央上 */}
        <spotLight
          position={[5, 38, 26]}
          angle={0.28}
          penumbra={0.93}
          intensity={7.0}
          color="#fff9e6"
          distance={80}
        />

        {/* 暖色のアクセントライト */}
        <pointLight
          position={[20, 25, 15]}
          intensity={4.0}
          color="#ffcc66"
          distance={50}
          decay={2}
        />

        {/* タイルグリッド */}
        <SimpleTileGrid />
      </Canvas>
    </div>
  );
}
