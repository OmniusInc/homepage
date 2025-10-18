# UI Components

このディレクトリには、再利用可能な基本UIコンポーネントを配置します。

## 概要

UIコンポーネントは、Presentational（表示系）コンポーネントとして設計され、スタイルとレイアウトのみを担当します。状態管理やビジネスロジックは持ちません。

## ガイドライン

- **Propsを通じてデータを受け取る**
- **型定義を明確にする**（TypeScriptインターフェース必須）
- **Server Componentとして実装**（インタラクションが必要な場合のみClient Component）
- **Tailwind CSSでスタイリング**

## 例

```typescript
// Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant, size, children }: ButtonProps) {
  return (
    <button className={`btn btn-${variant} btn-${size}`}>
      {children}
    </button>
  );
}
```

## 想定されるコンポーネント

- Button - ボタン
- Card - カード
- Input - 入力フィールド
- Typography - テキスト表示
- Icon - アイコン
- Badge - バッジ
- Avatar - アバター
- など
