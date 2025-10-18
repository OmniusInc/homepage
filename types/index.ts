/**
 * 共通型定義
 *
 * プロジェクト全体で使用される共通の型定義をエクスポートします。
 */

/**
 * サイズの種類
 */
export type Size = 'sm' | 'md' | 'lg';

/**
 * ボタンのバリアント
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * APIレスポンスの共通構造
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

/**
 * ページネーション情報
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * メタデータ（OGP、SEO用）
 */
export interface SiteMetadata {
  title: string;
  description: string;
  url: string;
  image?: string;
  keywords?: string[];
}
