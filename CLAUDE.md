# Omnius株式会社 ホームページ開発プロジェクト

## プロジェクト概要

このプロジェクトは、Omnius株式会社のホームページをNext.jsで開発するプロジェクトです。

本ドキュメントは、質の高いコードベースを維持し、チーム開発の効率と保守性を高めることを目的としています。特に、Claude Codeを活用した開発においても、堅牢でスケーラブルなアプリケーションを構築するための基盤となります。

---

## 技術スタック

- **フレームワーク**: Next.js 15.5.6 (App Router)
- **言語**: TypeScript 5
- **UIライブラリ**: React 19.1.0
- **スタイリング**: Tailwind CSS 4
- **リンター**: ESLint
- **フォーマッター**: Prettier（推奨）
- **ビルドツール**: Turbopack

---

## プロジェクト構成

```
homepage/
├── app/                    # App Routerのページとレイアウト
│   ├── layout.tsx          # ルートレイアウト
│   ├── page.tsx            # ホームページ
│   ├── loading.tsx         # ロード中UI
│   ├── error.tsx           # エラー処理UI
│   └── globals.css         # グローバルスタイル
├── components/             # 再利用可能なコンポーネント
│   ├── ui/                 # 基本UIコンポーネント（Button, Cardなど）
│   └── features/           # 機能別コンポーネント
├── lib/                    # ユーティリティ関数、カスタムフック
│   ├── hooks/              # カスタムフック
│   ├── utils/              # ユーティリティ関数
│   └── api/                # API通信ロジック
├── types/                  # TypeScriptの型定義
├── public/                 # 静的ファイル（画像、フォントなど）
├── .claude/                # Claude Code設定
│   └── commands/           # カスタムスラッシュコマンド
└── package.json            # 依存関係とスクリプト
```

---

## 1. 全般的な開発方針と原則

### 1.1. 簡潔性と可読性の追求（スパゲッティコード防止）

#### 関心の分離 (Separation of Concerns)

- 各コンポーネント、モジュール、ファイルは、**単一の明確な責任**を持つように設計します
- **ロジックとビューの分離**: データフェッチ、ビジネスロジック、状態管理などのロジックは、可能な限りコンポーネントの外（カスタムフック、サービス層、またはサーバーコンポーネント）に抽出します

#### DRY (Don't Repeat Yourself)

- 共通の機能やUI要素は、再利用可能なコンポーネントやユーティリティ関数として抽象化します
- 同じコードを3回以上書く場合は、必ず共通化を検討します

#### 命名規則

- **コンポーネント**: PascalCase（例: `Button.tsx`, `UserProfile.tsx`）
- **関数・変数**: camelCase（例: `getUserData`, `isLoading`）
- **定数**: UPPER_SNAKE_CASE（例: `API_BASE_URL`, `MAX_ITEMS`）
- **型・インターフェース**: PascalCase（例: `UserData`, `ApiResponse`）
- **ファイル名**:
  - コンポーネント: PascalCase（例: `Header.tsx`）
  - ユーティリティ: camelCase（例: `formatDate.ts`）
  - Next.js規約: 小文字（例: `page.tsx`, `layout.tsx`, `route.ts`）
  - テストファイル: `.test.ts` または `.test.tsx` サフィックス（例: `Button.test.tsx`）

### 1.2. Claude Codeの活用に関する取り決め

#### プロンプトの明確化

- Claude Codeにコード生成を依頼する際は、以下を明確に記述します：
  - 目的と要件
  - 必要な技術と依存関係
  - 満たすべきインターフェースやスキーマ（TypeScriptの型定義）
  - 既存のコードとの統合方法

#### レビュー必須

- Claude Codeによって生成されたコードも、**必ず人間によるレビュー**を行います
- 特に以下の観点でチェックします：
  - セキュリティ（機密情報の漏洩、XSS/CSRF対策など）
  - パフォーマンス（不要な再レンダリング、メモリリークなど）
  - Next.jsのベストプラクティスへの準拠
  - TypeScriptの型安全性

#### インターフェース定義の優先

- コンポーネントの実装を依頼する前に、**Propsの型定義を先に用意**し、明確なゴールを設定します

```typescript
// 良い例: 先に型定義を用意
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

// その後、実装を依頼
export function Button({ variant, size, onClick, disabled, children }: ButtonProps) {
  // ...
}
```

---

## 2. Next.js App Router のベストプラクティス

### 2.1. レンダリング戦略とコンポーネントの種類

#### サーバーコンポーネント (RSC) の優先

- データフェッチや機密性の高いロジックは、セキュリティとパフォーマンスの観点から、**可能な限りサーバーコンポーネント**で実行します
- サーバーコンポーネントはデフォルトで静的レンダリングされ、パフォーマンスが向上します
- APIキーやデータベース接続情報などの機密情報はサーバーコンポーネントでのみ使用します

