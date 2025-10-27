'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import Image from 'next/image';
import { useSpring, animated, config } from '@react-spring/three';

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
  isRectangle = false,
  tileWidth = 10,
  label,
  catchChar,
  iconPath,
  onTileClick,
  selectedTile,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  baseZ: number;
  normalizedX: number;
  normalizedY: number;
  colIndex: number;
  mousePosition: { x: number; y: number };
  isRectangle?: boolean;
  tileWidth?: number;
  label?: string;
  catchChar?: string;
  iconPath?: string;
  onTileClick?: (label: string) => void;
  selectedTile?: string | null;
}) {
  const tileRef = useRef<THREE.Group>(null);
  const waveRef = useRef<THREE.Group>(null);
  const { camera, viewport } = useThree();
  const isSelected = selectedTile === label;

  // クリック処理
  const handleClick = (e: React.MouseEvent) => {
    if (label && onTileClick) {
      e.stopPropagation();
      onTileClick(label);
    }
  };

  // アニメーションスプリング
  // 画面いっぱいに表示: ビューポートサイズに合わせて計算

  // 画面いっぱいに表示するためのスケール計算（0.8倍）
  const targetScale = 0.8;

  // カメラの正面、中央に配置
  // カメラ位置は[5, 0, 30]なので、カメラの少し手前に配置
  const targetX = camera.position.x; // カメラのX位置に合わせる
  const targetY = camera.position.y; // カメラのY位置に合わせる
  const targetZ = camera.position.z - 5; // カメラから距離5の位置

  const { scale, animPosX, animPosY, animPosZ, rotX, rotY, rotZ, opacity } = useSpring({
    scale: isSelected ? targetScale : 1,
    animPosX: isSelected ? targetX : position[0],
    animPosY: isSelected ? targetY : position[1],
    animPosZ: isSelected ? targetZ : position[2] + baseZ,
    // 選択時: 完全に正面を向く（回転を0にリセット）
    rotX: isSelected ? 0 : rotation[0],
    rotY: isSelected ? 0 : rotation[1],
    rotZ: isSelected ? 0 : rotation[2],
    opacity: isSelected || !selectedTile ? 1 : 0,
    config: config.slow,
    onChange: (result) => {
      if (isSelected && label) {
        console.log(`${label} - rotY:`, result.value.rotY);
      }
    },
  });

  useFrame((state) => {
    if (!waveRef.current) return;

    // 選択されている場合は、waveRefをリセット（正面を向かせる）
    if (isSelected) {
      waveRef.current.position.z = 0;
      waveRef.current.rotation.x = 0;
      waveRef.current.rotation.y = 0;
      waveRef.current.rotation.z = 0;
      return;
    }

    // 選択されている場合、またはアニメーション中は、useFrameでの操作をスキップ
    if (!selectedTile && waveRef.current) {
      // 選択されていない場合のみ波のアニメーションを実行
      // マウス位置との距離を計算
      const dx = position[0] - mousePosition.x;
      const dy = position[1] - mousePosition.y;

      // マウスがタイルの上にあるかをチェック（長方形タイルのみ反応）
      const tileHalfWidth = tileWidth / 2;
      const tileHalfHeight = 8.5 / 2; // タイルの高さ
      const isHovered =
        isRectangle && Math.abs(dx) < tileHalfWidth && Math.abs(dy) < tileHalfHeight;

      // 波のアニメーション用の正規化座標
      // 長方形タイルの場合は、実際の3D空間での位置を使用して中心基準で計算
      const waveNormalizedX = normalizedX;
      const waveNormalizedY = normalizedY;

      // 波のアニメーション - ゆっくりとした動き
      const wave1 =
        Math.sin(state.clock.elapsedTime * 0.8 + waveNormalizedX * 5 + waveNormalizedY * 3) * 0.8;
      const wave2 =
        Math.sin(state.clock.elapsedTime * 0.5 + waveNormalizedX * 3 - waveNormalizedY * 4) * 0.5;
      const combinedWave = wave1 + wave2;

      // マウスの影響を加える（長方形タイルのホバー時のみ浮き上がる）
      const mouseWave = isHovered ? 3 : 0;
      waveRef.current.position.z = combinedWave + mouseWave;

      // ホバー中は正面を向く、それ以外は波に合わせて角度変化
      if (isHovered) {
        // ホバー中: 正面を向く
        // タイルとグループの回転を打ち消して完全に正面を向く
        // rotation[1]を完全に打ち消す（符号反転）
        waveRef.current.rotation.x = rotation[0];
        waveRef.current.rotation.y = rotation[1]; // タイルの回転を完全に打ち消す
        waveRef.current.rotation.z = rotation[2];
      } else {
        // 波に合わせてタイルの角度も変化
        // 波の勾配を計算して、それに沿ってタイルを傾ける（反転）
        const waveGradientX =
          Math.cos(state.clock.elapsedTime * 0.8 + waveNormalizedX * 5 + waveNormalizedY * 3) *
          5 *
          0.8;
        const waveGradientY =
          Math.cos(state.clock.elapsedTime * 0.8 + waveNormalizedX * 5 + waveNormalizedY * 3) *
          3 *
          0.8;

        // 第2の波の勾配を計算（90度方向の回転用）
        const wave2GradientX =
          Math.cos(state.clock.elapsedTime * 0.5 + waveNormalizedX * 3 - waveNormalizedY * 4) *
          3 *
          0.5;
        const wave2GradientY =
          Math.cos(state.clock.elapsedTime * 0.5 + waveNormalizedX * 3 - waveNormalizedY * 4) *
          -4 *
          0.5;

        // 列ごとに符号を反転
        const colFlip = colIndex % 2 === 0 ? 1 : -1;

        const rotationX = -waveGradientY * 0.02; // 波による回転のみ
        const rotationY = -waveGradientX * 0.015; // 波による回転のみ
        const rotationZ = -(wave2GradientX + wave2GradientY) * 0.03 * colFlip; // 90度方向の回転（列ごとに反転、角度幅を増加）

        waveRef.current.rotation.x = rotation[0] + rotationX;
        waveRef.current.rotation.y = rotation[1] + rotationY;
        waveRef.current.rotation.z = rotation[2] + rotationZ;
      }
    }
  });

  const AnimatedGroup = animated.group;

  return (
    // @ts-expect-error - AnimatedGroup requires animated props
    <AnimatedGroup
      ref={tileRef}
      position-x={animPosX}
      position-y={animPosY}
      position-z={animPosZ}
      rotation-x={rotX}
      rotation-y={rotY}
      rotation-z={rotZ}
      scale={scale}
    >
      {/* 波アニメーション用のグループ（useFrameで操作） */}
      <group ref={waveRef}>
        <RoundedBox
          args={[tileWidth, 8.5, 0.255]}
          radius={0.425}
          smoothness={8}
          onClick={handleClick}
          onPointerOver={() => label && (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'default')}
        >
          <animated.meshPhysicalMaterial
            color="#6ab8d8"
            transparent
            opacity={opacity}
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
        {label && (
          <Html
            position={[0, 0, -0.2]}
            center
            transform
            occlude={false}
            style={{
              userSelect: 'none',
              opacity: isSelected || !selectedTile ? 1 : 0,
              pointerEvents: isSelected || !selectedTile ? 'auto' : 'none',
              transition: 'opacity 0.5s ease',
            }}
          >
            <div
              className="flex items-center gap-8 text-white/90 font-bold whitespace-nowrap cursor-pointer"
              onClick={handleClick}
            >
              <Image
                src="/images/logo_mark.png"
                alt=""
                width={80}
                height={80}
                className="flex-shrink-0"
              />
              <span className="text-7xl">{label}</span>
            </div>
          </Html>
        )}
        {catchChar && !selectedTile && (
          <Html position={[0, 0, 0.2]} center transform occlude={false}>
            <div
              className="text-white/95 font-black select-none"
              style={{
                textShadow: '0 0 50px rgba(255, 255, 255, 0.7)',
                fontSize: '8rem',
              }}
            >
              {catchChar}
            </div>
          </Html>
        )}
        {iconPath && !selectedTile && (
          <Html position={[0, 0, 0.2]} center transform occlude={false}>
            <Image src={iconPath} alt="" width={120} height={120} className="flex-shrink-0" />
          </Html>
        )}
      </group>
    </AnimatedGroup>
  );
}

