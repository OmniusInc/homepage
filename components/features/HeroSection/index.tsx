'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { TiledParticles, TAB_SECTIONS } from './TiledParticles';
import { MobileView } from './MobileView';

export function HeroSection() {
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // モバイルの場合はMobileViewを表示
  if (isMobile) {
    // TAB_SECTIONSをMobileViewの形式に変換
    const tabGroups = TAB_SECTIONS.map((tab) => ({
      tabLabel: tab.label,
      sections: tab.sections.map((section) => ({
        title: section.title,
        content: section.content as JSX.Element,
      })),
    }));

    return <MobileView tabGroups={tabGroups} />;
  }

  return (
    <section className="relative min-h-screen bg-black">
      {/* タイル状パーティクル */}
      <TiledParticles onTileSelect={setSelectedTile} />

      {/* 他の要素 - selectedTileがある時 または モバイルの時は非表示 */}
      {!selectedTile && !isMobile && (
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
        </>
      )}
    </section>
  );
}
