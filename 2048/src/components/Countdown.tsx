/**
 * Countdown - 开局倒计时遮罩
 *
 * 职责：
 * - 在游戏开始前显示 3-2-1-GO 大数字倒计时
 * - 每秒切换一个数字，配合 scale + opacity 动画
 * - 全屏半透明遮罩，不阻挡下层交互（pointer-events-none）
 *
 * 设计：
 * - 通过 value prop 控制显示内容（3/2/1/0(GO)/null）
 * - 使用 AnimatePresence + key={value} 让每个数字独立进出场
 */

import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
  /** 倒计时值：3/2/1/0(GO)/null(不显示) */
  value: number | null;
}

export function Countdown({ value }: CountdownProps) {
  // value === null → 不渲染
  if (value === null) return null;

  // value === 0 → 显示 "GO"，否则显示数字
  const display = value === 0 ? 'GO' : String(value);

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-black/40 rounded-lg" />

      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          className="relative text-8xl font-extrabold tabular-nums text-primary text-glow select-none"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {display}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