#### クライアントコンポーネントの最小化

- `'use client'` ディレクティブは、以下の場合にのみ使用します：
  - ユーザーインタラクション（クリック、入力など）
  - ブラウザAPI（localStorage、window、documentなど）の使用
  - React Hooks（useState, useEffect, useContextなど）の使用
- クライアントコンポーネントは**コンポーネントツリーの末端近く**に配置します

```typescript
// 良い例: サーバーコンポーネントで データフェッチ
// app/users/page.tsx
async function UsersPage() {
  const users = await fetchUsers(); // サーバーサイドでフェッチ
  return <UserList users={users} />; // データを渡す
}

// components/UserList.tsx (サーバーコンポーネント)
function UserList({ users }: { users: User[] }) {
  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}

// components/UserCard.tsx (クライアントコンポーネント: インタラクションが必要)
'use client';
function UserCard({ user }: { user: User }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div onClick={() => setIsExpanded(!isExpanded)}>
      {/* ... */}
    </div>
  );
}
```

#### データの取得

- データフェッチは、ルートレイアウトやページコンポーネントなどの**サーバーコンポーネント内**で行うことを基本とします
- フェッチしたデータはPropsとして子コンポーネントに渡します
- 並列フェッチが可能な場合は、`Promise.all()` を使用して効率化します

### 2.2. ファイル構造とルーティング

#### App Router の採用

- 新規開発は `/app` ディレクトリ構造を基本とします

#### ルーティングの整理

- **ページ**: `page.tsx` - ルートのメインコンテンツ
- **レイアウト**: `layout.tsx` - 階層的なUI共有、メタデータ設定
- **ロード中UI**: `loading.tsx` - Suspense境界による自動ローディング状態
- **エラー処理**: `error.tsx` - エラーバウンダリ / `global-error.tsx` - グローバルエラー
- **Not Found**: `not-found.tsx` - 404エラーページ

#### API Route

- APIエンドポイントは `route.ts` ファイルで管理します
- 外部APIとの通信やデータ操作に特化させます
- RESTful な設計を心がけます

```typescript
// app/api/users/route.ts
export async function GET(request: Request) {
  const users = await db.user.findMany();
  return Response.json(users);
}

export async function POST(request: Request) {
  const data = await request.json();
  const user = await db.user.create({ data });
  return Response.json(user, { status: 201 });
}
```

---

## 3. TypeScriptとコード品質

### 3.1. 型定義の徹底

#### TypeScriptの利用

- すべてのファイルでTypeScript（`.ts`/`.tsx`）を使用します
- `any` 型の使用は**極力避け**、やむを得ない場合は `unknown` を検討します

#### 明示的な型定義

- Props、Hooksの戻り値、APIレスポンスのデータ構造など、すべてのインターフェースや型を**明示的に定義**します
- 関数の**戻り値の型も明示的に指定**することを推奨します（型推論に頼りすぎない）

```typescript
// 良い例
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface UserCardProps {
  user: User;
  onSelect?: (userId: string) => void;
}

// 戻り値の型も明示
function getUserById(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then((res) => res.json());
}

// 悪い例
function UserCard(props: any) {
  // ❌ any は避ける
  // ...
}

function getUser(id: string) {
  // ⚠️ 戻り値の型が不明瞭
  return fetch(`/api/users/${id}`).then((res) => res.json());
}
```

#### 型の再利用

- 共通の型定義は `types/` ディレクトリに集約します
- API レスポンスの型は実際のレスポンス構造と一致させます

#### エラー処理とstrict mode

- `tsconfig.json` で TypeScript の **strict mode** を有効にします
- エラーハンドリングでは、`unknown` 型を活用して型安全なエラー処理を行います

```typescript
// 良い例: 型安全なエラー処理
try {
  await riskyOperation();
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('Unknown error occurred');
  }
}
```

### 3.2. LintとFormatter

#### ESLintの導入と設定

- Next.jsの推奨ルールセット（`eslint-config-next`）を使用します
- 追加のルール：
  - Hooksの依存配列の厳格化（`react-hooks/exhaustive-deps`）
  - 未使用変数の検出（`@typescript-eslint/no-unused-vars`）
  - 一貫性のあるimport順序（`import/order` または `simple-import-sort`）

#### Prettierの導入

- コードの自動整形を行い、チーム全体でのコードの視覚的な一貫性を保ちます
- **推奨設定**：
  - **セミコロン**: 必須（あり）
  - **クォート**: シングルクォート
  - **インデント**: 2スペース
  - **末尾カンマ**: あり（ES5互換）
  - **行の最大長**: 80-100文字

#### インポートスタイル

- **ESモジュール**スタイルを使用します
- インポートを論理的にグループ化し、一貫した順序を保ちます：
  1. 外部ライブラリ（React, Next.jsなど）
  2. 内部モジュール（`@/` エイリアスを使用）
  3. 相対パスインポート
  4. スタイル・CSS

