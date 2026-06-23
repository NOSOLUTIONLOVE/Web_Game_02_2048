/**
 * storage - localStorage 安全封装
 *
 * - 静默吞掉异常（隐私模式 / 配额超限）
 * - 自动 JSON 序列化/反序列化
 * - 泛型支持强类型
 */

export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 静默失败（隐私模式、配额超限）
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // 静默失败
    }
  },
};
