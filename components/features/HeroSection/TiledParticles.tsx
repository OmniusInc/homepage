'use client';

import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';
import Image from 'next/image';
import { useSpring, animated, config } from '@react-spring/three';
import { useRouter } from 'next/navigation';
import { ContactFormContent } from '@/components/features/ContactForm';

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
export const TAB_SECTIONS: TabSectionConfig[] = [
  {
    label: 'About Us ›',
    sections: [
      {
        title: 'ビジョン',
        content: (
          <div className="w-full h-full flex flex-col justify-center items-center px-16 py-12">
            {/* 上部: ロゴ */}
            <div className="mb-12">
              <Image
                src="/images/logo_blackback.png"
                alt="Omnius"
                width={600}
                height={180}
                className="company-logo"
              />
            </div>

            {/* 中央: キャッチフレーズ */}
            <h2 className="text-7xl font-black mb-10 leading-tight text-center">
              <span className="block text-white">全ての英知で</span>
              <span className="block bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                私たちの未来を切り拓く
              </span>
            </h2>

            {/* 下部: サポートテキスト */}
            <p className="text-2xl text-gray-300 leading-relaxed text-center">
              AI技術を活用した教育とDX支援を通じて<br/>
              個人と企業の可能性を最大化します。
            </p>
          </div>
        ),
      },
      {
        title: 'ミッション',
        content: (
          <div className="w-full h-full flex flex-col justify-center px-16 py-12">
            {/* ラベル */}
            <div className="text-2xl lg:text-4xl uppercase tracking-widest text-blue-400 mb-8">
              Mission
            </div>

            {/* メイン文章 */}
            <h2 className="text-4xl lg:text-7xl font-black text-white leading-tight mb-10">
              AI教育とDX支援で<br/>可能性を最大化
            </h2>

            {/* サポート文 */}
            <p className="text-xl lg:text-3xl text-gray-300 leading-relaxed max-w-4xl">
              最先端のAI技術と深い業界知見を融合させ、<br/>
              実践的な教育プログラムと<br/>
              コンサルティングサービスを提供
            </p>
          </div>
        ),
      },
      {
        title: 'バリュー',
        content: (
          <div className="w-full h-full flex flex-col justify-center px-16 py-12">
            {/* ラベル */}
            <div className="text-2xl lg:text-4xl uppercase tracking-widest text-purple-400 mb-8">
              Value
            </div>

            {/* メイン文章 */}
            <h2 className="text-4xl lg:text-7xl font-black text-white leading-tight mb-10">
              革新し、創造し、<br/>先導する
            </h2>

            {/* サポート文 */}
            <p className="text-xl lg:text-3xl text-gray-300 leading-relaxed max-w-4xl">
              常に最先端の技術と知識を追求し、<br/>
              新しい価値を創造することで業界をリード
            </p>
          </div>
        ),
      },
      {
        title: '事業内容',
        content: (
          <div className="w-full h-full flex flex-col p-16">
            {/* ヘッダー */}
            <div className="mb-16">
              <h2 className="text-6xl font-black text-white mb-4">Our Business</h2>
              <p className="text-xl text-gray-400">3つの事業で、変革を支援する</p>
            </div>

            {/* グリッドレイアウト */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
              {/* AIアカデミア */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-blue-900/10 backdrop-blur-sm border border-blue-500/30 hover:border-blue-400 transition-all duration-500 p-10 flex flex-col">
                <div className="text-8xl font-black text-blue-500/50 mb-4">01</div>
                <h3 className="text-3xl font-bold text-white mb-6">AI Academia</h3>
                <p className="text-lg text-gray-300 leading-relaxed flex-1">
                  実務で使えるAI技術を体系的に学べる教育プログラム。<br/>
                  現場で即戦力となる人材を育成します。
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
              </div>

              {/* DXコンサルティング */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-500/20 to-cyan-900/10 backdrop-blur-sm border border-cyan-500/30 hover:border-cyan-400 transition-all duration-500 p-10 flex flex-col">
                <div className="text-8xl font-black text-cyan-500/50 mb-4">02</div>
                <h3 className="text-3xl font-bold text-white mb-6">DX Consulting</h3>
                <p className="text-lg text-gray-300 leading-relaxed flex-1">
                  企業のデジタル変革を戦略から実行まで一貫してサポート。<br/>
                  AI・データ活用による新たな価値創造を実現します。
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
              </div>

              {/* システム開発 */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-blue-900/10 backdrop-blur-sm border border-blue-500/30 hover:border-blue-400 transition-all duration-500 p-10 flex flex-col">
                <div className="text-8xl font-black text-blue-500/50 mb-4">03</div>
                <h3 className="text-3xl font-bold text-white mb-6">System Development</h3>
                <p className="text-lg text-gray-300 leading-relaxed flex-1">
                  最新技術で課題を解決し、ビジネスを加速させるシステム開発をトータルサポート。
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    label: 'Members ›',
    sections: [
      {
        title: '役員一覧',
        content: (
          <div className="w-full h-full flex flex-col">
            {/* ヘッダー */}
            <div className="mb-6 pt-12">
              <h2 className="text-5xl font-black text-white mb-3">Leadership Team</h2>
              <p className="text-lg text-gray-400">経営チーム & 求める人物像</p>
            </div>

            {/* 2x2 グリッド: Leadership Team */}
            <div className="leadership-grid grid grid-cols-2 grid-rows-2 gap-6 flex-1 pb-12">
              {/* 吉川綜一 */}
              <div
                className="relative overflow-hidden bg-gradient-to-br from-blue-600/25 to-blue-900/15 backdrop-blur-sm border border-blue-500/30 p-8 flex flex-col hover:border-blue-400 transition-all duration-500"
                data-member-name="吉川綜一"
              >
                <h3 className="text-3xl font-black text-white mb-4">吉川綜一</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  社長。Omniusの創業者として、ビジョン策定と組織全体の戦略を統括。
                  [プロフィール準備中]
                </p>
                <div className="absolute top-8 right-8 text-9xl font-black text-blue-500/10">Y</div>
              </div>

              {/* 宮嶋大輔 */}
              <div
                className="relative overflow-hidden bg-gradient-to-br from-cyan-600/25 to-cyan-900/15 backdrop-blur-sm border border-cyan-500/30 flex hover:border-cyan-400 transition-all duration-500"
                data-member-name="宮嶋大輔"
              >
                <div className="w-1/3 h-full relative overflow-hidden border-r border-cyan-400/40">
                  <Image
                    src="/images/Member_Daisuke_M.png"
                    alt="宮嶋大輔"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 p-8 flex flex-col justify-center">
                  <h3 className="text-3xl font-black text-white mb-2">宮嶋大輔</h3>
                  <p className="text-lg text-cyan-300 mb-4">CEO</p>
                  <p className="text-base text-gray-300 leading-relaxed">
                    データサイエンスとAI技術のスペシャリスト。 MUFG優勝、デロイト金賞受賞。
                  </p>
                </div>
                <div className="absolute top-8 right-8 text-9xl font-black text-cyan-500/10">M</div>
              </div>

              {/* 田中丈士 */}
              <div
                className="relative overflow-hidden bg-gradient-to-br from-cyan-600/25 to-cyan-900/15 backdrop-blur-sm border border-cyan-500/30 flex hover:border-cyan-400 transition-all duration-500"
                data-member-name="田中丈士"
              >
                <div className="w-1/3 h-full relative overflow-hidden border-r border-cyan-400/40">
                  <Image
                    src="/images/Member_Hiroshi_T.png"
                    alt="田中丈士"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 p-8 flex flex-col justify-center">
                  <h3 className="text-3xl font-black text-white mb-2">田中丈士</h3>
                  <p className="text-lg text-cyan-300 mb-4">副社長</p>
                  <p className="text-base text-gray-300 leading-relaxed">
                    WEB開発とSalesforce開発のスペシャリスト。技術戦略を担当。
                  </p>
                </div>
                <div className="absolute top-8 right-8 text-9xl font-black text-cyan-500/10">T</div>
              </div>

              {/* 宮崎悠 */}
              <div
                className="relative overflow-hidden bg-gradient-to-br from-blue-600/25 to-blue-900/15 backdrop-blur-sm border border-blue-500/30 p-8 flex flex-col hover:border-blue-400 transition-all duration-500"
                data-member-name="宮崎悠"
              >
                <h3 className="text-3xl font-black text-white mb-4">宮崎悠</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  取締役。組織運営と事業開発を統括。 [プロフィール準備中]
                </p>
                <div className="absolute top-8 right-8 text-9xl font-black text-blue-500/10">M</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: '宮嶋大輔',
        content: (
          <div className="w-full h-full flex px-8">
            {/* 左側：プロフィール */}
            <div className="w-2/5 h-full flex flex-col py-8 bg-gradient-to-br from-cyan-950/40 to-transparent">
              <div className="px-8 mb-4 flex justify-center">
                <div className="w-11/12 aspect-square relative overflow-hidden border-4 border-cyan-400/30">
                  <Image
                    src="/images/Member_Daisuke_M.png"
                    alt="宮嶋大輔"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="px-8 text-center">
                <h2 className="text-4xl font-black text-white mb-2">宮嶋大輔</h2>
                <p className="text-xl text-cyan-300 font-bold mb-3">CEO</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  データサイエンスとAI技術を駆使し、<br/>ビジネス課題を解決するスペシャリスト。
                </p>
              </div>
            </div>

            {/* 右側：実績・専門分野 */}
            <div className="w-3/5 h-full flex flex-col justify-center px-12 py-8">
              <div className="space-y-10">
                {/* 実績 */}
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-cyan-400 mb-4">
                    Achievements
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex gap-4 items-start">
                      <span className="text-5xl font-black text-cyan-500/30">01</span>
                      <div>
                        <p className="text-xl text-white font-bold">
                          MUFG Data Science Championship 2023
                        </p>
                        <p className="text-lg text-gray-400">優勝</p>
                      </div>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="text-5xl font-black text-cyan-500/30">02</span>
                      <div>
                        <p className="text-xl text-white font-bold">
                          Deloitte Analytics Competition
                        </p>
                        <p className="text-lg text-gray-400">金賞受賞</p>
                      </div>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="text-5xl font-black text-cyan-500/30">03</span>
                      <div>
                        <p className="text-xl text-white font-bold">AI導入プロジェクト</p>
                        <p className="text-lg text-gray-400">大手企業向け多数</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* 専門分野 */}
                <div className="border-t border-cyan-500/30 pt-8">
                  <h3 className="text-sm uppercase tracking-widest text-cyan-400 mb-4">
                    Expertise
                  </h3>
                  <p className="text-xl text-gray-300">
                    機械学習、深層学習、データ分析、ビジネス戦略
                  </p>
                </div>

                {/* メッセージ */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-transparent p-8 border-l-4 border-cyan-400">
                  <p className="text-2xl italic text-cyan-100 leading-relaxed">
                    「AIの民主化を通じて、誰もがデータドリブンな意思決定ができる社会を実現する」
                  </p>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: '田中丈士',
        content: (
          <div className="w-full h-full flex px-8">
            {/* 左側：プロフィール */}
            <div className="w-2/5 h-full flex flex-col py-8 bg-gradient-to-br from-blue-950/40 to-transparent">
              <div className="px-8 mb-4 flex justify-center">
                <div className="w-11/12 aspect-square relative overflow-hidden border-4 border-blue-400/30">
                  <Image
                    src="/images/Member_Hiroshi_T.png"
                    alt="田中丈士"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="px-8 text-center">
                <h2 className="text-4xl font-black text-white mb-2">田中丈士</h2>
                <p className="text-xl text-blue-300 font-bold mb-3">副社長</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Web・SNS・Salesforceなど、<br/>設計から実装・収益化まで一貫して手がける<br/>フルスタックエンジニア。
                </p>
              </div>
            </div>

            {/* 右側：実績・専門分野 */}
            <div className="w-3/5 h-full flex flex-col justify-center px-12 py-8">
              <div className="space-y-10">
                {/* 実績 */}
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-blue-400 mb-4">
                    Achievements
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex gap-4 items-start">
                      <span className="text-5xl font-black text-blue-500/30">01</span>
                      <div>
                        <p className="text-xl text-white font-bold">Salesforce実装プロジェクト</p>
                        <p className="text-lg text-gray-400">PM経験多数</p>
                      </div>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="text-5xl font-black text-blue-500/30">02</span>
                      <div>
                        <p className="text-xl text-white font-bold">
                          大規模WEBアプリケーション開発
                        </p>
                        <p className="text-lg text-gray-400">リード</p>
                      </div>
                    </li>
                    <li className="flex gap-4 items-start">
                      <span className="text-5xl font-black text-blue-500/30">03</span>
                      <div>
                        <p className="text-xl text-white font-bold">DX推進コンサルティング</p>
                        <p className="text-lg text-gray-400">戦略から実装まで</p>
                      </div>
                    </li>
                  </ul>
                </div>

                {/* 専門分野 */}
                <div className="border-t border-blue-500/30 pt-8">
                  <h3 className="text-sm uppercase tracking-widest text-blue-400 mb-4">
                    Expertise
                  </h3>
                  <p className="text-xl text-gray-300">
                    WEB開発（Next.js, React）、Salesforce、プロジェクトマネジメント
                  </p>
                </div>

                {/* メッセージ */}
                <div className="bg-gradient-to-r from-blue-500/10 to-transparent p-8 border-l-4 border-blue-400">
                  <p className="text-2xl italic text-blue-100 leading-relaxed">
                    「技術で事業を加速させ、使う人すべてに価値を届けるシステムを創る」
                  </p>
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    label: 'Careers ›',
    sections: [
      {
        title: '募集職種',
        content: (
          <div className="w-full h-full flex flex-col p-16">
            {/* ヘッダー */}
            <div className="mb-16">
              <h2 className="text-6xl font-black text-white mb-4">Join Us</h2>
              <p className="text-xl text-gray-400">共に未来を創る仲間を募集</p>
            </div>

            {/* グリッド */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
              {/* AIエンジニア */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/30 to-blue-900/20 backdrop-blur-sm border border-blue-500/40 p-10 flex flex-col group hover:border-blue-400 transition-all duration-500">
                <div className="text-8xl font-black text-blue-500/50 mb-6">AI</div>
                <h3 className="text-3xl font-bold text-white mb-4">AI Engineer</h3>
                <p className="text-lg text-gray-400 mb-2">データサイエンティスト</p>
                <p className="text-base text-gray-300 leading-relaxed flex-1">
                  機械学習モデルの開発から実装、データ分析基盤の構築まで。
                  最先端のAI技術で社会課題を解決するポジション。
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
              </div>

              {/* システムエンジニア */}
              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600/30 to-cyan-900/20 backdrop-blur-sm border border-cyan-500/40 p-10 flex flex-col group hover:border-cyan-400 transition-all duration-500">
                <div className="text-8xl font-black text-cyan-500/50 mb-6">SE</div>
                <h3 className="text-3xl font-bold text-white mb-4">System Engineer</h3>
                <p className="text-lg text-gray-400 mb-2">フルスタック開発者</p>
                <p className="text-base text-gray-300 leading-relaxed flex-1">
                  WEB開発、Salesforce開発、インフラ構築など。
                  幅広い技術領域でクライアントの課題解決を支援。
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-transparent"></div>
              </div>

              {/* ビジネス職 */}
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/30 to-blue-900/20 backdrop-blur-sm border border-blue-500/40 p-10 flex flex-col group hover:border-blue-400 transition-all duration-500">
                <div className="text-8xl font-black text-blue-500/50 mb-6">Biz</div>
                <h3 className="text-3xl font-bold text-white mb-4">Business</h3>
                <p className="text-lg text-gray-400 mb-2">事業成長のドライバー</p>
                <p className="text-base text-gray-300 leading-relaxed flex-1">
                  営業、マーケティング、事業企画、講師など。
                  事業成長とクライアント価値創出をリード。
                </p>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent"></div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: '求める人物像',
        content: (
          <div className="w-full h-full flex flex-col p-16">
            {/* ヘッダー */}
            <div className="mb-16">
              <h2 className="text-6xl font-black text-white mb-4">Who We Want</h2>
              <p className="text-xl text-gray-400">こんな方を歓迎します</p>
            </div>

            {/* 2x2 グリッド */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/25 to-blue-900/15 backdrop-blur-sm border border-blue-500/30 p-8 flex flex-col hover:border-blue-400 transition-all duration-500">
                <h3 className="text-3xl font-black text-white mb-4">旺盛な好奇心</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  新しい技術やビジネス領域に興味を持ち、自ら学び続ける姿勢。
                  変化を楽しみ、チャレンジを恐れない方。
                </p>
                <div className="absolute top-8 right-8 text-9xl font-black text-blue-500/10">C</div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600/25 to-cyan-900/15 backdrop-blur-sm border border-cyan-500/30 p-8 flex flex-col hover:border-cyan-400 transition-all duration-500">
                <h3 className="text-3xl font-black text-white mb-4">成長志向</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  失敗を恐れず、経験から学び、スキルを磨き続ける。
                  自己成長とチーム成長の両立を目指す方。
                </p>
                <div className="absolute top-8 right-8 text-9xl font-black text-cyan-500/10">G</div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600/25 to-cyan-900/15 backdrop-blur-sm border border-cyan-500/30 p-8 flex flex-col hover:border-cyan-400 transition-all duration-500">
                <h3 className="text-3xl font-black text-white mb-4">課題解決力</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  本質的な課題を見抜き、創造的な解決策を提案・実行できる。
                  論理的思考と実行力を兼ね備えた方。
                </p>
                <div className="absolute top-8 right-8 text-9xl font-black text-cyan-500/10">P</div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/25 to-blue-900/15 backdrop-blur-sm border border-blue-500/30 p-8 flex flex-col hover:border-blue-400 transition-all duration-500">
                <h3 className="text-3xl font-black text-white mb-4">チームワーク</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  多様な専門性を持つメンバーと協働し、 互いの強みを活かして価値を創出できる方。
                </p>
                <div className="absolute top-8 right-8 text-9xl font-black text-blue-500/10">T</div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: '働く環境',
        content: (
          <div className="w-full h-full flex flex-col p-16">
            {/* ヘッダー */}
            <div className="mb-16">
              <h2 className="text-6xl font-black text-white mb-4">Work Environment</h2>
              <p className="text-xl text-gray-400">成長を加速する環境</p>
            </div>

            {/* 2x2 グリッド */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/25 to-blue-900/15 backdrop-blur-sm border border-blue-500/30 p-8 flex flex-col hover:border-blue-400 transition-all duration-500">
                <h3 className="text-3xl font-black text-white mb-4">フラットな組織文化</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  役職や年次に関係なく、アイデアや意見を自由に発信できる環境。
                </p>
                <div className="absolute bottom-8 right-8 text-9xl font-black text-blue-500/10">
                  F
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600/25 to-cyan-900/15 backdrop-blur-sm border border-cyan-500/30 p-8 flex flex-col hover:border-cyan-400 transition-all duration-500">
                <h3 className="text-3xl font-black text-white mb-4">最先端技術への挑戦</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  AI、機械学習、クラウド技術など、常に最新の技術にアクセス。
                </p>
                <div className="absolute bottom-8 right-8 text-9xl font-black text-cyan-500/10">
                  T
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600/25 to-cyan-900/15 backdrop-blur-sm border border-cyan-500/30 p-8 flex flex-col hover:border-cyan-400 transition-all duration-500">
                <h3 className="text-3xl font-black text-white mb-4">柔軟な働き方</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  リモートワーク可、フレックス制度など、個々のライフスタイルに合わせた働き方。
                </p>
                <div className="absolute bottom-8 right-8 text-9xl font-black text-cyan-500/10">
                  W
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600/25 to-blue-900/15 backdrop-blur-sm border border-blue-500/30 p-8 flex flex-col hover:border-cyan-400 transition-all duration-500">
                <h3 className="text-3xl font-black text-white mb-4">充実した研修制度</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  社内勉強会、外部セミナー参加支援、資格取得支援など。
                </p>
                <div className="absolute bottom-8 right-8 text-9xl font-black text-blue-500/10">
                  E
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: '応募について',
        content: (
          <div className="w-full h-full flex flex-col lg:flex-row p-16">
            {/* 左側：選考フロー */}
            <div className="w-full lg:w-1/2 mb-16 lg:mb-0 lg:pr-8">
              <h2 className="text-6xl font-black text-white mb-4 pb-8">Application</h2>
            <div/>

              <div className="space-y-8">
                <h3 className="text-sm uppercase tracking-widest text-blue-400 mb-6">
                  Selection Process
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-6 items-center">
                    <span className="text-6xl font-black text-blue-500/50">01</span>
                    <div>
                      <p className="text-2xl text-white font-bold">個別面談</p>
                      <p className="text-lg text-gray-400">希望・スキルのヒアリング</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-center">
                    <span className="text-6xl font-black text-cyan-500/50">02</span>
                    <div>
                      <p className="text-2xl text-white font-bold">集団説明会</p>
                      <p className="text-lg text-gray-400">事業内容・働き方の紹介</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-center">
                    <span className="text-6xl font-black text-blue-500/50">03</span>
                    <div>
                      <p className="text-2xl text-white font-bold">研修</p>
                      <p className="text-lg text-gray-400">必要スキルの習得</p>
                    </div>
                  </div>
                  <div className="flex gap-6 items-center">
                    <span className="text-6xl font-black text-cyan-500/50">04</span>
                    <div>
                      <p className="text-2xl text-white font-bold">配属</p>
                      <p className="text-lg text-gray-400">プロジェクトへの参加</p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-8 lg:text-sm">
                  ※状況により変更になる場合があります
                </p>
              </div>
            </div>

            {/* 右側：待遇・福利厚生 */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center lg:pl-8">
              <div className="space-y-12">
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-cyan-400 mb-6">Benefits</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-4">
                      <span className="text-3xl text-cyan-400">✓</span>
                      <div>
                        <p className="text-xl text-white">報酬</p>
                        <p className="text-lg text-gray-400">成果・スキルに応じて決定（要相談）</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="text-3xl text-cyan-400">✓</span>
                      <p className="text-xl text-white">AIを用いた実践的な自動化経験</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="text-3xl text-cyan-400">✓</span>
                      <p className="text-xl text-white">システム開発経験</p>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="text-3xl text-cyan-400">✓</span>
                      <p className="text-xl text-white">リモートワーク可</p>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-8 border-l-4 border-cyan-400">
                  <p className="text-2xl font-bold mb-3 text-cyan-100">
                    まずはお気軽にお問い合わせください
                  </p>
                  <p className="text-lg text-gray-200 mb-6">
                    カジュアル面談も実施しています。詳細は Contact からお問い合わせください。
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // カスタムイベントを発火してContactタイルを選択
                      window.dispatchEvent(new CustomEvent('selectContactTile'));
                    }}
                    className="bg-gradient-to-r from-blue-600/75 to-cyan-500/75 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600/90 hover:to-cyan-500/90 transition-all shadow-lg shadow-cyan-500/30 backdrop-blur-sm border border-cyan-500/30"
                  >
                    お問い合わせフォームへ
                  </button>
                </div>
              </div>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    label: 'Contact ›',
    sections: [
      {
        title: 'お問い合わせ',
        content: (
          <div className="w-full h-full flex p-16">
            {/* 左側：お問い合わせ情報 */}
            <div className="w-1/3 h-full flex flex-col justify-start pr-12 pt-16">
              <h2 className="text-6xl font-black text-white mb-4">Contact</h2>
              <p className="text-3xl font-bold text-cyan-400 mb-8">お問い合わせ</p>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                サービスに関するご相談、お見積もり、採用・インターンシップのお問い合わせなど、
                お気軽にご連絡ください。
              </p>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm uppercase tracking-widest text-cyan-400 mb-3">
                    Response Time
                  </h3>
                  <p className="text-lg text-gray-300">通常2営業日以内にご返信いたします</p>
                </div>
              </div>
            </div>

            {/* 右側：お問い合わせフォーム（中央と右ブロック連結） */}
            <div className="w-2/3 h-full flex flex-col justify-start pl-12 pt-16">
              <ContactFormContent />
            </div>
          </div>
        ),
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
  tileIndex,
  mousePosition,
  isRectangle = false,
  tileWidth = 10,
  tileHeight = 8.5,
  label,
  catchChar,
  iconPath,
  onTileClick,
  selectedTile,
  currentSectionIndex,
  sectionRotation,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  baseZ: number;
  normalizedX: number;
  normalizedY: number;
  colIndex: number;
  tileIndex: number;
  mousePosition: { x: number; y: number };
  isRectangle?: boolean;
  tileWidth?: number;
  tileHeight?: number;
  label?: string;
  catchChar?: string;
  iconPath?: string;
  onTileClick?: (label: string) => void;
  selectedTile?: string | null;
  currentSectionIndex?: number;
  sectionRotation?: number;
}) {
  const tileRef = useRef<THREE.Group>(null);
  const waveRef = useRef<THREE.Group>(null);
  const { camera, viewport } = useThree();
  const isSelected = selectedTile === label;
  const hoverZRef = useRef(0); // ホバー時のZ位置を滑らかに補間するための ref
  const frameCountRef = useRef(0); // フレームカウンター（パフォーマンス最適化用）

  // パフォーマンス最適化: 静的な値をメモ化
  const tileOpacity = useMemo(() => {
    const isSpecialTile = Boolean(label || catchChar);
    return isSpecialTile ? 0.9 : 1.0;
  }, [label, catchChar]);

  // パフォーマンス最適化: クリック処理をメモ化
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (label && onTileClick && !isSelected) {
        e.stopPropagation();
        onTileClick(label);
      }
    },
    [label, onTileClick, isSelected]
  );

  // パフォーマンス最適化: タイルサイズをメモ化
  const scaledTileWidth = useMemo(
    () => (isSelected ? (tileWidth * 2) / 3 : tileWidth),
    [isSelected, tileWidth]
  );
  const scaledTileHeight = useMemo(() => (isSelected ? tileHeight : tileHeight), [isSelected, tileHeight]);

  // アニメーションスプリング
  // スケール倍率は1倍（タイルサイズ自体を変更する）
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

    // パフォーマンス最適化: フレームスキップ（3フレームに1回、タイルごとに異なるタイミング）
    frameCountRef.current++;
    if (frameCountRef.current % 3 !== tileIndex % 3) return;

    // 選択されている場合、またはアニメーション中は、useFrameでの操作をスキップ
    if (!selectedTile && waveRef.current) {
      // 選択されていない場合のみ波のアニメーションを実行
      // マウス位置との距離を計算
      const dx = position[0] - mousePosition.x;
      const dy = position[1] - mousePosition.y;

      // マウスがタイルの上にあるかをチェック（長方形タイルのみ反応）
      const tileHalfWidth = tileWidth / 2;
      const tileHalfHeight = tileHeight / 2;
      const isHovered =
        isRectangle && Math.abs(dx) < tileHalfWidth && Math.abs(dy) < tileHalfHeight;

      // 波のアニメーション用の正規化座標
      // 長方形タイルの場合は、実際の3D空間での位置を使用して中心基準で計算
      const waveNormalizedX = normalizedX;
      const waveNormalizedY = normalizedY;

      // パフォーマンス最適化: Math.sin/cos を fastSin/fastCos に置き換え
      // 波のアニメーション - ゆっくりとした動き
      const wave1 =
        fastSin(state.clock.elapsedTime * 0.8 + waveNormalizedX * 5 + waveNormalizedY * 3) * 0.8;
      const wave2 =
        fastSin(state.clock.elapsedTime * 0.5 + waveNormalizedX * 3 - waveNormalizedY * 4) * 0.5;
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
          fastCos(state.clock.elapsedTime * 0.8 + waveNormalizedX * 5 + waveNormalizedY * 3) *
          5 *
          0.8;
        const waveGradientY =
          fastCos(state.clock.elapsedTime * 0.8 + waveNormalizedX * 5 + waveNormalizedY * 3) *
          3 *
          0.8;

        // 第2の波の勾配を計算（90度方向の回転用）
        const wave2GradientX =
          fastCos(state.clock.elapsedTime * 0.5 + waveNormalizedX * 3 - waveNormalizedY * 4) *
          3 *
          0.5;
        const wave2GradientY =
          fastCos(state.clock.elapsedTime * 0.5 + waveNormalizedX * 3 - waveNormalizedY * 4) *
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
          args={[scaledTileWidth, scaledTileHeight, 0.255]}
          radius={0.425}
          smoothness={8}
          onClick={isSelected ? undefined : handleClick}
          onPointerOver={() => label && !isSelected && (document.body.style.cursor = 'pointer')}
          onPointerOut={() => !isSelected && (document.body.style.cursor = 'default')}
        >
          <animated.meshPhysicalMaterial
            color="#6ab8d8"
            transparent
            opacity={typeof opacity === 'number' ? opacity * tileOpacity : tileOpacity}
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
        {/* セクション内容は3D空間外のDOMで表示するため、ここでは表示しない */}
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
}: {
  mousePosition: { x: number; y: number };
  onTileClick: (label: string) => void;
  selectedTile: string | null;
  currentSectionIndex: number;
  sectionRotation: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // タイルを直接レンダリング
  const tiles = [];
  const tileSize = 8.5; // タイルのサイズ（10 × 0.85）
  const spacing = 9.01; // タイル間の間隔（10.6 × 0.85）
  const rows = 14; // 軽量化のため削減（20 → 14）
  const cols = 18; // 軽量化のため削減（28 → 18）

  let tileIndex = 0; // パフォーマンス最適化: フレームスキップ用のインデックス

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // 中央付近のタイル4つを縦に並べる（各横3つ分）
      const centerRow = Math.floor(rows / 2);
      const centerCol = Math.floor(cols / 2);

      // 各タブタイルの左上の位置（上から下へ、左に4つ、下に2つ移動）
      const isTopTile = row === centerRow - 1 && col === centerCol - 6; // 一番上
      const isSecondTile = row === centerRow - 2 && col === centerCol - 6; // 2番目
      const isThirdTile = row === centerRow - 3 && col === centerCol - 6; // 3番目
      const isBottomTile = row === centerRow - 4 && col === centerCol - 6; // 一番下

      // スキップするタイル：各大きなタイルの右2列をスキップ
      const isSkippedTile =
        // 一番上タイルの右2列
        (row === centerRow - 1 && (col === centerCol - 5 || col === centerCol - 4)) ||
        // 2番目タイルの右2列
        (row === centerRow - 2 && (col === centerCol - 5 || col === centerCol - 4)) ||
        // 3番目タイルの右2列
        (row === centerRow - 3 && (col === centerCol - 5 || col === centerCol - 4)) ||
        // 一番下タイルの右2列
        (row === centerRow - 4 && (col === centerCol - 5 || col === centerCol - 4));

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

      const isRectangle = isTopTile || isSecondTile || isThirdTile || isBottomTile;
      // 横3つ分のタイル：幅 = 3タイル分、高さ = 1タイル分
      const tileWidth = isRectangle ? tileSize * 3 + (spacing - tileSize) * 2 : tileSize;
      const tileHeight = isRectangle ? tileSize : tileSize;

      // 大きなタイルの位置を調整（中心が左上の位置になるように右にシフト）
      const adjustedX = isRectangle ? x + spacing : x;
      const adjustedY = isRectangle ? y : y;

      // 長方形タイルの場合、実際の位置を基準にnormalizedXを再計算
      const adjustedNormalizedX = isRectangle ? adjustedX / ((cols / 2) * spacing) : normalizedX;

      // 長方形タイルの曲率とY軸回転も、調整後の位置を基準に再計算
      const adjustedCurvature = isRectangle
        ? adjustedNormalizedX * adjustedNormalizedX * 36
        : curvature;
      const adjustedTileRotationY = isRectangle ? -adjustedNormalizedX * 0.6 : tileRotationY;

      // 各長方形タイルのラベルを定義（上から下へ）
      let label: string | undefined;
      if (isTopTile) {
        label = 'About Us ›';
      } else if (isSecondTile) {
        label = 'Members ›';
      } else if (isThirdTile) {
        label = 'Careers ›';
      } else if (isBottomTile) {
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
          position={[adjustedX, adjustedY, 0]}
          rotation={[0, adjustedTileRotationY, 0]}
          baseZ={adjustedCurvature}
          normalizedX={adjustedNormalizedX}
          normalizedY={normalizedY}
          colIndex={col}
          tileIndex={tileIndex}
          mousePosition={mousePosition}
          isRectangle={isRectangle}
          tileWidth={tileWidth}
          tileHeight={tileHeight}
          label={label}
          catchChar={catchChar}
          iconPath={iconPath}
          onTileClick={onTileClick}
          selectedTile={selectedTile}
          currentSectionIndex={currentSectionIndex}
          sectionRotation={sectionRotation}
        />
      );
      tileIndex++; // パフォーマンス最適化: インデックスをインクリメント
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
}: {
  selectedTile: string | null;
  onTileClick: (label: string) => void;
  currentSectionIndex: number;
  sectionRotation: number;
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
      />
    </>
  );
}

/**
 * タブラベルからクエリパラメータへの変換マップ
 */
const TAB_LABEL_TO_QUERY: Record<string, string> = {
  'About Us ›': 'about-us',
  'Members ›': 'members',
  'Careers ›': 'careers',
  'Contact ›': 'contact',
};

export function TiledParticles({ onTileSelect }: { onTileSelect?: (tile: string | null) => void }) {
  const router = useRouter();

  // クリック拡大処理
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  // セクション管理
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  // 回転角度を独立管理（アニメーション用）
  const [rotationDegrees, setRotationDegrees] = useState(0);
  // タイル選択直後のフラグ（クリックイベント重複防止）
  const justSelectedRef = useRef(false);
  // コンテンツ表示フラグ（スケールアニメーション完了後に表示）
  const [showContent, setShowContent] = useState(false);

  const handleTileClick = (label: string) => {
    setSelectedTile(label);
    setCurrentSectionIndex(0); // タイル選択時は必ずセクション0から
    setRotationDegrees(0); // 回転角度もリセット
    setShowContent(false); // コンテンツは非表示
    justSelectedRef.current = true; // 直後フラグを立てる
    onTileSelect?.(label);

    // URLにクエリパラメータを追加（/は付けない）
    const queryValue = TAB_LABEL_TO_QUERY[label];
    if (queryValue) {
      router.push(`?tab=${queryValue}`);
    }

    // スケールアニメーション完了後にコンテンツを表示（600ms後）
    setTimeout(() => {
      setShowContent(true);
    }, 600);

    // 少し遅延してフラグをリセット
    setTimeout(() => {
      justSelectedRef.current = false;
    }, 100);
  };

  const handleTileClose = () => {
    setSelectedTile(null);
    setCurrentSectionIndex(0);
    setRotationDegrees(0);
    setShowContent(false); // コンテンツも非表示に
    onTileSelect?.(null);

    // クエリパラメータを削除してトップに戻る
    router.push('/');
  };

  // カスタムイベントをリッスンしてContactタイルを選択
  useEffect(() => {
    const handleSelectContact = () => {
      handleTileClick('Contact ›');
    };

    window.addEventListener('selectContactTile', handleSelectContact);
    return () => {
      window.removeEventListener('selectContactTile', handleSelectContact);
    };
  }, []);

  // 画面クリックでセクションを進める
  const handleScreenClick = () => {
    if (!selectedTile) return;

    // タイル選択直後は無視（クリックイベント重複防止）
    if (justSelectedRef.current) return;

    const currentTab = TAB_SECTIONS.find((tab) => tab.label === selectedTile);
    if (!currentTab) return;

    const totalSections = currentTab.sections.length;
    const nextIndex = currentSectionIndex + 1;

    if (nextIndex < totalSections) {
      // まず回転アニメーションを開始
      const nextRotation = rotationDegrees + 180;
      setRotationDegrees(nextRotation);

      // 回転アニメーションの半分（300ms）が経過してからセクションを更新
      // これにより、タイルが裏側に回ってから新しいコンテンツが表示される
      setTimeout(() => {
        setCurrentSectionIndex(nextIndex);
      }, 300);
    } else {
      // 全セクション終了後は閉じる
      handleTileClose();
    }
  };

  // 回転角度をラジアンに変換（3Dタイル用）
  // 度数をラジアンに変換: degrees * (Math.PI / 180)
  const sectionRotation = rotationDegrees * (Math.PI / 180);

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
          />
        </Canvas>
      </div>

      {/* コンテンツオーバーレイ（Canvas外のDOM要素として表示） */}
      {selectedTile && showContent && (
        <div
          className="fixed flex items-center justify-center pointer-events-none"
          style={{
            zIndex: 10,
            left: '5vw',
            right: '5vw',
            top: '18vh',
            bottom: '18vh',
          }}
          onClick={handleScreenClick}
        >
          <div
            className="pointer-events-auto"
            style={{
              transformStyle: 'preserve-3d',
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={handleScreenClick}
          >
            {/* 表面（偶数セクション用） */}
            <div
              style={{
                position: 'absolute',
                backfaceVisibility: 'hidden',
                transform: `rotateX(${rotationDegrees}deg)`,
                transition: 'transform 0.6s ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={handleScreenClick}
            >
              {currentSectionIndex % 2 === 0 && (
                <div
                  onClick={handleScreenClick}
                  style={{
                    cursor: 'pointer',
                    animation: 'fadeIn 0.6s ease forwards',
                  }}
                >
                  {TAB_SECTIONS.find((tab) => tab.label === selectedTile)?.sections[
                    currentSectionIndex
                  ]?.content || <div className="text-white text-4xl">No content</div>}
                </div>
              )}
            </div>
            {/* 裏面（奇数セクション用） */}
            <div
              style={{
                position: 'absolute',
                backfaceVisibility: 'hidden',
                transform: `rotateX(${rotationDegrees + 180}deg)`,
                transition: 'transform 0.6s ease',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={handleScreenClick}
            >
              {currentSectionIndex % 2 === 1 && (
                <div
                  onClick={handleScreenClick}
                  style={{
                    cursor: 'pointer',
                    animation: 'fadeIn 0.6s ease forwards',
                  }}
                >
                  {TAB_SECTIONS.find((tab) => tab.label === selectedTile)?.sections[
                    currentSectionIndex
                  ]?.content || <div className="text-white text-4xl">No content</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
