'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * パフォーマンス最適化: 波のパターン事前計算
 * sin/cosのルックアップテーブル（360要素）
 */
const WAVE_TABLE_SIZE = 360;
const WAVE_SIN_TABLE = Array.from({ length: WAVE_TABLE_SIZE }, (_, i) =>
  Math.sin((i / WAVE_TABLE_SIZE) * Math.PI * 2)
);
const WAVE_COS_TABLE = Array.from({ length: WAVE_TABLE_SIZE }, (_, i) =>
  Math.cos((i / WAVE_TABLE_SIZE) * Math.PI * 2)
);

/**
 * 高速sin関数（ルックアップテーブル使用）
 */
function fastSin(angle: number): number {
  const normalized = angle / (Math.PI * 2);
  const index = Math.floor((normalized - Math.floor(normalized)) * WAVE_TABLE_SIZE);
  return WAVE_SIN_TABLE[index];
}

/**
 * 高速cos関数（ルックアップテーブル使用）
 */
function fastCos(angle: number): number {
  const normalized = angle / (Math.PI * 2);
  const index = Math.floor((normalized - Math.floor(normalized)) * WAVE_TABLE_SIZE);
  return WAVE_COS_TABLE[index];
}

/**
 * モバイル版タイルコンポーネント（PC版の完全再現）
 * 文字やラベルなし、波打つアニメーションのみ
 */
interface MobileTileProps {
  position: [number, number, number];
  rotation: [number, number, number];
  rowIndex: number;
  colIndex: number;
  tileIndex: number;
  normalizedX: number;
  normalizedY: number;
}

function MobileTile({
  position,
  rotation,
  rowIndex,
  colIndex,
  tileIndex,
  normalizedX,
  normalizedY,
}: MobileTileProps) {
  const tileRef = useRef<THREE.Group>(null);
  const waveRef = useRef<THREE.Group>(null);
  const frameCountRef = useRef(0); // フレームカウンター（パフォーマンス最適化用）

  // PC版と完全に同じ波のアニメーション
  useFrame((state) => {
    if (!waveRef.current) return;

    // パフォーマンス最適化: フレームスキップ（3フレームに1回、タイルごとに異なるタイミング）
    frameCountRef.current++;
    if (frameCountRef.current % 3 !== tileIndex % 3) return;

    const waveNormalizedX = normalizedX;
    const waveNormalizedY = normalizedY;

    // パフォーマンス最適化: Math.sin/cos を fastSin/fastCos に置き換え
    // モバイル版: 波の速度を半分に
    const wave1 =
      fastSin(state.clock.elapsedTime * 0.4 + waveNormalizedX * 5 + waveNormalizedY * 3) * 0.8;
    const wave2 =
      fastSin(state.clock.elapsedTime * 0.25 + waveNormalizedX * 3 - waveNormalizedY * 4) * 0.5;
    const combinedWave = wave1 + wave2;

    waveRef.current.position.z = combinedWave;

    // 波の勾配を計算（速度を半分に）
    const waveGradientX =
      fastCos(state.clock.elapsedTime * 0.4 + waveNormalizedX * 5 + waveNormalizedY * 3) * 5 * 0.8;
    const waveGradientY =
      fastCos(state.clock.elapsedTime * 0.4 + waveNormalizedX * 5 + waveNormalizedY * 3) * 3 * 0.8;

    // 第2の波の勾配を計算（速度を半分に）
    const wave2GradientX =
      fastCos(state.clock.elapsedTime * 0.25 + waveNormalizedX * 3 - waveNormalizedY * 4) * 3 * 0.5;
    const wave2GradientY =
      fastCos(state.clock.elapsedTime * 0.25 + waveNormalizedX * 3 - waveNormalizedY * 4) *
      -4 *
      0.5;

    // 列ごとに符号を反転
    const colFlip = colIndex % 2 === 0 ? 1 : -1;

    const rotationX = -waveGradientY * 0.02;
    const rotationY = -waveGradientX * 0.015;
    const rotationZ = -(wave2GradientX + wave2GradientY) * 0.03 * colFlip;

    waveRef.current.rotation.x = rotation[0] + rotationX;
    waveRef.current.rotation.y = rotation[1] + rotationY;
    waveRef.current.rotation.z = rotation[2] + rotationZ;
  });

  const tileSize = 8.5;

  return (
    <group ref={tileRef} position={position}>
      <group ref={waveRef}>
        <RoundedBox
          args={[tileSize, tileSize, 0.255]}
          radius={0.425}
          smoothness={8}
        >
          <meshPhysicalMaterial
            color="#6ab8d8"
            transparent
            opacity={0.75}
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
    </group>
  );
}

/**
 * タイルグリッド: 横10 × 縦14（PC版と同じ配置ロジック）
 */
function MobileTileGrid() {
  const tiles = useMemo(() => {
    const tilesArray: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
      rowIndex: number;
      colIndex: number;
      normalizedX: number;
      normalizedY: number;
    }> = [];

    const tileSize = 8.5;
    const spacing = 9.01;
    const cols = 14; // 横14列（モバイル版用に調整）
    const rows = 12; // 縦12行（モバイル版用に調整）

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col - cols / 2) * spacing - spacing; // 左方向に1タイル分シフト
        const y = (row - rows / 2) * spacing + spacing; // 上方向に1タイル分シフト

        // PC版と同じnormalized座標
        const normalizedX = (col - cols / 2) / (cols / 2); // -1 to 1
        const normalizedY = (row - rows / 2) / (rows / 2); // -1 to 1

        // PC版と同じ湾曲配置
        const curvature = normalizedX * normalizedX * 36; // 曲線の強さ

        // タイルの回転を曲線に合わせる（PC版と同じ）
        const tileRotationY = -normalizedX * 0.6; // Y軸周りの回転

        tilesArray.push({
          position: [x, y, curvature], // Z座標に湾曲を適用
          rotation: [0, tileRotationY, 0], // PC版と同じ回転
          rowIndex: row,
          colIndex: col,
          normalizedX,
          normalizedY,
        });
      }
    }

    return tilesArray;
  }, []);

  return (
    <>
      {tiles.map((tile, index) => (
        <MobileTile
          key={index}
          position={tile.position}
          rotation={tile.rotation}
          rowIndex={tile.rowIndex}
          colIndex={tile.colIndex}
          tileIndex={index}
          normalizedX={tile.normalizedX}
          normalizedY={tile.normalizedY}
        />
      ))}
    </>
  );
}

/**
 * PC版と同じライティング設定
 */
function MobileLights() {
  return (
    <>
      {/* 暗めの環境光 - 光の差し込みを引き立てる */}
      <ambientLight intensity={0.3} color="#1a1f2e" />

      {/* メインの太陽光 - 右上から黄金色の光 */}
      <directionalLight position={[30, 35, 25]} intensity={4.5} color="#ffd700" castShadow />
    </>
  );
}

/**
 * モバイル版タイル背景コンポーネント
 */
export function MobileTiledBackground() {
  return (
    <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [0, -70, 60], fov: 45 }} // モバイル向けカメラ調整（さらに下から見上げる）
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <MobileLights />
        <Environment preset="night" background={false} blur={0.8} />
        <group rotation={[Math.PI / 180 * 20, Math.PI / 180 * -25, Math.PI / 180 * -20]}>
          <MobileTileGrid />
        </group>
      </Canvas>
    </div>
  );
}
