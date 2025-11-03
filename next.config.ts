import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ビルド時の型チェックをスキップ
  },
  eslint: {
    ignoreDuringBuilds: true, // ビルド時のESLintをスキップ
  },
};

export default nextConfig;
