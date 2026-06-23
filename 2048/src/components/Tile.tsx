/**
 * Tile - 单个 2048 方块（v3.0）
 *
 * 职责：
 * - 渲染一个非空格（value !== null）的方块
 * - 根据 value 自动应用经典 2048 配色
 * - 字号根据数字位数自适应（v3.0 支持按 cellSize 缩放）
 * - absolute 定位在 Board 网格内
 *
 * 设计：
 * - 接收行/列 + value + id，配合 Framer Motion layout 实现移动动画
 * - 接收 isMerged / isNew 触发额外的弹动/出现动画
 * - v3.0 合并方块附带 glow 效果
 * - v3.0 key 由父组件基于 id 设置，Tile 自身不含 key 逻辑
 */

import { motion } from 'framer-motion';
import { CONFIG, type CellValue } from '../config';

export interface TileProps {
  /** v3.0 方块唯一 id（由父组件作为 React key 使用） */
  id: number;
  /** 行索引 */
  r: number;
  /** 列索引 */
  c: number;
  /** 方块值（null 则不渲染） */
  value: CellValue;
  /** v3.0 单元格尺寸（默认 CONFIG.UI.CELL_SIZE） */
  cellSize?: number;
  /** 本次移动刚合并产生（触发 pop 动画 + glow） */
  isMerged?: boolean;
  /** 本次移动新生成（配合 initial scale 0 动画） */
  isNew?: boolean;
}

/**
 * 根据 value 读取配色
 * 已知 value 直接命中，未知（> 2048）走 SUPER
 */
export function getTileColor(value: number): { bg: string; text: string } {
  const tiles = CONFIG.COLORS.TILES as unknown as Record<
    number | 'SUPER',
    { bg: string; text: string }
  >;
  return tiles[value] ?? tiles.SUPER;
}

/** 字号自适应：位数越多字号越小（v3.0 按 cellSize 缩放） */
function getFontSize(value: number, cellSize: number): number {
  if (value < 1000) return Math.floor(cellSize * 0.45);
  if (value < 10000) return Math.floor(cellSize * 0.38);
  return Math.floor(cellSize * 0.3);
}

export function Tile({ r, c, value, cellSize, isMerged, isNew }: TileProps) {
  if (value === null) return null;

  const color = getTileColor(value);
  const size = cellSize ?? CONFIG.UI.CELL_SIZE;
  const fontSize = getFontSize(value, size);
  const gap = CONFIG.UI.GAP;

  // 绝对定位坐标
  const top = r * (size + gap);
  const left = c * (size + gap);

  return (
    <motion.div
      layout
      className="absolute flex items-center justify-center rounded-md font-bold tabular-nums select-none"
      style={{
        top,
        left,
        width: size,
        height: size,
        backgroundColor: color.bg,
        color: color.text,
        fontSize,
        // v3.0 合并方块附带 glow 效果
        boxShadow: isMerged
          ? `0 0 20px ${color.bg}, 0 2px 4px rgba(0,0,0,0.15)`
          : '0 2px 4px rgba(0,0,0,0.15)',
        zIndex: isMerged ? 2 : 1,
      }}
      // 进入动画（新生成）
      initial={isNew ? { scale: 0, top, left } : false}
      animate={{
        scale: isMerged ? [1, 1.2, 1] : 1,
        top,
        left,
      }}
      transition={{
        // 移动用 spring；弹动用 tween
        top: { type: 'spring', stiffness: 500, damping: 35 },
        left: { type: 'spring', stiffness: 500, damping: 35 },
        scale: isMerged
          ? { duration: 0.12, ease: 'easeOut' }
          : { type: 'spring', stiffness: 500, damping: 35 },
      }}
    >
      {value}
    </motion.div>
  );
}
