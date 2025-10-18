# Custom Hooks

このディレクトリには、カスタムフックを配置します。

## 概要

カスタムフックは、複数のコンポーネントで共有される複雑なロジックを抽象化し、再利用性を高めるための関数です。

## ガイドライン

- **`use`プレフィックスで命名**（例: `useUser`, `useForm`）
- **Client Componentでのみ使用可能**
- **依存配列を正確に指定**
- **型定義を明確にする**
- **単一責任の原則を守る**

## 例

```typescript
// useLocalStorage.ts
'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useEffect(() => {
    const item = localStorage.getItem(key);
    if (item) {
      setValue(JSON.parse(item));
    }
  }, [key]);

  const setStoredValue = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue] as const;
}
```

## 想定されるカスタムフック

- useLocalStorage - ローカルストレージ管理
- useMediaQuery - レスポンシブ対応
- useDebounce - デバウンス処理
- useForm - フォーム管理
- useFetch - データフェッチ（Client Component用）
- など
