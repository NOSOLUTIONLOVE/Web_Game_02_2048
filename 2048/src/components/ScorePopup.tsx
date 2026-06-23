/**
 * ScorePopup - 分数飘字
 *
 * 职责：
 * - 合并方块位置浮现 "+N" 文本
 * - 向上漂浮 30px 并淡出
 * - 一次性动画，由父组件控制 popups 数组的增删
 *
 * 设计：
 * - 使用 AnimatePresence 让飘字平滑退场
 * - absolute 定位在方块中心，pointer-events-none
 */

import { motion, AnimatePresence } from 'framer-motion';

export interface ScorePopupData {
  /** 唯一标识 */
  id: number;
  /** 像素坐标 x（方块中心） */
  x: number;
  /** 像素坐标 y（方块中心） */
  y: number;
  /** 得分值 */
  value: number;
}

interface ScorePopupsProps {
  popups: ScorePopupData[];
}

export function ScorePopups({ popups }: ScorePopupsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      <AnimatePresence>
        {popups.map((popup) => (
          <motion.div
            key={popup.id}
            className="absolute text-lg font-bold text-yellow-400 select-none"
            style={{
              left: popup.x,
              top: popup.y,
              transform: 'translate(-50%, -50%)',
              textShadow: '0 2px 4px rgba(0,0,0,0.6)',
            }}
            initial={{ y: 0, opacity: 1, scale: 0.5 }}
            animate={{ y: -30, opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            +{popup.value}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
