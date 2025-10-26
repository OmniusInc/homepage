'use client';

import { TiledBackground3D } from './TiledBackground3D';

export function Background3D() {
  return (
    <div className="fixed inset-0 -z-10">
      {/* Tiled background with plate-shaped particles */}
      <TiledBackground3D />
    </div>
  );
}
