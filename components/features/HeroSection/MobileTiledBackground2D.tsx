'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseY: number;
  speed: number;
  amplitude: number;
  phase: number;
  size: number;
  colorType: 'cyan' | 'purple' | 'orange' | 'pink';
}

export default function MobileTiledBackground2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // キャンバスサイズの設定
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio, 2); // 最大2倍まで
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      initParticles();
    };

    // パーティクルの初期化
    const initParticles = () => {
      const particles: Particle[] = [];
      const cols = 5; // 列数を削減（8 → 5）
      const rows = 7; // 行数を削減（10 → 7）
      const spacing = window.innerWidth / cols;

      // 寒色をメインに、暖色を少なめに配分（7:3の比率）
      const colors: Array<'cyan' | 'purple' | 'orange' | 'pink'> = [
        'cyan',
        'cyan',
        'cyan',
        'purple',
        'purple',
        'purple',
        'orange',
        'pink',
      ];

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          // ランダムな位置のオフセットを追加して集合体に見えないようにする
          const offsetX = (Math.random() - 0.5) * spacing * 0.6;
          const offsetY = (Math.random() - 0.5) * spacing * 0.6;

          particles.push({
            x: i * spacing + spacing / 2 + offsetX,
            y: j * spacing + spacing / 2 + offsetY,
            baseY: j * spacing + spacing / 2 + offsetY,
            speed: 0.5 + Math.random() * 0.5,
            amplitude: 20 + Math.random() * 30,
            phase: Math.random() * Math.PI * 2,
            size: 50 + Math.random() * 30,
            colorType: colors[Math.floor(Math.random() * colors.length)],
          });
        }
      }
      particlesRef.current = particles;
    };

    // アニメーションループ
    const animate = () => {
      if (!canvas || !ctx) return;

      timeRef.current += 0.01;
      const time = timeRef.current;

      // キャンバスをクリア（透明に）
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // グラデーション背景
      const gradient = ctx.createLinearGradient(0, 0, window.innerWidth, window.innerHeight);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      gradient.addColorStop(0.5, 'rgba(10, 20, 40, 0.95)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // パーティクルの描画
      particlesRef.current.forEach((particle, index) => {
        // 波の動き
        const waveY =
          particle.baseY + Math.sin(time * particle.speed + particle.phase) * particle.amplitude;

        // 色のタイプに応じてhueを設定
        let baseHue: number;
        switch (particle.colorType) {
          case 'cyan':
            baseHue = 180; // シアン
            break;
          case 'purple':
            baseHue = 280; // パープル
            break;
          case 'orange':
            baseHue = 30; // オレンジ
            break;
          case 'pink':
            baseHue = 330; // ピンク
            break;
        }

        const hue = baseHue + Math.sin(time + index * 0.1) * 15;
        const alpha = 0.25 + Math.sin(time * 0.5 + particle.phase) * 0.15;

        // グロー効果
        const glowGradient = ctx.createRadialGradient(
          particle.x,
          waveY,
          0,
          particle.x,
          waveY,
          particle.size
        );
        glowGradient.addColorStop(0, `hsla(${hue}, 80%, 60%, ${alpha})`);
        glowGradient.addColorStop(0.5, `hsla(${hue}, 70%, 50%, ${alpha * 0.5})`);
        glowGradient.addColorStop(1, `hsla(${hue}, 60%, 40%, 0)`);

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(particle.x, waveY, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // コアの描画（より明るく）
        const coreGradient = ctx.createRadialGradient(
          particle.x,
          waveY,
          0,
          particle.x,
          waveY,
          particle.size * 0.3
        );
        coreGradient.addColorStop(0, `hsla(${hue}, 90%, 80%, ${alpha * 0.8})`);
        coreGradient.addColorStop(1, `hsla(${hue}, 80%, 60%, 0)`);

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(particle.x, waveY, particle.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ touchAction: 'none' }}
    />
  );
}