/**
 * シンプルなタイルグリッド（マウスインタラクション対応）
 */
function SimpleTileGrid({
  mousePosition,
  onTileClick,
  selectedTile,
}: {
  mousePosition: { x: number; y: number };
  onTileClick: (label: string) => void;
  selectedTile: string | null;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // タイルを直接レンダリング
  const tiles = [];
  const tileSize = 8.5; // タイルのサイズ（10 × 0.85）
  const spacing = 9.01; // タイル間の間隔（10.6 × 0.85）
  const rows = 14; // 軽量化のため削減（20 → 14）
  const cols = 18; // 軽量化のため削減（28 → 18）

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // 中央付近のタイル4つを長方形にする（2つ繋げた形）- 左に2タイル分ずらし、下に2タイル分移動
      const centerRow = Math.floor(rows / 2);
      const centerCol = Math.floor(cols / 2);
      const isCenterTile = row === centerRow - 2 && col === centerCol - 2;
      const isBelowCenterTile = row === centerRow - 3 && col === centerCol - 2; // 下の長方形
      const isLeftTopTile = row === centerRow - 2 && col === centerCol - 4; // 左上の長方形
      const isLeftBottomTile = row === centerRow - 3 && col === centerCol - 4; // 左下の長方形

      const isSkippedTile =
        (row === centerRow - 2 && col === centerCol - 1) || // 中央の右隣をスキップ
        (row === centerRow - 3 && col === centerCol - 1) || // 下の右隣をスキップ
        (row === centerRow - 2 && col === centerCol - 3) || // 左上の右隣をスキップ
        (row === centerRow - 3 && col === centerCol - 3); // 左下の右隣をスキップ

      // スキップするタイルは生成しない
      if (isSkippedTile) {
        continue;
      }

      const x = (col - cols / 2) * spacing;
      const y = (row - rows / 2) * spacing;

      // 弓なりに曲げる - 左右方向（右側を手前に）
      const normalizedX = (col - cols / 2) / (cols / 2); // -1 to 1
      const normalizedY = (row - rows / 2) / (rows / 2); // -1 to 1
      const curvature = normalizedX * normalizedX * 36; // 曲線をさらに強く（30 → 36）

      // タイルの回転を曲線に合わせる
      // Y軸周りの回転 - 曲線の接線方向に沿うように（逆方向）
      const tileRotationY = -normalizedX * 0.6; // 回転を増加（0.5 → 0.6）

      const isRectangle = isCenterTile || isBelowCenterTile || isLeftTopTile || isLeftBottomTile;
      const tileWidth = isRectangle ? tileSize * 2 + (spacing - tileSize) : tileSize;

      // 長方形タイルの位置を調整（右隣のタイルの分だけ右にシフト）
      const adjustedX = isRectangle ? x + spacing / 2 : x;

      // 長方形タイルの場合、実際の位置を基準にnormalizedXを再計算
      const adjustedNormalizedX = isRectangle ? adjustedX / ((cols / 2) * spacing) : normalizedX;

      // 長方形タイルの曲率とY軸回転も、調整後の位置を基準に再計算
      const adjustedCurvature = isRectangle
        ? adjustedNormalizedX * adjustedNormalizedX * 36
        : curvature;
      const adjustedTileRotationY = isRectangle ? -adjustedNormalizedX * 0.6 : tileRotationY;

      // 各長方形タイルのラベルを定義
      let label: string | undefined;
      if (isLeftTopTile) {
        label = 'Solutions ›';
      } else if (isLeftBottomTile) {
        label = 'About Us ›';
      } else if (isCenterTile) {
        label = 'Careers ›';
      } else if (isBelowCenterTile) {
        label = 'Contact ›';
      }

      // キャッチコピー用の文字を特定のタイルに表示
      // 右側の上部エリアに配置
      let catchChar: string | undefined;
      let iconPath: string | undefined;
      const catchStartRow = 8; // 上の方（1つ下げる）
      const catchStartCol = cols - 14; // 右から14列目開始（4つ左に移動）

      // INNOVATE (1行目)
      const innovateText = 'INNOVATE';
      if (
        row === catchStartRow &&
        col >= catchStartCol &&
        col < catchStartCol + innovateText.length
      ) {
        catchChar = innovateText[col - catchStartCol];
      }

      // CREATE (2行目)
      const createText = 'CREATE';
      if (
        row === catchStartRow + 1 &&
        col >= catchStartCol &&
        col < catchStartCol + createText.length
      ) {
        catchChar = createText[col - catchStartCol];
      }

      // LEAD (3行目)
      const leadText = 'LEAD';
      if (
        row === catchStartRow + 2 &&
        col >= catchStartCol &&
        col < catchStartCol + leadText.length
      ) {
        catchChar = leadText[col - catchStartCol];
      }

      // サブテキスト1 - 切り拓く (1列目、左端)
      const subText1 = '切り拓く';
      const subCol1 = catchStartCol + innovateText.length + 1; // 1タイル分右に移動
      const subStartRow1 = catchStartRow + 2; // さらに1マス上から開始
      if (col === subCol1 && row <= subStartRow1 && row > subStartRow1 - subText1.length) {
        catchChar = subText1[subStartRow1 - row];
      }

      // サブテキスト2 - 私たちの未来を (2列目、中央)
      const subText2 = '私たちの未来を';
      const subCol2 = subCol1 + 1; // 1マス右側
      const subStartRow2 = catchStartRow + 2;
      if (col === subCol2 && row <= subStartRow2 && row > subStartRow2 - subText2.length) {
        catchChar = subText2[subStartRow2 - row];
      }

      // サブテキスト3 - 全ての英知で (3列目、右端)
      const subText3 = '全ての英知で';
      const subCol3 = subCol2 + 1; // さらに1マス右側
      const subStartRow3 = catchStartRow + 2;
      if (col === subCol3 && row <= subStartRow3 && row > subStartRow3 - subText3.length) {
        catchChar = subText3[subStartRow3 - row];
      }

      tiles.push(
        <WavingTile
          key={`${row}-${col}`}
          position={[adjustedX, y, 0]}
          rotation={[0, adjustedTileRotationY, 0]}
          baseZ={adjustedCurvature}
          normalizedX={adjustedNormalizedX}
          normalizedY={normalizedY}
          colIndex={col}
          mousePosition={mousePosition}
          isRectangle={isRectangle}
          tileWidth={tileWidth}
          label={label}
          catchChar={catchChar}
          iconPath={iconPath}
          onTileClick={onTileClick}
          selectedTile={selectedTile}
        />
      );
    }
  }

  // グループ全体を斜めに傾ける（左上が手前に来るように）
  // ただし、タイルが選択されている時は回転を無効化して正面を向かせる
  const AnimatedGroup = animated.group;

  const { groupRotX, groupRotY, groupRotZ } = useSpring({
    groupRotX: 0, // 画面と同じ方向に
    groupRotY: 0, // 画面と同じ方向に
    groupRotZ: 0, // 画面と同じ方向に
    config: config.slow,
  });

  return (
    // @ts-expect-error - AnimatedGroup requires animated props
    <AnimatedGroup
      ref={groupRef}
      position={[0, 0, 0]}
      rotation-x={groupRotX}
      rotation-y={groupRotY}
      rotation-z={groupRotZ}
    >
      {tiles}
    </AnimatedGroup>
  );
}

