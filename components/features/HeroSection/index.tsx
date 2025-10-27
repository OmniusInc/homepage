'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { TiledParticles } from './TiledParticles';

export function HeroSection() {
  const [selectedTile, setSelectedTile] = useState<string | null>(null);

  return (
    <section className="relative min-h-screen bg-black">
      {/* タイル状パーティクル */}
      <TiledParticles onTileSelect={setSelectedTile} />

      {/* 他の要素 - selectedTileがある時は非表示 */}
      {!selectedTile && (
        <>
          {/* Cyan light beam effect - sharper and brighter */}
          <div className="absolute top-0 right-1/4 w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-400/70 to-transparent -z-10 rotate-[28deg]" />
          <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-cyan-300/60 to-transparent -z-10 rotate-[15deg]" />
          <div className="absolute top-0 right-[20%] w-px h-full bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent -z-10 rotate-[35deg]" />
          <div className="absolute top-0 right-[40%] w-0.5 h-full bg-gradient-to-b from-transparent via-cyan-500/65 to-transparent blur-sm -z-10 rotate-[20deg]" />

          {/* Star sparkle in bottom-right */}
          <div className="absolute bottom-8 right-8 w-12 h-12 -z-10">
            <svg className="w-full h-full text-white/40" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z" />
            </svg>
          </div>

          {/* Giant centered "Omnius" text watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <h1
              className="text-[10rem] md:text-[12rem] lg:text-[15rem] xl:text-[18rem] font-black uppercase tracking-[0.1em] select-none"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                opacity: 0.15,
              }}
            >
              Omnius
            </h1>
          </div>

          {/* Logo and Navigation - Fixed top-left */}
          <div className="absolute top-8 left-8 z-20">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 select-none"
            >
              <Image
                src="/images/logo_blackback.png"
                alt="Omnius"
                width={180}
                height={54}
                priority
                draggable={false}
              />
            </motion.div>
          </div>

          <div className="container mx-auto px-6 lg:px-8 min-h-screen relative z-10 flex items-center pointer-events-none">
            <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Left - INNOVATE. CREATE. LEAD. */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-white text-center lg:text-right"
              >
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                  INNOVATE. CREATE. LEAD.
                </h2>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
