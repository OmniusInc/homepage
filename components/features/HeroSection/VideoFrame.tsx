'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { OIcon } from '@/components/ui/OIcon';

export function VideoFrame() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="relative"
    >
      {/* Frame container */}
      <div className="relative rounded-2xl border-2 border-cyan-400/50 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm p-1 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
        {/* Corner decorations - using O icon motif */}
        <div className="absolute -top-3 -left-3 drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]">
          <OIcon size={24} gradientVariant="purple-blue" />
        </div>
        <div className="absolute -top-3 -right-3 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]">
          <OIcon size={24} gradientVariant="blue-cyan" />
        </div>
        <div className="absolute -bottom-3 -left-3 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
          <OIcon size={24} gradientVariant="cyan-green" />
        </div>
        <div className="absolute -bottom-3 -right-3 drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]">
          <OIcon size={24} gradientVariant="purple-pink" />
        </div>

        {/* Content */}
        <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-8">
          {/* Placeholder for team image */}
          <div className="aspect-video bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg mb-6 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
            SHAPING
            <br />
            TOMORROW TOGETHER
          </h2>

          {/* CTA Button */}
          <div className="text-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300"
            >
              DISCOVER OUR VISION
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