/**
 * Canvas内部コンポーネント（マウストラッキング付き）
 */
function Scene({
  selectedTile,
  onTileClick,
}: {
  selectedTile: string | null;
  onTileClick: (label: string) => void;
}) {
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
      <SimpleTileGrid
        mousePosition={mousePosition}
        onTileClick={onTileClick}
        selectedTile={selectedTile}
      />
    </>
  );
}

export function TiledParticles({ onTileSelect }: { onTileSelect?: (tile: string | null) => void }) {
  // クリック拡大処理
  const [selectedTile, setSelectedTile] = useState<string | null>(null);

  const handleTileClick = (label: string) => {
    setSelectedTile(label);
    onTileSelect?.(label);
  };

  const handleTileClose = () => {
    setSelectedTile(null);
    onTileSelect?.(null);
  };

  return (
    <>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <Canvas
          camera={{
            position: [0, 0, 60],
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
            pointerEvents: 'auto',
          }}
        >
          <Scene selectedTile={selectedTile} onTileClick={handleTileClick} />
        </Canvas>
      </div>

      {/* 拡大表示時の閉じるボタンのみ（背景フィルターなし） */}
      {selectedTile && (
        <button
          onClick={handleTileClose}
          className="fixed top-8 right-8 text-white/80 hover:text-white text-6xl leading-none z-50"
        >
          ×
        </button>
      )}
    </>
  );
}
