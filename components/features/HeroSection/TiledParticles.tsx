'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import Image from 'next/image';
import { useSpring, animated, config } from '@react-spring/three';

/**
 * セクションデータの型定義
 */
interface SectionData {
  title: string;
  content: React.ReactNode;
  backgroundColor?: string;
}

/**
 * タブタイルのセクション設定
 */
interface TabSectionConfig {
  label: string;
  sections: SectionData[];
}

/**
 * 各タブタイルのセクションデータ
 */
const TAB_SECTIONS: TabSectionConfig[] = [
  {
    label: 'Solutions ›',
    sections: [
      {
        title: 'Section 1',
        content: <div className="text-white text-4xl">Solutions - Section 1</div>,
      },
      {
        title: 'Section 2',
        content: <div className="text-white text-4xl">Solutions - Section 2</div>,
      },
      {
        title: 'Section 3',
        content: <div className="text-white text-4xl">Solutions - Section 3</div>,
      },
    ],
  },
  {
    label: 'About Us ›',
    sections: [
      {
        title: 'Section 1',
        content: <div className="text-white text-4xl">About Us - Section 1</div>,
      },
      {
        title: 'Section 2',
        content: <div className="text-white text-4xl">About Us - Section 2</div>,
      },
    ],
  },
  {
    label: 'Careers ›',
    sections: [
      {
        title: 'Section 1',
        content: <div className="text-white text-4xl">Careers - Section 1</div>,
      },
      {
        title: 'Section 2',
        content: <div className="text-white text-4xl">Careers - Section 2</div>,
      },
      {
        title: 'Section 3',
        content: <div className="text-white text-4xl">Careers - Section 3</div>,
      },
      {
        title: 'Section 4',
        content: <div className="text-white text-4xl">Careers - Section 4</div>,
      },
    ],
  },
  {
    label: 'Contact ›',
    sections: [
      {
        title: 'Section 1',
        content: <div className="text-white text-4xl">Contact - Section 1</div>,
      },
      {
        title: 'Section 2',
        content: <div className="text-white text-4xl">Contact - Section 2</div>,
      },
      {
        title: 'Section 3',
        content: <div className="text-white text-4xl">Contact - Section 3</div>,
      },
    ],
  },
];

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
  currentSectionIndex,
  sectionRotation,
  isScaleComplete,
  onScaleComplete,
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
  currentSectionIndex?: number;
  sectionRotation?: number;
  isScaleComplete?: boolean;
  onScaleComplete?: () => void;
}) {
  const tileRef = useRef<THREE.Group>(null);
  const waveRef = useRef<THREE.Group>(null);
  const { camera, viewport } = useThree();
  const isSelected = selectedTile === label;
  const hoverZRef = useRef(0); // ホバー時のZ位置を滑らかに補間するための ref

  // クリック処理
  const handleClick = (e: React.MouseEvent) => {
    if (label && onTileClick) {
      e.stopPropagation();
      onTileClick(label);
    }
  };

  // アニメーションスプリング
  // 画面いっぱいに表示: ビューポートサイズに合わせて計算

  // 画面いっぱいに表示するためのスケール計算（1倍）
  const targetScale = 1.0;

  // カメラの正面、中央に配置
  const targetX = 0; // 画面中央（X=0）
  const targetY = 0; // 画面中央（Y=0）
  const targetZ = camera.position.z - 5; // カメラから距離5の位置

  // 他のタイルが散らばる方向を計算（中心から外側へ）
  const scatterDirection = {
    x: position[0], // 元の位置方向
    y: position[1],
    z: position[2],
  };
  const scatterDistance = 100; // 散らばる距離

  const { scale, animPosX, animPosY, animPosZ, rotX, rotY, rotZ, opacity } = useSpring({
    scale: isSelected ? targetScale : selectedTile && !isSelected ? 0.5 : 1,
    animPosX: isSelected
      ? targetX
      : selectedTile && !isSelected
        ? scatterDirection.x * 3
        : position[0],
    animPosY: isSelected
      ? targetY
      : selectedTile && !isSelected
        ? scatterDirection.y * 3
        : position[1],
    animPosZ: isSelected
      ? targetZ
      : selectedTile && !isSelected
        ? scatterDirection.z + scatterDistance
        : position[2] + baseZ,
    // 選択時: セクション回転を適用、それ以外は元の回転
    rotX:
      isSelected && sectionRotation !== undefined
        ? sectionRotation
        : selectedTile && !isSelected
          ? rotation[0] + normalizedX * 2
          : rotation[0],
    rotY: isSelected
      ? 0
      : selectedTile && !isSelected
        ? rotation[1] + normalizedY * 2
        : rotation[1],
    rotZ: isSelected
      ? 0
      : selectedTile && !isSelected
        ? rotation[2] + (normalizedX + normalizedY)
        : rotation[2],
    opacity: isSelected || !selectedTile ? 1 : 0,
    config: selectedTile && !isSelected ? { tension: 120, friction: 20 } : config.slow,
    // セクションインデックスが0の時（タイル選択直後）は即座に回転を0にリセット
    immediate:
      isSelected && (sectionRotation === 0 || sectionRotation === undefined)
        ? (key) => key === 'rotX'
        : false,
    onChange: (result) => {
      // スケールアニメーションが完了したら通知
      if (isSelected && onScaleComplete && !isScaleComplete) {
        const currentScale = result.value.scale as number;
        // スケールが目標値（targetScale）に十分近づいたら完了とみなす
        if (Math.abs(currentScale - targetScale) < 0.01) {
          onScaleComplete();
        }
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

      // ホバー時のZ位置を滑らかに補間（lerp）
      const targetHoverZ = isHovered ? 4 : 0;
      hoverZRef.current += (targetHoverZ - hoverZRef.current) * 0.15; // 0.15 = 滑らかさの係数

      waveRef.current.position.z = combinedWave + hoverZRef.current;

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
        {/* タイルの表面: ラベル（選択されていない時のみ表示） */}
        {label && !isSelected && (
          <Html
            position={[0, 0, -0.2]}
            center
            transform
            occlude={false}
            style={{
              userSelect: 'none',
              opacity: !selectedTile ? 1 : 0,
              pointerEvents: !selectedTile ? 'auto' : 'none',
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
        {/* セクション内容 */}
        {label && isSelected && currentSectionIndex !== undefined && (
          <Html
            position={[0, 0, 0.2]}
            center
            transform
            occlude={false}
            style={{
              userSelect: 'none',
              // 奇数セクション（1, 3, 5...）の時は180度反転、偶数セクション（0, 2, 4...）はそのまま
              transform: currentSectionIndex % 2 === 1 ? 'rotateX(180deg)' : 'none',
            }}
          >
            <div className="flex items-center justify-center p-8">
              {TAB_SECTIONS.find((tab) => tab.label === label)?.sections[currentSectionIndex]
                ?.content || <div className="text-white text-4xl">No content</div>}
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
  currentSectionIndex,
  sectionRotation,
  isScaleComplete,
  onScaleComplete,
}: {
  mousePosition: { x: number; y: number };
  onTileClick: (label: string) => void;
  selectedTile: string | null;
  currentSectionIndex: number;
  sectionRotation: number;
  isScaleComplete: boolean;
  onScaleComplete: () => void;
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
      const catchStartCol = cols - 15; // 右から15列目開始（1タイル分左に移動）

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
          currentSectionIndex={currentSectionIndex}
          sectionRotation={sectionRotation}
          isScaleComplete={isScaleComplete}
          onScaleComplete={onScaleComplete}
        />
      );
    }
  }

  // グループ全体の回転（選択時は完全に正面を向く）
  const AnimatedGroup = animated.group;

  // カメラが右にずれているので、タイルグリッドを左に回転させて正面を向かせる
  // カメラ位置[15, 0, 60]から原点を見る角度を計算
  // tan(θ) = 15 / 60 = 0.25 → θ ≈ 0.2449 ラジアン（約14度）
  const baseRotationY = Math.atan2(15, 60); // カメラ位置に基づく正確な角度

  const { groupRotX, groupRotY, groupRotZ } = useSpring({
    groupRotX: selectedTile ? 0 : 0,
    groupRotY: selectedTile ? baseRotationY : 0, // 選択時は回転を加えて正面に、通常時は0
    groupRotZ: selectedTile ? 0 : 0,
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
  currentSectionIndex,
  sectionRotation,
  isScaleComplete,
  onScaleComplete,
}: {
  selectedTile: string | null;
  onTileClick: (label: string) => void;
  currentSectionIndex: number;
  sectionRotation: number;
  isScaleComplete: boolean;
  onScaleComplete: () => void;
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
        currentSectionIndex={currentSectionIndex}
        sectionRotation={sectionRotation}
        isScaleComplete={isScaleComplete}
        onScaleComplete={onScaleComplete}
      />
    </>
  );
}

export function TiledParticles({ onTileSelect }: { onTileSelect?: (tile: string | null) => void }) {
  // クリック拡大処理
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  // セクション管理
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  // スケール完了フラグ
  const [isScaleComplete, setIsScaleComplete] = useState(false);

  const handleTileClick = (label: string) => {
    setSelectedTile(label);
    setCurrentSectionIndex(0); // タイル選択時は必ずセクション0から
    setIsScaleComplete(false); // スケール開始時はfalse
    onTileSelect?.(label);
  };

  const handleTileClose = () => {
    setSelectedTile(null);
    setCurrentSectionIndex(0);
    setIsScaleComplete(false);
    onTileSelect?.(null);
  };

  // 画面クリックでセクションを進める
  const handleScreenClick = () => {
    if (!selectedTile) return;

    // スケールが完了していない場合は、スケール完了フラグを立てるだけ
    if (!isScaleComplete) {
      setIsScaleComplete(true);
      return;
    }

    const currentTab = TAB_SECTIONS.find((tab) => tab.label === selectedTile);
    if (!currentTab) return;

    const totalSections = currentTab.sections.length;
    const nextIndex = currentSectionIndex + 1;

    if (nextIndex < totalSections) {
      setCurrentSectionIndex(nextIndex);
    } else {
      // 全セクション終了後は閉じる
      handleTileClose();
    }
  };

  // セクションインデックスに基づいてX軸回転角度を計算
  // 180度 = Math.PI ラジアン
  // スケール完了後のみ回転を適用
  const sectionRotation = isScaleComplete ? currentSectionIndex * Math.PI : 0;

  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
        onClick={selectedTile ? handleScreenClick : undefined}
      >
        <Canvas
          camera={{
            position: [15, 0, 60],
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
          <Scene
            selectedTile={selectedTile}
            onTileClick={handleTileClick}
            currentSectionIndex={currentSectionIndex}
            sectionRotation={sectionRotation}
            isScaleComplete={isScaleComplete}
            onScaleComplete={() => setIsScaleComplete(true)}
          />
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
