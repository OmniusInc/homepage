import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSクラスを結合し、競合を解決するユーティリティ関数
 *
 * clsxとtailwind-mergeを組み合わせて、条件付きクラスの適用と
 * Tailwindクラスの競合を自動的に解決します。
 *
 * @param inputs - 結合するクラス名（文字列、配列、オブジェクトなど）
 * @returns 結合されたクラス名文字列
 *
 * @example
 * cn('px-4 py-2', 'bg-blue-500')
 * // => 'px-4 py-2 bg-blue-500'
 *
 * @example
 * cn('px-4', condition && 'px-8') // conditionがtrueの場合、px-8が優先される
 * // => 'px-8'
 *
 * @example
 * cn('text-red-500', { 'text-blue-500': isActive })
 * // => isActiveがtrueなら 'text-blue-500', falseなら 'text-red-500'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
