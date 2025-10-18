# Feature Components

このディレクトリには、機能別の複合コンポーネントを配置します。

## 概要

Featureコンポーネントは、複数のUIコンポーネントを組み合わせて、特定の機能を実現するコンポーネントです。ビジネスロジックを含む場合があります。

## ガイドライン

- **特定の機能に特化したコンポーネント**
- **UIコンポーネントを組み合わせて構成**
- **ロジックはカスタムフックまたはサーバーコンポーネントで管理**
- **ページ固有のコンポーネントはページディレクトリ内に配置**

## 例

```typescript
// Header.tsx - サイト全体で使用するヘッダー
import { Button } from '@/components/ui/Button';
import { Navigation } from './Navigation';

export function Header() {
  return (
    <header className="...">
      <Navigation />
      <Button variant="primary">お問い合わせ</Button>
    </header>
  );
}
```

## 想定されるコンポーネント

- Header - ヘッダー
- Footer - フッター
- Navigation - ナビゲーション
- ContactForm - お問い合わせフォーム
- NewsSection - ニュースセクション
- など