```typescript
// 良い例: 整理されたインポート
import React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';
import { fetchUser } from '@/lib/api/user';

import { UserCard } from './UserCard';
import styles from './page.module.css';
```

#### コミット前のチェック

- Git hooks（husky + lint-staged）を使用して、コミット前に自動的にlintとformatを実行します

---

## 4. コンポーネント設計の規範

### 4.1. コンポーネントの分類

#### Presentational（表示系）コンポーネント

- **責務**: スタイルとレイアウトのみを担当
- **特徴**:
  - Propsを通じてデータを受け取る
  - 状態管理やビジネスロジックを持たない
  - 再利用性が高い
- **例**: Button, Card, Typography, Icon

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline';
  size: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Button({ variant, size, onClick, disabled, children }: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

#### Container（コンテナ/ロジック系）コンポーネント

- **責務**: データフェッチや状態管理などのロジックを担当
- **特徴**:
  - ロジックの結果をPresentationalコンポーネントに渡す
  - App Routerでは、主に**サーバーコンポーネント**やカスタムフックがこの役割を担う

```typescript
// app/users/page.tsx (Container)
async function UsersPage() {
  const users = await fetchUsers(); // ロジック
  return <UserList users={users} />; // Presentationalに渡す
}
```

### 4.2. Hooksの活用

#### カスタムフックの作成

- 複数のコンポーネントで共有される複雑なロジックは、**カスタムフック**として抽象化します
- 例: フォーム処理、認証状態、外部API連携、ローカルストレージ操作

```typescript
// lib/hooks/useUser.ts
export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { user, loading, error };
}
```

#### 依存配列の正確性

- `useEffect`、`useCallback`、`useMemo` などのHooksを使用する際は、**依存配列を正確に指定**します
- ESLintの `react-hooks/exhaustive-deps` ルールに従います
- 意図しない再実行や無限ループを防ぎます

---

## 5. 環境構築とセキュリティ

### 5.1. 環境変数

#### 命名規則

- **公開可能な環境変数**: `NEXT_PUBLIC_` プレフィックスを付けます
  - 例: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_NAME`
  - これらはクライアントサイドでアクセス可能になります

#### 機密情報の保護

- **機密性の高い情報**（APIキー、DB接続情報、秘密鍵など）は、`NEXT_PUBLIC_` プレフィックスを**付けません**
- これらは**サーバーサイドでのみ**使用します
- クライアントコンポーネントやブラウザでアクセスしてはなりません

```bash
# .env.local

# ✅ サーバーサイドのみ（機密情報）
DATABASE_URL="postgresql://..."
API_SECRET_KEY="secret_key_here"

# ✅ クライアントサイドでも利用可能（公開情報）
NEXT_PUBLIC_API_URL="https://api.example.com"
NEXT_PUBLIC_SITE_NAME="Omnius株式会社"
```

#### .env.localの管理

- `.env.local` はGitにコミットしません（`.gitignore`に追加済み）
- `.env.example` を用意して、必要な環境変数のテンプレートを共有します

### 5.2. パフォーマンス

#### 画像の最適化

- Next.jsの `<Image>` コンポーネントを使用します
- 自動で以下の最適化が行われます：
  - 遅延ロード（Lazy Loading）
  - サイズ最適化
  - WebP/AVIF への変換
  - レスポンシブ画像の生成

```tsx
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="ヒーロー画像"
  width={800}
  height={600}
  priority // Above the fold の画像は優先ロード
/>;
```

#### バンドルサイズの監視

- 不要な依存関係や大きなライブラリの導入を避けます
- `@next/bundle-analyzer` を使用してバンドルサイズを定期的にチェックします
- Dynamic Imports を活用して、必要な時だけコードを読み込みます

```typescript
// 動的インポートの例
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // クライアントサイドでのみロード
});
```

#### メモ化の活用

- 重い計算は `useMemo` でメモ化します
- コールバック関数は `useCallback` でメモ化します
- ただし、過度な最適化は避け、実際のパフォーマンス問題が発生した時に対処します

---

## 6. テストとビルド

### 6.1. テストの配置と実行

#### テストファイルの配置

- テストファイルは、テスト対象のソースファイルと**同じディレクトリ**に配置します
- テストファイル名には `.test.ts` または `.test.tsx` サフィックスを使用します

```
components/
├── ui/
│   ├── Button.tsx
│   └── Button.test.tsx      # Buttonコンポーネントのテスト
└── features/
    ├── UserCard.tsx
    └── UserCard.test.tsx    # UserCardコンポーネントのテスト
