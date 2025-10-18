# TypeScript Type Definitions

このディレクトリには、プロジェクト全体で使用する共通の型定義を配置します。

## 概要

型定義ファイルは、TypeScriptの型安全性を保ち、コンポーネント間でのデータ構造を明確にするために使用します。

## ガイドライン

- **明確で説明的な型名を使用**（PascalCase）
- **インターフェースと型エイリアスを適切に使い分ける**
  - 拡張可能なオブジェクト構造: `interface`
  - ユニオン型やプリミティブ型: `type`
- **JSDocコメントで説明を追加**
- **必須・オプションを明確に**（`?`オプショナル演算子の使用）
- **API レスポンスの型は実際の構造と一致させる**

## 例

```typescript
// index.ts
/**
 * ユーザー情報
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
}

/**
 * ボタンのバリアント
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

/**
 * サイズ
 */
export type Size = 'sm' | 'md' | 'lg';
```

## ファイル構成

- `index.ts` - 共通型定義のエクスポート
- `user.ts` - ユーザー関連の型
- `api.ts` - API関連の型
- `components.ts` - コンポーネントProps関連の型
- など、ドメインごとにファイルを分割
