/**
 * 2048 Web - 全局配置（v3.0）
 *
 * 所有可调参数集中在此处，单一数据源原则
 * 含 Zod schema 用于运行时校验
 */

import { z } from 'zod';

/**
 * Zod schema - 用于校验配置 / 表单
 */
export const gameConfigSchema = z.object({
  grid: z.object({
    size: z.number().int().positive(), // 4
  }),
  spawn: z.object({
    probTwo: z.number().min(0).max(1), // 0.9
    probFour: z.number().min(0).max(1), // 0.1
  }),
  score: z.object({
    winValue: z.number().int().positive(), // 2048
  }),
  history: z.object({
    maxSize: z.number().int().positive(), // 10
  }),
  touch: z.object({
    threshold: z.number().int().positive(), // 30
  }),
  // v3.0 新增字段
  gridSize: z.union([z.literal(4), z.literal(5), z.literal(6)]),
  theme: z.union([z.literal('classic'), z.literal('neon'), z.literal('minimal')]),
  volume: z.number().min(0).max(100),
  undoLimit: z.number().int().positive(),
});

export type GameConfig = z.infer<typeof gameConfigSchema>;

/**
 * 配置常量
 */
export const CONFIG = {
  GRID: { SIZE: 4 },

  SPAWN: { PROB_TWO: 0.9, PROB_FOUR: 0.1 },

  SCORE: { WIN_VALUE: 2048 },

  HISTORY: { MAX_SIZE: 10 },

  TOUCH: { THRESHOLD: 30 },

  // v3.0 可选网格尺寸（含胜利目标值与标签）
  GRID_SIZES: {
    4: { size: 4, winValue: 2048, label: '4×4 经典' },
    5: { size: 5, winValue: 4096, label: '5×5 宽敞' },
    6: { size: 6, winValue: 8192, label: '6×6 挑战' },
  } as const,

  // v3.0 撤销次数可选档位
  UNDO_LIMITS: [5, 10, 20] as const,

  // v3.0 主题配色
  THEMES: {
    classic: {
      name: '经典暖色',
      boardBg: '#bbada0',
      empty: 'rgba(238, 228, 218, 0.35)',
      pageBg: 'hsl(240 10% 3.9%)',
      pageText: 'hsl(0 0% 98%)',
    },
    neon: {
      name: '暗夜霓虹',
      boardBg: '#1a1a2e',
      empty: 'rgba(100, 100, 200, 0.2)',
      pageBg: 'hsl(260 50% 4%)',
      pageText: 'hsl(280 50% 90%)',
    },
    minimal: {
      name: '纯净极简',
      boardBg: '#e5e5e5',
      empty: 'rgba(0, 0, 0, 0.08)',
      pageBg: 'hsl(0 0% 98%)',
      pageText: 'hsl(0 0% 10%)',
    },
  } as const,

  // 网格 UI 尺寸（px），供 Board/Tile 共同使用
  UI: {
    CELL_SIZE: 80,
    GAP: 8,
    PADDING: 8, // 外层内边距（不算 GAP）
  },

  // 经典 2048 配色（方块区使用，UI 外层用 Tailwind 紫调）
  COLORS: {
    BG: '#faf8ef',
    EMPTY: 'rgba(238, 228, 218, 0.35)', // #cdc1b4 半透明
    GRID_BG: '#bbada0',
    TEXT_DARK: '#776e65',
    TEXT_LIGHT: '#f9f6f2',
    TILES: {
      2: { bg: '#eee4da', text: '#776e65' },
      4: { bg: '#ede0c8', text: '#776e65' },
      8: { bg: '#f2b179', text: '#f9f6f2' },
      16: { bg: '#f59563', text: '#f9f6f2' },
      32: { bg: '#f67c5f', text: '#f9f6f2' },
      64: { bg: '#f65e3b', text: '#f9f6f2' },
      128: { bg: '#edcf72', text: '#f9f6f2' },
      256: { bg: '#edcc61', text: '#f9f6f2' },
      512: { bg: '#edc850', text: '#f9f6f2' },
      1024: { bg: '#edc53f', text: '#f9f6f2' },
      2048: { bg: '#edc22e', text: '#f9f6f2' },
      // v3.0 扩展高阶方块配色
      4096: { bg: '#3c3a32', text: '#f9f6f2' },
      8192: { bg: '#4a3c6e', text: '#f9f6f2' },
      16384: { bg: '#2d4a6e', text: '#f9f6f2' },
      32768: { bg: '#2d6e4a', text: '#f9f6f2' },
      65536: { bg: '#6e2d4a', text: '#f9f6f2' },
      SUPER: { bg: '#3c3a32', text: '#f9f6f2' }, // 65536+ 兜底
    },
  },

  STORAGE_KEY: 'game2048:highScore',
} as const;

/**
 * 游戏阶段（替代旧 GameState 枚举）
 * v3.0 新增 'countdown' 倒计时阶段
 */
export type GamePhase = 'menu' | 'countdown' | 'playing' | 'paused' | 'won' | 'over';

/**
 * 方向
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * 棋盘格的值（null = 空格）
 */
export type CellValue = number | null;

/**
 * 4×4 网格
 */
export type Grid = CellValue[][];

/**
 * v3.0 主题名称
 */
export type ThemeName = 'classic' | 'neon' | 'minimal';

/**
 * v3.0 网格尺寸
 */
export type GridSize = 4 | 5 | 6;

/**
 * 网格快照（用于撤销）
 * v3.0 新增 tileIds 字段，追踪方块唯一标识
 */
export interface GridSnapshot {
  grid: Grid;
  tileIds: number[][];
  score: number;
  moves: number;
}
