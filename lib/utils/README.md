# Utility Functions

このディレクトリには、汎用的なユーティリティ関数を配置します。

## 概要

ユーティリティ関数は、プロジェクト全体で使用される汎用的なヘルパー関数です。副作用を持たない純粋関数として設計します。

## ガイドライン

- **純粋関数として実装**（同じ入力に対して常に同じ出力）
- **明確な型定義**（引数と戻り値の型を明示）
- **単一責任**（1つの関数は1つの機能のみ）
- **テストしやすい設計**
- **JSDocコメントを記述**

## 例

```typescript
// formatDate.ts
/**
 * 日付を指定されたフォーマットで文字列に変換する
 *
 * @param date - 変換する日付
 * @param format - フォーマット形式（デフォルト: 'YYYY-MM-DD'）
 * @returns フォーマットされた日付文字列
 *
 * @example
 * formatDate(new Date('2025-10-18'), 'YYYY年MM月DD日')
 * // => '2025年10月18日'
 */
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  // 実装
}
```

## 想定されるユーティリティ

- formatDate - 日付フォーマット
- formatCurrency - 通貨フォーマット
- cn - Tailwind CSSクラス結合
- sleep - 待機処理
- generateId - ID生成
- validateEmail - メールアドレス検証
- など
