'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MobileTiledBackground } from './MobileTiledBackground';

interface Section {
  title: string;
  content: JSX.Element;
}

interface TabGroup {
  tabLabel: string;
  sections: Section[];
}

interface MobileViewProps {
  tabGroups: TabGroup[];
}

type ViewState =
  | { type: 'home' }
  | { type: 'tab'; tabIndex: number };

export function MobileView({ tabGroups }: MobileViewProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewState, setViewState] = useState<ViewState>({ type: 'home' });

  // カスタムイベントをリッスンしてContactタブに遷移
  useEffect(() => {
    const handleSelectContact = () => {
      // Contactタブ（インデックス3）に遷移
      setViewState({ type: 'tab', tabIndex: 3 });
      setIsMenuOpen(false);
    };

    window.addEventListener('selectContactTile', handleSelectContact);
    return () => {
      window.removeEventListener('selectContactTile', handleSelectContact);
    };
  }, []);

  const handleSectionSelect = (tabIndex: number, sectionIndex: number) => {
    // タブページに遷移（最初にクリックしたセクションのタブを開く）
    setViewState({ type: 'tab', tabIndex });
    setIsMenuOpen(false);

    // ページ遷移完了後にスクロール
    setTimeout(() => {
      const element = document.getElementById(`section-${tabIndex}-${sectionIndex}`);
      if (element) {
        const headerHeight = 73; // ヘッダーの高さ
        const backButtonHeight = 40; // 戻るボタンバーの高さ
        const totalOffset = headerHeight + backButtonHeight;

        // スクロール対象の親要素を取得
        const scrollContainer = element.closest('main');
        if (scrollContainer) {
          const elementTop = element.offsetTop;
          scrollContainer.scrollTo({
            top: elementTop - totalOffset,
            behavior: 'smooth'
          });
        }
      }
    }, 300);
  };

  const handleBack = () => {
    setViewState({ type: 'home' });
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="mobile-view-container w-full h-screen overflow-hidden bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={handleBack} className="focus:outline-none" aria-label="トップに戻る">
            <Image
              src="/images/logo_blackback.png"
              alt="Omnius"
              width={70}
              height={21}
              className="h-5 w-auto cursor-pointer"
              priority
            />
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white text-3xl focus:outline-none"
            aria-label="メニュー"
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </header>

      {/* Menu Overlay - タブごとにセクション一覧表示 */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[64px] left-0 right-0 bottom-0 bg-black/98 backdrop-blur-lg z-40 overflow-y-auto"
          >
            <div className="px-6 py-8">
              <nav className="space-y-8">
                {tabGroups.map((tabGroup, tabIndex) => (
                  <div key={tabIndex} className="space-y-3">
                    {/* タブラベル */}
                    <h3 className="text-sm uppercase tracking-widest text-cyan-400 font-bold px-2">
                      {tabGroup.tabLabel}
                    </h3>

                    {/* セクションリスト */}
                    <div className="space-y-2">
                      {tabGroup.sections.map((section, sectionIndex) => (
                        <button
                          key={sectionIndex}
                          onClick={() => handleSectionSelect(tabIndex, sectionIndex)}
                          className="w-full text-left px-6 py-3 bg-gradient-to-r from-blue-950/40 to-transparent border border-blue-500/20 rounded-lg hover:border-cyan-500/50 transition-all"
                        >
                          <span className="text-base text-white font-medium">
                            {section.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* モバイル専用タイル背景（全画面共通） */}
      <MobileTiledBackground />

      {/* Main Content */}
      <main className={`h-full overflow-y-auto ${viewState.type === 'home' ? 'pt-[73px]' : ''}`}>
        {viewState.type === 'home' && (
          /* Home Screen */
          <div className="min-h-[calc(100vh-73px)] flex flex-col justify-center items-center px-8 py-12 relative">

            {/* コンテンツ */}
            <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-4xl font-black text-center mb-6 leading-tight">
              <span className="block bg-gradient-to-t from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                全ての英知で
              </span>
              <span className="block bg-gradient-to-t from-blue-500 to-blue-400 bg-clip-text text-transparent">
                私たちの未来を
              </span>
              <span className="block bg-gradient-to-t from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                切り拓く
              </span>
            </h1>

            <div className="flex gap-6 mb-8">
              <span className="text-lg text-cyan-400 font-bold">革新し</span>
              <span className="text-lg text-cyan-400 font-bold">創造し</span>
              <span className="text-lg text-cyan-400 font-bold">先導する</span>
            </div>

            <p className="text-base text-gray-300 leading-relaxed text-center max-w-md mb-12">
              AI技術を活用した教育とDX支援を通じて<br/>
              個人と企業の可能性を最大化します。
            </p>

            <button
              onClick={() => setIsMenuOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600/75 to-cyan-500/75 text-white font-bold rounded-lg hover:from-blue-600/90 hover:to-cyan-500/90 transition-all shadow-lg shadow-cyan-500/30 backdrop-blur-sm border border-cyan-500/30"
            >
              詳しく見る
            </button>
            </div>
          </div>
        )}

        {viewState.type === 'tab' && (
          /* Tab Page - 全セクションをスクロール表示 */
          <div className="relative z-10">
            <div className="sticky top-[68px] z-20 bg-black/50 backdrop-blur-md border-b border-gray-800 px-6 py-2">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-cyan-400 font-bold hover:text-cyan-300 transition-colors text-sm"
              >
                <span className="text-base">←</span>
                <span>戻る</span>
              </button>
            </div>

            {tabGroups[viewState.tabIndex].sections.map((section, sectionIndex) => {
              // 最後のセクションの余白を統一
              const isLastSection = sectionIndex === tabGroups[viewState.tabIndex].sections.length - 1;
              const bottomPadding = isLastSection ? 'pb-12' : '';

              return (
                <div
                  key={sectionIndex}
                  id={`section-${viewState.tabIndex}-${sectionIndex}`}
                  className={`relative z-10 px-6 ${sectionIndex === 0 ? 'pt-20' : 'pt-4'} pb-4 ${bottomPadding} bg-black/50 backdrop-blur-md`}
                >
                {/* セクションヘッダー */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1">
                    {tabGroups[viewState.tabIndex].tabLabel}
                  </p>
                  <h2 className="text-xl font-black text-white pb-2 border-b border-gray-800">
                    {section.title}
                  </h2>
                </div>

                {/* モバイル用コンテンツラッパー */}
                <div
                  className="mobile-section-content"
                  onClick={(e) => {
                    // Leadership Team のカードクリック処理
                    const target = e.target as HTMLElement;
                    const card = target.closest('[data-member-name]');
                    if (card) {
                      const memberName = card.getAttribute('data-member-name');
                      // 対応する詳細セクションへスクロール（既にタブ内にいるため直接スクロール）
                      let targetSectionIndex = -1;
                      if (memberName === '宮嶋大輔') {
                        targetSectionIndex = 1;
                      } else if (memberName === '田中丈士') {
                        targetSectionIndex = 2;
                      }

                      if (targetSectionIndex !== -1) {
                        setTimeout(() => {
                          const element = document.getElementById(`section-${viewState.tabIndex}-${targetSectionIndex}`);
                          if (element) {
                            const headerHeight = 73;
                            const backButtonHeight = 40;
                            const totalOffset = headerHeight + backButtonHeight;
                            const scrollContainer = element.closest('main');
                            if (scrollContainer) {
                              const elementTop = element.offsetTop;
                              scrollContainer.scrollTo({
                                top: elementTop - totalOffset,
                                behavior: 'smooth'
                              });
                            }
                          }
                        }, 100);
                      }
                      // 吉川綜一と宮崎悠は詳細セクションがないため何もしない
                    }
                  }}
                >
                  {section.content}
                </div>
              </div>
            );
            })}
          </div>
        )}
      </main>

      <style jsx global>{`
              .mobile-view-container .mobile-section-content {
                /* 全体のスタイルリセット */
              }

              /* 2カラムレイアウト（flex + w-1/2）を縦並びに変換 */
              .mobile-view-container .mobile-section-content > div.flex:not([class*="flex-col"]) {
                flex-direction: column !important;
                height: auto !important;
              }

              .mobile-view-container .mobile-section-content > div.flex > div[class*="w-1/2"],
              .mobile-view-container .mobile-section-content > div.flex > div[class*="w-1/3"],
              .mobile-view-container .mobile-section-content > div.flex > div[class*="w-2/3"],
              .mobile-view-container .mobile-section-content > div.flex > div[class*="w-2/5"],
              .mobile-view-container .mobile-section-content > div.flex > div[class*="w-3/5"] {
                width: 100% !important;
                padding: 1.5rem 1rem !important;
                min-height: auto !important;
                height: auto !important;
              }

              /* 会社概要・ビジョンセクション専用 */
              .mobile-view-container .mobile-section-content > div.flex > div.w-1\/2.px-16 {
                padding: 1.5rem 1rem !important;
              }

              /* 背景グラデーションを削除（モバイルではシンプルに） */
              .mobile-view-container .mobile-section-content > div.flex > div[class*="bg-gradient"] {
                background: transparent !important;
              }

              /* ビジョンの大きな見出し */
              .mobile-view-container .mobile-section-content > div.flex > div h2.text-7xl {
                font-size: 2rem !important;
                line-height: 1.3 !important;
                margin-bottom: 1rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex > div h2.text-7xl span {
                font-size: 2rem !important;
              }

              /* ミッション・バリューセクション */
              .mobile-view-container .mobile-section-content > div.flex > div .space-y-12 {
                gap: 1.5rem !important;
              }

              /* 会社概要・Mission・Valueなど中央寄せセクション */
              .mobile-view-container .mobile-section-content > div[class*="justify-center"] {
                padding: 2rem 0.5rem !important;
                min-height: auto !important;
              }

              /* 通常の画像（プロフィール写真など） */
              .mobile-view-container .mobile-section-content img:not(.company-logo) {
                width: 240px !important;
                height: auto !important;
                margin-bottom: 2rem !important;
              }

              /* 会社ロゴ専用 */
              .mobile-view-container .mobile-section-content img.company-logo {
                width: 240px !important;
                height: auto !important;
                margin-bottom: 1.5rem !important;
              }

              .mobile-view-container .mobile-section-content h2,
              .mobile-view-container .mobile-section-content h3 {
                font-size: 1.5rem !important;
                line-height: 1.4 !important;
                margin-bottom: 1.5rem !important;
              }

              .mobile-view-container .mobile-section-content p {
                font-size: 0.95rem !important;
                line-height: 1.7 !important;
              }

              /* Mission/Valueのラベル */
              .mobile-view-container .mobile-section-content div[class*="uppercase"] {
                font-size: 0.75rem !important;
                margin-bottom: 0.75rem !important;
              }

              /* 左ボーダー付きコンテンツ */
              .mobile-view-container .mobile-section-content div[class*="border-l-4"] {
                padding-left: 1rem !important;
                border-left-width: 3px !important;
              }

              /* 事業内容セクション全体 */
              .mobile-view-container .mobile-section-content > div.flex-col.p-16 {
                padding: 1.5rem 1rem !important;
              }

              /* 事業内容のヘッダー */
              .mobile-view-container .mobile-section-content > div.flex-col.p-16 > div.mb-16 {
                margin-bottom: 2rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex-col.p-16 > div.mb-16 h2 {
                font-size: 2.5rem !important;
                margin-bottom: 0.5rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex-col.p-16 > div.mb-16 p:not(.mt-8) {
                font-size: 1rem !important;
              }

              /* 注釈テキストは小さく */
              .mobile-view-container .mobile-section-content p.mt-8 {
                font-size: 12px !important;
              }

              /* モバイル版のみ: グリッドの色を交互に（Who We Want, Work Environment） */
              @media (max-width: 1023px) {
                .mobile-view-container .mobile-section-content .grid.grid-cols-1 > div:nth-child(odd) {
                  background: linear-gradient(to bottom right, rgba(37, 99, 235, 0.25), rgba(30, 58, 138, 0.15)) !important;
                  border-color: rgba(59, 130, 246, 0.3) !important;
                }
                .mobile-view-container .mobile-section-content .grid.grid-cols-1 > div:nth-child(odd):hover {
                  border-color: rgba(96, 165, 250, 1) !important;
                }
                .mobile-view-container .mobile-section-content .grid.grid-cols-1 > div:nth-child(even) {
                  background: linear-gradient(to bottom right, rgba(8, 145, 178, 0.25), rgba(22, 78, 99, 0.15)) !important;
                  border-color: rgba(6, 182, 212, 0.3) !important;
                }
                .mobile-view-container .mobile-section-content .grid.grid-cols-1 > div:nth-child(even):hover {
                  border-color: rgba(34, 211, 238, 1) !important;
                }
              }

              /* モバイル版: 注釈テキストを小さく */
              .mobile-view-container .mobile-section-content p {
                font-size: inherit;
              }

              .mobile-view-container .mobile-section-content .space-y-8 > p {
                font-size: 10px !important;
                line-height: 1.4 !important;
              }

              /* Leadership Team - 名前だけシンプル表示（モバイルのみ） */
              .mobile-view-container .mobile-section-content .leadership-grid > div[data-member-name] {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 2rem 1rem !important;
                flex-direction: row !important;
              }

              /* 画像divを非表示 */
              .mobile-view-container .mobile-section-content .leadership-grid > div[data-member-name] > div[class*="w-1/3"] {
                display: none !important;
              }

              /* 内容divの設定 */
              .mobile-view-container .mobile-section-content .leadership-grid > div[data-member-name] > div.flex-1 {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 0 !important;
                width: 100% !important;
              }

              /* 内容div内のすべての要素を非表示にしてh3だけ表示 */
              .mobile-view-container .mobile-section-content .leadership-grid > div[data-member-name] > div.flex-1 > * {
                display: none !important;
              }

              .mobile-view-container .mobile-section-content .leadership-grid > div[data-member-name] > div.flex-1 > h3,
              .mobile-view-container .mobile-section-content .leadership-grid > div[data-member-name] > h3 {
                display: block !important;
                font-size: 1.75rem !important;
                margin-bottom: 0 !important;
                text-align: center !important;
                position: relative !important;
                z-index: 2 !important;
              }

              /* すべてのpタグを非表示 */
              .mobile-view-container .mobile-section-content .leadership-grid > div[data-member-name] p {
                display: none !important;
              }

              /* 背景の大文字は表示 */
              .mobile-view-container .mobile-section-content .leadership-grid > div[data-member-name] > div.absolute {
                display: block !important;
                position: absolute !important;
              }

              /* Who We Want グリッド - 縦並び（モバイルのみ） */
              .mobile-view-container .mobile-section-content .who-we-want-grid {
                display: flex !important;
                flex-direction: column !important;
                gap: 1.5rem !important;
              }

              .mobile-view-container .mobile-section-content .who-we-want-grid > div {
                width: 100% !important;
              }

              /* 色を交互に（青・シアン・青・シアン） */
              .mobile-view-container .mobile-section-content .who-we-want-grid > div:nth-child(1) {
                background: linear-gradient(to bottom right, rgba(37, 99, 235, 0.25), rgba(30, 58, 138, 0.15)) !important;
                border-color: rgba(59, 130, 246, 0.3) !important;
              }
              .mobile-view-container .mobile-section-content .who-we-want-grid > div:nth-child(1):hover {
                border-color: rgba(96, 165, 250, 1) !important;
              }

              .mobile-view-container .mobile-section-content .who-we-want-grid > div:nth-child(2) {
                background: linear-gradient(to bottom right, rgba(8, 145, 178, 0.25), rgba(22, 78, 99, 0.15)) !important;
                border-color: rgba(6, 182, 212, 0.3) !important;
              }
              .mobile-view-container .mobile-section-content .who-we-want-grid > div:nth-child(2):hover {
                border-color: rgba(34, 211, 238, 1) !important;
              }

              .mobile-view-container .mobile-section-content .who-we-want-grid > div:nth-child(3) {
                background: linear-gradient(to bottom right, rgba(37, 99, 235, 0.25), rgba(30, 58, 138, 0.15)) !important;
                border-color: rgba(59, 130, 246, 0.3) !important;
              }
              .mobile-view-container .mobile-section-content .who-we-want-grid > div:nth-child(3):hover {
                border-color: rgba(96, 165, 250, 1) !important;
              }

              .mobile-view-container .mobile-section-content .who-we-want-grid > div:nth-child(4) {
                background: linear-gradient(to bottom right, rgba(8, 145, 178, 0.25), rgba(22, 78, 99, 0.15)) !important;
                border-color: rgba(6, 182, 212, 0.3) !important;
              }
              .mobile-view-container .mobile-section-content .who-we-want-grid > div:nth-child(4):hover {
                border-color: rgba(34, 211, 238, 1) !important;
              }

              /* Work Environment グリッド - 縦並び（モバイルのみ） */
              .mobile-view-container .mobile-section-content .work-environment-grid {
                display: flex !important;
                flex-direction: column !important;
                gap: 1.5rem !important;
              }

              .mobile-view-container .mobile-section-content .work-environment-grid > div {
                width: 100% !important;
              }

              /* 色を交互に（青・シアン・青・シアン） */
              .mobile-view-container .mobile-section-content .work-environment-grid > div:nth-child(1) {
                background: linear-gradient(to bottom right, rgba(37, 99, 235, 0.25), rgba(30, 58, 138, 0.15)) !important;
                border-color: rgba(59, 130, 246, 0.3) !important;
              }
              .mobile-view-container .mobile-section-content .work-environment-grid > div:nth-child(1):hover {
                border-color: rgba(96, 165, 250, 1) !important;
              }

              .mobile-view-container .mobile-section-content .work-environment-grid > div:nth-child(2) {
                background: linear-gradient(to bottom right, rgba(8, 145, 178, 0.25), rgba(22, 78, 99, 0.15)) !important;
                border-color: rgba(6, 182, 212, 0.3) !important;
              }
              .mobile-view-container .mobile-section-content .work-environment-grid > div:nth-child(2):hover {
                border-color: rgba(34, 211, 238, 1) !important;
              }

              .mobile-view-container .mobile-section-content .work-environment-grid > div:nth-child(3) {
                background: linear-gradient(to bottom right, rgba(37, 99, 235, 0.25), rgba(30, 58, 138, 0.15)) !important;
                border-color: rgba(59, 130, 246, 0.3) !important;
              }
              .mobile-view-container .mobile-section-content .work-environment-grid > div:nth-child(3):hover {
                border-color: rgba(96, 165, 250, 1) !important;
              }

              .mobile-view-container .mobile-section-content .work-environment-grid > div:nth-child(4) {
                background: linear-gradient(to bottom right, rgba(8, 145, 178, 0.25), rgba(22, 78, 99, 0.15)) !important;
                border-color: rgba(6, 182, 212, 0.3) !important;
              }
              .mobile-view-container .mobile-section-content .work-environment-grid > div:nth-child(4):hover {
                border-color: rgba(34, 211, 238, 1) !important;
              }

              /* Leadership Team 4人のカード - 2x2グリッド（より具体的なセレクター）*/
              .mobile-view-container .mobile-section-content div[class*="grid"][class*="grid-cols-2"][class*="grid-rows"]:not(.who-we-want-grid):not(.work-environment-grid) {
                display: grid !important;
                grid-template-columns: 1fr 1fr !important;
                gap: 0.75rem !important;
              }

              /* Leadership Team カード */
              .mobile-view-container .mobile-section-content div[class*="grid"][class*="grid-cols-2"][class*="grid-rows"] > div.leadership-card {
                padding: 1.5rem 0.75rem !important;
                min-height: 100px !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                text-align: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                position: relative !important;
                width: auto !important;
              }

              /* タップ時のフィードバック */
              .mobile-view-container .mobile-section-content div[class*="grid"][class*="grid-cols-2"][class*="grid-rows"] > div.leadership-card:active {
                transform: scale(0.95) !important;
                opacity: 0.8 !important;
              }

              /* 画像エリアを非表示（宮嶋・田中のw-1/3） */
              .mobile-view-container .mobile-section-content div[class*="grid"][class*="grid-cols-2"][class*="grid-rows"] > div.leadership-card > div.w-1\/3 {
                display: none !important;
              }

              /* テキストエリア（flex-1） */
              .mobile-view-container .mobile-section-content div[class*="grid"][class*="grid-cols-2"][class*="grid-rows"] > div.leadership-card > div.flex-1 {
                width: 100% !important;
                padding: 0 !important;
                text-align: center !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
              }

              /* 名前 */
              .mobile-view-container .mobile-section-content div[class*="grid"][class*="grid-cols-2"][class*="grid-rows"] > div.leadership-card h3 {
                font-size: 1.125rem !important;
                margin-bottom: 0 !important;
                line-height: 1.4 !important;
                font-weight: 700 !important;
              }

              /* 役職（cyan-300, blue-300）と説明文を非表示 */
              .mobile-view-container .mobile-section-content div[class*="grid"][class*="grid-cols-2"][class*="grid-rows"] > div.leadership-card p {
                display: none !important;
              }

              /* 背景の大文字を非表示 */
              .mobile-view-container .mobile-section-content div[class*="grid"][class*="grid-cols-2"][class*="grid-rows"] > div.leadership-card div[class*="absolute"] {
                display: none !important;
              }

              /* 宮嶋大輔・田中丈士の個別詳細ページ: 2カラム → 縦並び */
              .mobile-view-container .mobile-section-content > div.flex.px-8 {
                flex-direction: column !important;
                padding: 0.5rem !important;
              }

              /* 左側：プロフィールエリア（w-2/5） */
              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-2/5"] {
                width: 100% !important;
                padding: 1rem 0.5rem !important;
                margin-bottom: 1rem !important;
              }

              /* プロフィール画像コンテナ */
              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-2/5"] > div.px-8 {
                padding: 0 !important;
                margin-bottom: 0.75rem !important;
              }

              /* プロフィール画像の枠 */
              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-2/5"] > div.px-8 > div {
                width: 100% !important;
                max-width: 200px !important;
                margin: 0 auto !important;
              }

              /* プロフィール画像 */
              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-2/5"] img {
                width: 100% !important;
                height: 100% !important;
                object-fit: cover !important;
              }

              /* プロフィール名前・役職・説明 */
              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-2/5"] h2 {
                font-size: 1.5rem !important;
                margin-bottom: 0.25rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-2/5"] p {
                font-size: 0.9rem !important;
                margin-bottom: 0.25rem !important;
              }

              /* 右側：実績・専門分野エリア（w-3/5） */
              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-3/5"] {
                width: 100% !important;
                padding: 0.5rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-3/5"] > div {
                gap: 1rem !important;
              }

              /* セクション見出し (Achievements, Expertise) */
              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-3/5"] h3 {
                font-size: 0.7rem !important;
                margin-bottom: 0.5rem !important;
              }

              /* 実績リスト */
              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-3/5"] ul {
                gap: 0.75rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-3/5"] ul li {
                flex-direction: column !important;
                align-items: flex-start !important;
                gap: 0.125rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-3/5"] ul li span {
                font-size: 1.5rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-3/5"] ul li p:first-of-type {
                font-size: 0.95rem !important;
                margin-bottom: 0.125rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-3/5"] ul li p:last-of-type {
                font-size: 0.8rem !important;
              }

              /* Expertiseセクション */
              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-3/5"] > div > div[class*="border-t"] {
                padding-top: 0.75rem !important;
                margin-top: 0.25rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-3/5"] > div > div[class*="border-t"] p {
                font-size: 0.85rem !important;
              }

              /* メッセージボックス */
              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-3/5"] > div > div:last-child {
                padding: 0.75rem !important;
                margin-top: 0.25rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex.px-8 > div[class*="w-3/5"] > div > div:last-child p {
                font-size: 0.9rem !important;
                line-height: 1.4 !important;
              }

              /* Application セクション（2カラム）- 縦並び */
              .mobile-view-container .mobile-section-content > div[class*="flex-row"] {
                flex-direction: column !important;
              }

              .mobile-view-container .mobile-section-content > div[class*="flex-row"] > div {
                width: 100% !important;
                padding: 1.5rem 1rem !important;
              }

              /* Application の番号と横並び要素 - 番号と内容は横並びを維持 */
              .mobile-view-container .mobile-section-content div[class*="space-y"] > div[class*="flex"][class*="gap-"] {
                flex-direction: row !important;
                align-items: flex-start !important;
                gap: 0.75rem !important;
              }

              .mobile-view-container .mobile-section-content span[class*="text-4xl"],
              .mobile-view-container .mobile-section-content span[class*="text-5xl"],
              .mobile-view-container .mobile-section-content span[class*="text-6xl"],
              .mobile-view-container .mobile-section-content span[class*="text-7xl"] {
                font-size: 2rem !important;
              }

              /* リストアイテム - 縦方向に配置 */
              .mobile-view-container .mobile-section-content ul {
                display: flex !important;
                flex-direction: column !important;
                gap: 1.25rem !important;
              }

              .mobile-view-container .mobile-section-content li {
                display: flex !important;
                flex-direction: row !important;
                align-items: flex-start !important;
                gap: 0.75rem !important;
              }

              .mobile-view-container .mobile-section-content li span:first-child {
                font-size: 1.125rem !important;
                flex-shrink: 0 !important;
                line-height: 1.5 !important;
              }

              .mobile-view-container .mobile-section-content li p {
                font-size: 1.125rem !important;
                line-height: 1.5 !important;
              }

              .mobile-view-container .mobile-section-content li > div {
                display: flex !important;
                flex-direction: column !important;
                gap: 0.25rem !important;
                flex: 1 !important;
              }

              /* Benefitsの項目タイトル（太字） */
              .mobile-view-container .mobile-section-content li > div > p:first-child,
              .mobile-view-container .mobile-section-content li > p {
                font-size: 1.125rem !important;
                line-height: 1.5 !important;
              }

              /* Benefitsの説明文（細字・グレー） */
              .mobile-view-container .mobile-section-content li > div > p:last-child {
                font-size: 0.875rem !important;
                line-height: 1.4 !important;
              }

              /* br タグを無効化（モバイルでは自然な折り返しにする） */
              .mobile-view-container .mobile-section-content br {
                display: none;
              }

              /* Application セクションの注釈文字 */
              .mobile-view-container .mobile-section-content p[class*="text-xs"][class*="text-gray-400"] {
                font-size: 0.65rem !important;
                line-height: 1.4 !important;
              }

              /* トップ画面の横並び要素も縦に */
              .mobile-view-container .mobile-section-content div[class*="flex"][class*="gap-6"] {
                flex-direction: column !important;
                gap: 1rem !important;
              }

              /* お問い合わせセクションのレイアウト調整 */
              .mobile-view-container .mobile-section-content > div.flex.p-16 {
                flex-direction: column !important;
                padding: 1rem !important;
              }

              /* お問い合わせ左側の情報エリア */
              .mobile-view-container .mobile-section-content > div.flex.p-16 > div[class*="w-1/3"] {
                width: 100% !important;
                padding: 1rem !important;
                margin-bottom: 1.5rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex.p-16 > div[class*="w-1/3"] h2 {
                font-size: 2.5rem !important;
                margin-bottom: 0.5rem !important;
              }

              .mobile-view-container .mobile-section-content > div.flex.p-16 > div[class*="w-1/3"] p {
                font-size: 1rem !important;
              }

              /* お問い合わせ右側のフォームエリア */
              .mobile-view-container .mobile-section-content > div.flex.p-16 > div[class*="w-2/3"] {
                width: 100% !important;
                padding: 0 1rem !important;
              }
            `}</style>
    </div>
  );
}
