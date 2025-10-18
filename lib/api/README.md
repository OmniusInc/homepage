# API Communication Layer

このディレクトリには、API通信に関するロジックを配置します。

## 概要

API通信層は、外部APIやバックエンドとの通信を抽象化し、コンポーネントから分離します。データフェッチ、エラーハンドリング、認証処理などを集約します。

## ガイドライン

- **サーバーコンポーネントでの使用を優先**
- **型安全なAPI通信**（レスポンスの型を定義）
- **エラーハンドリングを適切に実装**
- **環境変数でAPIエンドポイントを管理**
- **再試行ロジックやキャッシュ戦略を実装**

## 例

```typescript
// user.ts
import { User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

/**
 * ユーザー情報を取得する
 *
 * @param userId - ユーザーID
 * @returns ユーザー情報
 * @throws {Error} APIエラーの場合
 */
export async function fetchUser(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 }, // Next.js キャッシュ設定
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  return response.json();
}
```

## 想定されるAPIファイル

- user.ts - ユーザー関連API
- auth.ts - 認証関連API
- content.ts - コンテンツ取得API
- contact.ts - お問い合わせAPI
- など