```

#### テストの命名

- テスト名は**説明的**にし、何をテストしているのか明確にします
- テストケースは Given-When-Then パターンを推奨します

```typescript
// 良い例: 説明的なテスト名
describe('Button', () => {
  it('should render primary variant with correct styling', () => {
    // テストコード
  });

  it('should call onClick handler when clicked', () => {
    // テストコード
  });

  it('should be disabled when disabled prop is true', () => {
    // テストコード
  });
});
```

### 6.2. 利用可能なコマンド

```bash
# 開発
npm run dev      # 開発サーバーを起動（http://localhost:3000）

# ビルドと本番実行
npm run build    # プロダクションビルド
npm start        # プロダクションサーバーを起動

# コード品質
npm run lint     # ESLintでコードをチェック

# テスト（将来的に追加予定）
npm test                        # すべてのテストを実行
npm test -- path/to/file.test.ts # 特定のテストファイルを実行
npm test -- -t "テスト名"        # パターンに一致するテストを実行
```

---

## 7. Claude Codeとの開発

このプロジェクトはClaude Codeを使用して開発されています。

### カスタムスラッシュコマンド

- `/dev` - 開発サーバーを起動
- `/build` - プロダクションビルドを実行
- `/preview` - ビルド後にプレビューサーバーを起動
- `/lint` - ESLintでコードをチェック
- `/component` - 新しいReactコンポーネントを作成
- `/page` - 新しいページを作成

---

## 8. 開発フロー

### 新機能開発の流れ

1. **要件定義**: 実装する機能の要件を明確化
2. **型定義**: 必要な TypeScript の型・インターフェースを定義
3. **コンポーネント設計**: Server/Client の分離、再利用性を考慮
4. **実装**: ベストプラクティスに従って実装
5. **Lint/Format**: `npm run lint` でコードチェック
6. **テスト**: 動作確認（開発サーバーで確認）
7. **レビュー**: コードレビュー（Claude Code生成コードも含む）
8. **コミット**: 意味のあるコミットメッセージで Git にコミット

### コミットメッセージ規約

以下のプレフィックスを使用することを推奨します：

- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` コードフォーマット（機能に影響しない変更）
- `refactor:` リファクタリング
- `perf:` パフォーマンス改善
- `test:` テスト追加・修正
- `chore:` ビルドプロセスやツールの変更

---

## 9. 注意事項とチェックリスト

### コミット前チェックリスト

- [ ] `npm run lint` でエラーがないか確認
- [ ] TypeScriptの型エラーがないか確認
- [ ] 不要な `console.log` や `debugger` を削除
- [ ] 機密情報（APIキー、パスワードなど）が含まれていないか確認
- [ ] `any` 型を乱用していないか確認
- [ ] Server/Client コンポーネントを適切に使い分けているか確認

### セキュリティチェック

- 機密情報は環境変数（`NEXT_PUBLIC_` なし）で管理
- ユーザー入力は適切にバリデーション・サニタイズ
- APIエンドポイントは適切な認証・認可を実装
- CORS設定を適切に行う

### パフォーマンスチェック

- 画像は `<Image>` コンポーネントを使用
- 大きなライブラリは Dynamic Import を検討
- 不要な再レンダリングを避ける（React DevTools で確認）
- バンドルサイズを定期的に監視

---

## 10. JSDocとコメント

### 10.1. JSDocの使用

- **公開API**（再利用可能なコンポーネント、ユーティリティ関数、型）には、JSDocコメントを記述します
- JSDocは、IDEの補完やドキュメント生成に役立ちます

```typescript
/**
 * ユーザー情報を取得する
 *
 * @param userId - ユーザーID
 * @returns ユーザー情報を含むPromise
 * @throws {Error} ユーザーが見つからない場合
 *
 * @example
 * const user = await getUserById('123');
 * console.log(user.name);
 */
export async function getUserById(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error(`User not found: ${userId}`);
  }
  return response.json();
}
```

### 10.2. インラインコメント

- **複雑なロジック**や**直感的でないコード**には、インラインコメントを追加します
- コメントは「なぜ（Why）」を説明し、「何を（What）」はコード自体で表現します

```typescript
// 良い例: なぜこの処理が必要かを説明
// ユーザーの最終ログイン時刻が24時間以上前の場合、セッションを更新する
if (Date.now() - user.lastLoginAt > 24 * 60 * 60 * 1000) {
  await refreshSession(user.id);
}

// 悪い例: コードの内容をそのまま説明（冗長）
// ユーザーIDでユーザーを取得する
const user = await getUserById(userId);
```

---

## 11. プロジェクト要件

### 11.1. Node.js バージョン

- **Node.js 18以上**を使用します
- プロジェクトの `.nvmrc` または `package.json` の `engines` フィールドでバージョンを指定します

### 11.2. ブラウザサポート

- モダンブラウザ（Chrome、Firefox、Safari、Edge）の最新2バージョンをサポート
- Internet Explorer はサポート対象外
