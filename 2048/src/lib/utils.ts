import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn - 合并 Tailwind 类名工具
 * 结合 clsx（条件类名）+ tailwind-merge（去重冲突）
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
